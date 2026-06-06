import { NextResponse } from "next/server";

import {
  requireSession,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { getStripeServer } from "@/lib/stripe";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return unauthorizedResponse();
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return serverErrorResponse("Stripe is not configured");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json([]);
    }

    const paymentMethods = await getStripeServer().paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    const methods = paymentMethods.data.map((method) => ({
      id: method.id,
      brand: method.card?.brand ?? "unknown",
      last4: method.card?.last4 ?? "",
      expMonth: method.card?.exp_month ?? 0,
      expYear: method.card?.exp_year ?? 0,
    }));

    return NextResponse.json(methods);
  } catch (error) {
    console.error("payment-methods error:", error);
    return serverErrorResponse("Failed to list payment methods");
  }
}
