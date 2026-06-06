import Link from "next/link";
import { redirect } from "next/navigation";

import { AddCardForm } from "@/components/add-card-form";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Add Card | DRAPE",
};

export default async function AddCardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/checkout/add-card");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Add a payment method
        </h1>
        <p className="text-sm text-muted-foreground">
          Save your card securely with Stripe. You won&apos;t be charged now —
          this only stores your card for checkout.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <AddCardForm />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/checkout" className="underline underline-offset-4">
          Back to checkout
        </Link>
      </p>
    </main>
  );
}
