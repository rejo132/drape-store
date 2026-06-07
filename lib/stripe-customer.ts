import { getStripeServer } from "@/lib/stripe";

export async function getOrCreateStripeCustomerByEmail(
  email: string,
  name?: string | null
): Promise<string> {
  const stripe = getStripeServer();
  const existing = await stripe.customers.list({ email, limit: 1 });

  if (existing.data[0]) {
    return existing.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
  });

  return customer.id;
}
