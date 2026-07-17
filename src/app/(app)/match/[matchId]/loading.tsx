import { Skeleton } from "@/components/ui/skeleton";

export default function MatchDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Match card */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}
