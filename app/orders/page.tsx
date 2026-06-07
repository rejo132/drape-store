import Link from "next/link";

export const metadata = {
  title: "Orders | DRAPE",
};

export default function OrdersPage() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Order history
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Guest checkout orders are available via your confirmation link after
        purchase.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-foreground underline underline-offset-4"
      >
        Continue shopping
      </Link>
    </main>
  );
}
