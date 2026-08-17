import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function PublicProfileLoading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-10 pb-20 min-h-screen">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">Perfil Público</h1>
          <p className="text-sm text-muted-foreground">Estadísticas de jugador</p>
        </div>
      </div>

      {/* Profile summary skeleton */}
      <div className="flex flex-col items-center gap-4 text-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-36 mx-auto" />
          <Skeleton className="h-5 w-28 mx-auto rounded-full" />
        </div>
      </div>

      {/* Ranking banner skeleton */}
      <div className="h-24 rounded-xl bg-card border border-border p-4">
        <div className="grid grid-cols-3 gap-4 h-full items-center">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>

      {/* Network & Position Stats Card skeleton */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>

      {/* History section skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
