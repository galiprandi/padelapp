import { Skeleton } from "@/components/ui/skeleton";

export default function InstallLoading() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* Logo skeleton */}
        <Skeleton className="h-20 w-20 rounded-2xl" />

        {/* Title & subtitle skeleton */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Skeleton className="h-7 w-48 rounded-md" />
          <Skeleton className="h-8 w-64 rounded-md" />
        </div>

        {/* Install content guide card skeleton */}
        <Skeleton className="h-56 w-full rounded-xl" />

        {/* Back button skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </main>
  );
}
