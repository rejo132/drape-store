import { NextResponse } from "next/server";
import { z } from "zod";

import { getOrCreateStripeCustomerByEmail } from "@/lib/stripe-customer";
import { getStripeServer } from "@/lib/stripe";

const setupIntentSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = setupIntentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email, name } = parsed.data;

  try {
    const customerId = await getOrCreateStripeCustomerByEmail(email, name);

    const setupIntent = await getStripeServer().setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    if (!setupIntent.client_secret) {
      return NextResponse.json(
        { error: "Failed to create setup intent" },
        { status: 500 }
      );
    }

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("setup-intent error:", error);
    return NextResponse.json(
      { error: "Failed to create setup intent" },
      { status: 500 }
    );
  }
}
