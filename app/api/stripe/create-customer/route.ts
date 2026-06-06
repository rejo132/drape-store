import { NextResponse } from "next/server";

import {
  requireSession,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";

export async function POST() {
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.stripeCustomerId) {
      return NextResponse.json({ customerId: user.stripeCustomerId });
    }

    const customerId = await getOrCreateStripeCustomer(session.user.id);
    return NextResponse.json({ customerId });
  } catch (error) {
    console.error("create-customer error:", error);
    return serverErrorResponse("Failed to create Stripe customer");
  }
}
