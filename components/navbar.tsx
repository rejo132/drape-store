"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/lib/cart-context";

export function Navbar() {
  const { itemCount, isHydrated } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-[0.2em] text-foreground transition-opacity hover:opacity-80"
        >
          DRAPE
        </Link>

        <nav>
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center rounded-lg p-2 text-foreground transition-colors hover:bg-muted"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="size-5" />
            {isHydrated && itemCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
