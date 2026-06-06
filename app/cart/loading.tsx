export default function CartLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-muted" />

      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div className="size-24 shrink-0 animate-pulse rounded-lg bg-muted sm:size-28" />
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <div className="h-5 w-14 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-6 h-10 animate-pulse rounded-lg bg-muted" />
      </div>
    </main>
  );
}
