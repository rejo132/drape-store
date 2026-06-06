import { ProductGrid } from "@/components/product-grid";
import type { ProductCardData } from "@/components/product-card";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getProducts(): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      images: true,
      sizes: true,
      stock: true,
    },
  });

  return products;
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Shop Collection
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Curated essentials and statement pieces. Select your size and add to
          cart.
        </p>
      </div>

      <ProductGrid products={products} />
    </main>
  );
}
