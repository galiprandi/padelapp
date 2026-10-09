import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getMatchByIdAction } from "@/app/(app)/match/actions";
import { MatchResultForm } from "./result-form";
import { getMatchResultSkeletonAriaLabel } from "./match-result-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

interface MatchResultPageProps {
  params: Promise<{ matchId: string }>;
}

export default function MatchResultPage({ params }: MatchResultPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<MatchResultSkeleton />}>
        <MatchResultContent params={params} />
      </Suspense>
    </div>
  );
}

function MatchResultSkeleton() {
  const ariaLabel = getMatchResultSkeletonAriaLabel();

  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={ariaLabel}
      className="flex flex-col gap-6"
    >
      <div className="space-y-1">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-16 rounded-md" />
          <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-48 rounded-md" />
          <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function MatchResultContent({ params }: MatchResultPageProps) {
  const { matchId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await getMatchByIdAction(matchId);

  if (result.status !== "ok" || !result.match) {
    notFound();
  }

  const match = result.match;
  const isClosed = Boolean(match.score) || match.status === "CONFIRMED";
  const subtitle = isClosed
    ? `Marcador registrado: ${match.score}`
    : "Ingresá los juegos ganados por cada equipo.";

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-foreground">Cargar Resultado</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- MatchData type not exported from result-form */}
      <MatchResultForm match={match as any} viewerId={session.user.id} />
    </>
  );
}
