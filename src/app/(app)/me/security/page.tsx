import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PasskeyManager } from "@/components/webauthn/passkey-manager";
import { getUserPasskeys } from "@/lib/webauthn/actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getSecurityPageBackAriaLabel,
  getSecurityPageHeadingDescription,
  getSecurityPageHeadingTitle,
  getSecuritySkeletonAriaLabel,
} from "@/components/webauthn/passkey-utils";

export default function SecurityPage() {
  return (
    <main
      role="region"
      aria-label="Configuración de seguridad y acceso biométrico"
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-4">
        <Link
          href="/me/profile"
          prefetch={true}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
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
      className="rounded-xl border border-border bg-card p-4 shadow-xs"
    >
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
