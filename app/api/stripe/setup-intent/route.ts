import { NextResponse } from "next/server";

import {
  requireSession,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api-auth";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
import { getStripeServer } from "@/lib/stripe";

export async function POST() {
  const session = await requireSession();
  if (!session) {
    return unauthorizedResponse();
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return serverErrorResponse("Stripe is not configured");
  }

  try {
    const customerId = await getOrCreateStripeCustomer(session.user.id);

    const setupIntent = await getStripeServer().setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    if (!setupIntent.client_secret) {
      return serverErrorResponse("Failed to create setup intent");
    }

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("setup-intent error:", error);
    return serverErrorResponse("Failed to create setup intent");
  }
}
