"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format-price";

const SHIPPING_FLAT_CENTS = 800;
const FREE_SHIPPING_THRESHOLD_CENTS = 10000;

function getShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

export function CartPageContent() {
  const router = useRouter();
  const { items, subtotal, isHydrated, removeItem, updateQuantity } = useCart();

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything yet. Explore our collection
          and find something you love.
        </p>
        <Button className="mt-6" render={<Link href="/" />}>
          Continue shopping
        </Button>
      </div>
    );
  }

  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
        Shopping Cart
      </h1>

      <div className="space-y-4">
        {items.map((item) => {
          const lineTotal = item.price * item.quantity;

          return (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-medium text-foreground">
                      {item.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Size: {item.size}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.size)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.quantity - 1
                        )
                      }
                      className="flex size-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.quantity + 1
                        )
                      }
                      className="flex size-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p className="font-medium text-foreground">
                    {formatPrice(lineTotal)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium text-foreground">
              {formatPrice(subtotal)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Shipping
              {subtotal < FREE_SHIPPING_THRESHOLD_CENTS ? (
                <span className="block text-xs">
                  Free on orders over {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}
                </span>
              ) : null}
            </dt>
            <dd className="font-medium text-foreground">
              {shipping === 0 ? "Free" : formatPrice(shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="font-semibold text-foreground">
              {formatPrice(total)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1"
            size="lg"
            onClick={() => router.push("/checkout")}
          >
            Proceed to checkout
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            render={<Link href="/" />}
          >
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
