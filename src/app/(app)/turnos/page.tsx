import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCachedOpenTurns, getCachedPadelContacts, type PadelContact } from "@/lib/queries";
import { TurnsFilter } from "@/components/turns/turns-filter";
import {
  getTurnosHeadingTitle,
  getTurnosHeadingDescription,
  getTurnosLoadingAriaLabel,
  getTurnCreateButtonText,
  getTurnsPageContainerClasses,
  getTurnsPageHeaderClasses,
  getTurnsListSkeletonContainerClasses,
  getTurnsListSkeletonTabGridClasses,
  getTurnsListSkeletonHeaderClasses,
  getTurnsListSkeletonCardListClasses,
} from "@/components/turns/turn-utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";

export default function TurnsPage() {
  return (
    <div className={getTurnsPageContainerClasses()}>
      <div className={getTurnsPageHeaderClasses()}>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {getTurnosHeadingTitle()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getTurnosHeadingDescription()}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/turnos/nuevo" prefetch={true}>
            <Plus className="mr-1 h-4 w-4" />
            {getTurnCreateButtonText()}
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TurnsListSkeleton />}>
        <TurnsList />
      </Suspense>
    </div>
  );
}

async function TurnsList() {
  const session = await auth();
  const turns = await getCachedOpenTurns();
  let contacts: PadelContact[] = [];
  if (session?.user?.id) {
    contacts = await getCachedPadelContacts(session.user.id);
  }

  return (
    <TurnsFilter
      turns={turns}
      userId={session?.user?.id ?? null}
      contacts={contacts}
    />
  );
}

function TurnsListSkeleton() {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={getTurnosLoadingAriaLabel()}
      className={getTurnsListSkeletonContainerClasses()}
    >
      {/* Skeleton for tab filter bar */}
      <div className={getTurnsListSkeletonTabGridClasses()}>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className={getTurnsListSkeletonHeaderClasses()}>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className={getTurnsListSkeletonCardListClasses()}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
