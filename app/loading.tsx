export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-2">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="aspect-[4/5] animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              <div className="flex gap-1.5">
                {Array.from({ length: 4 }).map((__, sizeIndex) => (
                  <div
                    key={sizeIndex}
                    className="h-7 w-9 animate-pulse rounded-md bg-muted"
                  />
                ))}
              </div>
              <div className="h-9 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
