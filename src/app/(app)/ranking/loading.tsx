import { Skeleton } from "@/components/ui/skeleton";

export default function RankingLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-1 h-4 w-56" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* User banner */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
