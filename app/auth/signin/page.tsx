import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

type SignInPageProps = {
  searchParams: { callbackUrl?: string };
};

export const metadata = {
  title: "Sign In | DRAPE",
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const callbackUrl = searchParams.callbackUrl ?? "/";

  if (session?.user) {
    redirect(callbackUrl);
  }

  const signInUrl = `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Sign in to DRAPE
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to save cards, checkout, and manage your orders.
      </p>
      <Button className="mt-8 w-full" size="lg" render={<Link href={signInUrl} />}>
        Continue to sign in
      </Button>
      <Link
        href="/"
        className="mt-4 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Back to shop
      </Link>
    </main>
  );
}
