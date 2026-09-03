import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BottomNavSkeletonProps {
  position?: "fixed" | "static";
}

export function BottomNavSkeleton({
  position = "fixed",
}: BottomNavSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando barra de navegación"
      className={cn(
        "mx-auto flex w-full justify-center",
        position === "fixed" &&
          "fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom,0px)]",
      )}
    >
      <div className="relative flex h-16 w-full items-stretch justify-evenly border-t border-border bg-background">
        {/* Left tabs skeleton */}
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>

        {/* Central FAB skeleton */}
        <div className="relative -mt-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted shadow-xs">
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>

        {/* Right tabs skeleton */}
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
