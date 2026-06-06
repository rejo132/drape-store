import { redirect } from "next/navigation";

import { CheckoutContent } from "@/components/checkout-content";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Checkout | DRAPE",
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/checkout");
  }

  return <CheckoutContent />;
}
