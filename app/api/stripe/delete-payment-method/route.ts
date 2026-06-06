import { NextResponse } from "next/server";
import { z } from "zod";

import {
  requireSession,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { getStripeServer } from "@/lib/stripe";

const deleteSchema = z.object({
  paymentMethodId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) {
    return unauthorizedResponse();
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return serverErrorResponse("Stripe is not configured");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment method ID" }, { status: 400 });
  }

  const { paymentMethodId } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      );
    }

    const stripe = getStripeServer();
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (paymentMethod.customer !== user.stripeCustomerId) {
      return NextResponse.json(
        { error: "Payment method does not belong to this customer" },
        { status: 403 }
      );
    }

    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete-payment-method error:", error);
    return serverErrorResponse("Failed to delete payment method");
  }
}
