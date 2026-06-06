"use client";

import { ProductCard, type ProductCardData } from "@/components/product-card";

type ProductGridProps = {
  products: ProductCardData[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <p className="text-lg font-medium text-foreground">No products yet</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Check back soon — new arrivals are on the way.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
