"use client";

import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import { Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SavedCard } from "@/components/saved-card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { getShippingCost } from "@/lib/checkout";
import { formatPrice } from "@/lib/format-price";
import { loadGuestInfo, saveGuestInfo } from "@/lib/guest-storage";
import { usePaymentMethods } from "@/lib/hooks/use-payment-methods";
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

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, subtotal, isHydrated, clearCart } = useCart();
  const { methods, loading, deleteMethod, saveMethod } = usePaymentMethods();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [guestHydrated, setGuestHydrated] = useState(false);

  useEffect(() => {
    const guest = loadGuestInfo();
    if (guest) {
      setName(guest.name);
      setEmail(guest.email);
    }
    setGuestHydrated(true);
  }, []);

  useEffect(() => {
    if (methods.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !methods.some((method) => method.id === selectedId)) {
      setSelectedId(methods[0].id);
    }
  }, [methods, selectedId]);

  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;
  const usingNewCard = methods.length === 0;
  const canPay =
    guestHydrated &&
    isHydrated &&
    items.length > 0 &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    !loading &&
    !isPaying &&
    (usingNewCard ? Boolean(stripe && elements) : selectedId !== null);

  async function handlePayNow() {
    if (!canPay) {
      return;
    }

    setIsPaying(true);
    setPaymentError(null);
    saveGuestInfo({ name: name.trim(), email: email.trim() });

    try {
      let paymentMethodId = selectedId;

      if (usingNewCard) {
        if (!stripe || !elements) {
          throw new Error("Card form is not ready");
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Card form is not ready");
        }

        const setupResponse = await fetch("/api/stripe/setup-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
          }),
        });

        if (!setupResponse.ok) {
          const data = (await setupResponse.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to set up card");
        }

        const { clientSecret } = (await setupResponse.json()) as {
          clientSecret: string;
        };

        const setupResult = await stripe.confirmCardSetup(clientSecret, {
          payment_method: { card: cardElement },
        });

        if (setupResult.error) {
          throw new Error(
            setupResult.error.message ?? "Card setup failed"
          );
        }

        const pm = setupResult.setupIntent?.payment_method;
        paymentMethodId = typeof pm === "string" ? pm : pm?.id ?? null;

        if (!paymentMethodId) {
          throw new Error("Failed to save card details");
        }
      }

      const response = await fetch("/api/stripe/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          paymentMethodId,
          items,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        orderId?: string;
        error?: string;
        paymentMethod?: {
          id: string;
          brand: string;
          last4: string;
          expMonth: number;
          expYear: number;
        };
      };

      if (!data.success || !data.orderId) {
        throw new Error(data.error ?? "Payment failed. Please try again.");
      }

      if (saveCard && data.paymentMethod) {
        saveMethod(data.paymentMethod);
      }

      clearCart();
      router.push(`/orders/${data.orderId}`);
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : "Payment failed. Please try again."
      );
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="space-y-6 lg:col-span-3">
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <h2 className="text-lg font-medium text-foreground">
              Your details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="guest-name"
                  className="text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="guest-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="guest-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">
              Payment method
            </h2>

            {loading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-xl bg-muted" />
              </div>
            ) : methods.length > 0 ? (
              <div className="space-y-3">
                {methods.map((method) => (
                  <SavedCard
                    key={method.id}
                    card={method}
                    isSelected={selectedId === method.id}
                    onSelect={() => setSelectedId(method.id)}
                    onDelete={() => deleteMethod(method.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  No saved cards. Enter your card details below.
                </p>
                <div className="rounded-lg border border-border bg-background px-4 py-3">
                  <CardElement options={cardElementOptions} />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(event) => setSaveCard(event.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  Save card for next time
                </label>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-medium text-foreground">
              Order summary
            </h2>

            {!isHydrated ? (
              <div className="space-y-3">
                <div className="h-4 animate-pulse rounded bg-muted" />
                <div className="h-4 animate-pulse rounded bg-muted" />
                <div className="h-4 animate-pulse rounded bg-muted" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                  <ShoppingBag className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Your cart is empty.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  render={<Link href="/" />}
                >
                  Continue shopping
                </Button>
              </div>
            ) : (
              <>
                <ul className="mb-4 space-y-3 border-b border-border pb-4">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.size}`}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 text-muted-foreground">
                        <span className="block truncate text-foreground">
                          {item.name}
                        </span>
                        <span>
                          Size {item.size} × {item.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 font-medium text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium text-foreground">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="font-medium text-foreground">
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base">
                    <dt className="font-semibold text-foreground">Total</dt>
                    <dd className="font-semibold text-foreground">
                      {formatPrice(total)}
                    </dd>
                  </div>
                </dl>
              </>
            )}

            {paymentError ? (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {paymentError}
              </div>
            ) : null}

            <Button
              className="mt-6 w-full"
              size="lg"
              disabled={!canPay}
              onClick={() => void handlePayNow()}
            >
              {isPaying ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing payment...
                </>
              ) : (
                "Pay now"
              )}
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

export function CheckoutContent() {
  const [stripePromise] = useState(() => getStripe());

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
