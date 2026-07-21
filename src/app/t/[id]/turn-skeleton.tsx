import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Calendar, Clock, MapPin, Users } from "lucide-react";

export function TurnSkeleton() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-32">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <ChevronLeft className="h-5 w-5 opacity-40" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>

      {/* Information Card Skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground opacity-40" />
            <Skeleton className="h-4 w-36 inline-block" />
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border">
          {/* Horario Row */}
          <div className="bg-card p-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 opacity-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-7 w-32" />
          </div>

          {/* Club & Fecha Row */}
          <div className="bg-card p-4 flex items-center gap-4 border-t border-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
              <MapPin className="h-5 w-5 text-muted-foreground opacity-40" />
            </div>
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Players List Skeleton */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground opacity-40" />
            <Skeleton className="h-4 w-28" />
          </h2>
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>

        <div className="grid gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-card p-3 border border-border"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </section>

      {/* Fixed Bottom Bar Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border z-50">
        <div className="max-w-md mx-auto">
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
