"use client";

import { LogOut, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

export function Navbar() {
  const { data: session, status } = useSession();
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

        <nav className="flex items-center gap-2 sm:gap-4">
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

          {status === "loading" ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm sm:flex">
                <User className="size-4 text-muted-foreground" />
                <span className="max-w-[160px] truncate text-foreground">
                  {session.user.name ?? session.user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="gap-1.5"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" render={<Link href="/api/auth/signin" />}>
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
