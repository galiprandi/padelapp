import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Network, ChevronLeft } from "lucide-react";

export function NetworkSkeleton() {
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">
      {/* Tab bar skeleton */}
      <div className="flex items-center gap-1 border-b border-border bg-card px-4 py-2 shrink-0">
        <button
          disabled
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold bg-primary text-primary-foreground opacity-50"
        >
          <BarChart3 className="h-4 w-4" />
          Métricas
        </button>
        <button
          disabled
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-muted-foreground opacity-50"
        >
          <Network className="h-4 w-4" />
          Grafo
        </button>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground opacity-50">
            <ChevronLeft className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-[240px]" />
          </div>
        </div>

        {/* Adoption stats grid skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Network stats skeleton */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5 pt-2 border-t border-border">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Engagement stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Communities skeleton */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Top connected players skeleton */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-3 w-4" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
