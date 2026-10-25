import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PasskeyManager } from "@/components/webauthn/passkey-manager";
import { getUserPasskeys } from "@/lib/webauthn/actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getSecurityMainContainerClasses,
  getSecurityPageBackAriaLabel,
  getSecurityPageBackLinkClasses,
  getSecurityPageHeadingDescription,
  getSecurityPageHeadingTitle,
  getSecurityRegionAriaLabel,
  getSecuritySkeletonAriaLabel,
  getSecuritySkeletonContainerClasses,
  getSecuritySkeletonIconBadgeClasses,
  getSecuritySkeletonInputClasses,
  getSecuritySkeletonSubtitleClasses,
  getSecuritySkeletonTitleClasses,
} from "@/components/webauthn/passkey-utils";

export default function SecurityPage() {
  return (
    <main
      role="region"
      aria-label={getSecurityRegionAriaLabel()}
      className={getSecurityMainContainerClasses()}
    >
      <div className="flex items-center gap-4">
        <Link
          href="/me/profile"
          prefetch={true}
          className={getSecurityPageBackLinkClasses()}
          aria-label={getSecurityPageBackAriaLabel()}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {getSecurityPageHeadingTitle()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getSecurityPageHeadingDescription()}
          </p>
        </div>
      </div>

      <Suspense fallback={<SecuritySkeleton />}>
        <PasskeySection />
      </Suspense>
    </main>
  );
}

async function PasskeySection() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const passkeys = await getUserPasskeys();
  return <PasskeyManager initialPasskeys={passkeys} />;
}

function SecuritySkeleton() {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={getSecuritySkeletonAriaLabel()}
      className={getSecuritySkeletonContainerClasses()}
    >
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className={getSecuritySkeletonIconBadgeClasses()} />
        <div className="flex-1 space-y-1">
          <Skeleton className={getSecuritySkeletonTitleClasses()} />
          <Skeleton className={getSecuritySkeletonSubtitleClasses()} />
        </div>
      </div>
      <Skeleton className={getSecuritySkeletonInputClasses()} />
    </div>
  );
}
