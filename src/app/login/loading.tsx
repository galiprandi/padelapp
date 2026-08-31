import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-12">
        {/* Logo + tagline skeleton */}
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-2xl" />
          <div className="flex flex-col items-center space-y-3 text-center">
            <Skeleton className="h-8 w-36 rounded-md" />
            <Skeleton className="h-10 w-60 rounded-md" />
          </div>
        </div>

        {/* CTA buttons skeleton */}
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Terms footer skeleton */}
        <Skeleton className="h-4 w-56 rounded-md" />
      </div>
    </main>
  );
}
