"use client";

import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe-client";

const cardElementOptions: StripeCardElementOptions = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#171717",
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      "::placeholder": {
        color: "#a3a3a3",
      },
    },
    invalid: {
      color: "#dc2626",
    },
  },
};

function CardSetupForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card form is not ready. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/setup-intent", {
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to initialize card setup");
      }

      const { clientSecret } = (await response.json()) as {
        clientSecret: string;
      };

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Card setup failed");
      }

      router.push("/checkout");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="card-element"
          className="text-sm font-medium text-foreground"
        >
          Card details
        </label>
        <div
          id="card-element"
          className="rounded-lg border border-border bg-background px-4 py-3"
        >
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          size="lg"
          className="flex-1"
          disabled={!stripe || !elements || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving card...
            </>
          ) : (
            "Save card"
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isLoading}
          render={<Link href="/checkout" />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddCardForm() {
  const [stripePromise] = useState(() => getStripe());

  return (
    <Elements stripe={stripePromise}>
      <CardSetupForm />
    </Elements>
  );
}
