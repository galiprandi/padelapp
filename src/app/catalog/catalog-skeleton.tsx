import { Skeleton } from "@/components/ui/skeleton";

export function CatalogSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex gap-12 max-w-none">
        {/* Sidebar skeleton (desktop) */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-12" />
              <div className="flex bg-muted rounded-xl p-1 border border-border">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="h-8 flex-1 rounded-lg" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content skeleton */}
        <div className="flex-1 min-w-0">
          <header className="mb-12 space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
          </header>

          <div className="space-y-16 max-w-sm mx-auto lg:max-w-none">
            {/* Encabezados section skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-5 w-32" />
              <div className="p-6 border border-border rounded-xl bg-card space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            {/* UI Básica section skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-5 w-28" />
              <div className="p-6 border border-border rounded-xl bg-card space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Jugadores section skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-5 w-28" />
              <div className="p-6 border border-border rounded-xl bg-card space-y-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
