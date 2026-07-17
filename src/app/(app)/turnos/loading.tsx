import { Skeleton } from "@/components/ui/skeleton";

export default function TurnosLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-1 h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
