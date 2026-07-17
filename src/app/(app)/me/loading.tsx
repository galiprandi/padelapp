import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>

      {/* Hero activity */}
      <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>

      {/* Agenda */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Recent results */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
