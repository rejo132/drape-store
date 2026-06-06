import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { requireSession, unauthorizedResponse } from "@/lib/api-auth";
import { calculateOrderTotal } from "@/lib/checkout";
import { prisma } from "@/lib/db";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
import { getStripeServer } from "@/lib/stripe";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string(),
  price: z.number(),
  size: z.string().min(1),
  quantity: z.number().int().positive(),
  image: z.string(),
});

const chargeSchema = z.object({
  paymentMethodId: z.string().min(1),
  items: z.array(cartItemSchema).min(1),
});

type ValidatedLineItem = {
  productId: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return unauthorizedResponse();
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { success: false, error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = chargeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { paymentMethodId, items } = parsed.data;

  try {
    const stripeCustomerId = await getOrCreateStripeCustomer(session.user.id);

    const stripe = getStripeServer();
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment method does not belong to this account",
        },
        { status: 403 }
      );
    }

    const productIds = Array.from(
      new Set(items.map((item) => item.productId))
    );
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));
    const lineItems: ValidatedLineItem[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (!product.sizes.includes(item.size)) {
        return NextResponse.json(
          { success: false, error: `Invalid size for ${product.name}` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${product.name}`,
          },
          { status: 400 }
        );
      }

      lineItems.push({
        productId: product.id,
        size: item.size,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    const subtotal = lineItems.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0
    );
    const amount = calculateOrderTotal(subtotal);

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order total" },
        { status: 400 }
      );
    }

    const returnUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/orders`;

    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        customer: stripeCustomerId,
        payment_method: paymentMethodId,
        confirm: true,
        off_session: true,
        return_url: returnUrl,
      });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeCardError) {
        return NextResponse.json({
          success: false,
          error: error.message ?? "Your card was declined.",
        });
      }

      if (error instanceof Stripe.errors.StripeError) {
        return NextResponse.json({
          success: false,
          error: error.message ?? "Payment failed",
        });
      }

      throw error;
    }

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({
        success: false,
        error: "Payment could not be completed. Please try another card.",
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const lineItem of lineItems) {
        await tx.product.update({
          where: { id: lineItem.productId },
          data: { stock: { decrement: lineItem.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          status: "paid",
          total: amount,
          stripePaymentId: paymentIntent.id,
          items: {
            create: lineItems.map((lineItem) => ({
              productId: lineItem.productId,
              size: lineItem.size,
              quantity: lineItem.quantity,
              price: lineItem.unitPrice,
            })),
          },
        },
      });
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("charge error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
