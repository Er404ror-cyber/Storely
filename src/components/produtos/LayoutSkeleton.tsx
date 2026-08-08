export function ProductShowcaseSkeleton({
  cols,
  isDark,
}: {
  cols: number;
  isDark: boolean;
}) {
  const base = isDark ? "bg-zinc-950 border-white/10" : "bg-white border-zinc-200";

  if (cols === 1) {
    return (
      <div className="mx-auto max-w-6xl px-0 md:px-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={["flex items-center gap-3 rounded-2xl border p-2.5", base].join(" ")}>
              <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3.5 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cols === 2) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-3 px-0 md:px-4">
        <div className="grid gap-2 md:h-[390px] md:grid-cols-6 md:grid-rows-2 md:gap-3">
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800 md:col-span-4 md:row-span-2 md:aspect-auto" />
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800 md:col-span-2 md:row-span-1 md:aspect-auto" />
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800 md:col-span-2 md:row-span-1 md:aspect-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-3 px-0 md:grid-cols-4 md:px-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="aspect-square animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}