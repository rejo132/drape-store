"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  stock: number;
};

type ProductCardProps = {
  product: ProductCardData;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes[0] ?? ""
  );
  const [added, setAdded] = useState(false);

  const imageUrl = product.images[0] ?? "https://picsum.photos/seed/placeholder/800/1000";
  const isOutOfStock = product.stock <= 0;

  function handleAddToCart() {
    if (!selectedSize || isOutOfStock) {
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: imageUrl,
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isOutOfStock ? (
          <span className="absolute top-3 left-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h2 className="text-sm font-medium leading-snug text-foreground">
            {product.name}
          </h2>
          <p className="text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </p>
        </div>

        {product.sizes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Size
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  disabled={isOutOfStock}
                  className={cn(
                    "min-w-9 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-foreground/50",
                    isOutOfStock && "cursor-not-allowed opacity-50"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <Button
          className="mt-auto w-full"
          onClick={handleAddToCart}
          disabled={!selectedSize || isOutOfStock}
        >
          {added ? "Added!" : "Add to cart"}
        </Button>
      </div>
    </article>
  );
}
