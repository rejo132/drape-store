import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format-price";

type OrderDetailPageProps = {
  params: { orderId: string };
};

export async function generateMetadata({ params }: OrderDetailPageProps) {
  return {
    title: `Order ${params.orderId.slice(0, 8)} | DRAPE`,
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Order confirmed
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for your purchase.
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="space-y-1 border-b border-border pb-4">
          <p className="text-sm text-muted-foreground">Order number</p>
          <p className="font-mono text-sm font-medium text-foreground">
            {order.id}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Items
          </h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-3 text-sm"
              >
                <span className="min-w-0 text-muted-foreground">
                  <span className="block text-foreground">
                    {item.product.name}
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
        </div>

        <div className="flex justify-between border-t border-border pt-4">
          <span className="font-semibold text-foreground">Total paid</span>
          <span className="font-semibold text-foreground">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" render={<Link href="/" />}>
          Continue shopping
        </Button>
      </div>
    </main>
  );
}
