import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-1 h-4 w-48" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-8 rounded-md" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
