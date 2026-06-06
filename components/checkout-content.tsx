"use client";

import { Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SavedCard } from "@/components/saved-card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { getShippingCost } from "@/lib/checkout";
import { formatPrice } from "@/lib/format-price";
import { usePaymentMethods } from "@/lib/hooks/use-payment-methods";

export function CheckoutContent() {
  const router = useRouter();
  const { items, subtotal, isHydrated, clearCart } = useCart();
  const { methods, loading, error, deleteMethod } = usePaymentMethods();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

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
  const canPay =
    isHydrated &&
    items.length > 0 &&
    selectedId !== null &&
    !loading &&
    !isPaying;

  async function handleDelete(paymentMethodId: string) {
    setDeleteError(null);
    try {
      await deleteMethod(paymentMethodId);
      if (selectedId === paymentMethodId) {
        setSelectedId(null);
      }
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete card"
      );
    }
  }

  async function handlePayNow() {
    if (!canPay || !selectedId) {
      return;
    }

    setIsPaying(true);
    setPaymentError(null);

    try {
      const response = await fetch("/api/stripe/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: selectedId,
          items,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        orderId?: string;
        error?: string;
      };

      if (!data.success || !data.orderId) {
        throw new Error(data.error ?? "Payment failed. Please try again.");
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
        <section className="space-y-4 lg:col-span-3">
          <h2 className="text-lg font-medium text-foreground">Payment method</h2>

          {loading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-xl bg-muted" />
              <div className="h-20 animate-pulse rounded-xl bg-muted" />
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : methods.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
              <p className="font-medium text-foreground">No saved cards</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add a card to complete your purchase.
              </p>
              <Button className="mt-4" render={<Link href="/checkout/add-card" />}>
                Add a card
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {methods.map((method) => (
                <SavedCard
                  key={method.id}
                  card={method}
                  isSelected={selectedId === method.id}
                  onSelect={() => setSelectedId(method.id)}
                  onDelete={() => void handleDelete(method.id)}
                />
              ))}
            </div>
          )}

          {deleteError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {deleteError}
            </div>
          ) : null}

          <Link
            href="/checkout/add-card"
            className="inline-block text-sm text-foreground underline underline-offset-4 transition-opacity hover:opacity-80"
          >
            Add a new card
          </Link>
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
