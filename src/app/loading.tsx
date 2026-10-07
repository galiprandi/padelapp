import { Skeleton } from "@/components/ui/skeleton";
import {
  getRootLoadingAriaLabel,
  getRootLoadingClasses,
  getRootLoadingInnerContainerClasses,
  getRootLoadingHeroClasses,
  getRootLoadingHeroTextClasses,
  getRootLoadingCardClasses,
  getRootLoadingCtaClasses,
} from "@/lib/root-layout-utils";

export default function RootLoading() {
  return (
    <main
      className={getRootLoadingClasses()}
      aria-busy="true"
      aria-label={getRootLoadingAriaLabel()}
    >
      <div className={getRootLoadingInnerContainerClasses()}>
        {/* Hero Skeleton */}
        <div className={getRootLoadingHeroClasses()}>
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <div className={getRootLoadingHeroTextClasses()}>
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-5 w-1/3 rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
        </div>

        {/* Features Skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={getRootLoadingCardClasses()}
            >
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="space-y-2 flex-1 pt-1">
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-4/5 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Skeleton */}
        <div className={getRootLoadingCtaClasses()}>
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-3 w-2/3 mx-auto rounded-md" />
        </div>
      </div>
    </main>
  );
}
