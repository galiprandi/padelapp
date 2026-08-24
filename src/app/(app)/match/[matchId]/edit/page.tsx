import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMatchByIdAction } from "../../actions";
import { EditMatchForm } from "./edit-form";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface EditMatchPageProps {
  params: Promise<{ matchId: string }>;
}

export default function EditMatchPage({ params }: EditMatchPageProps) {
  return (
    <div className="flex flex-col gap-6 pb-20">
      <Suspense fallback={<MatchEditSkeleton />}>
        <MatchEditContent params={params} />
      </Suspense>
    </div>
  );
}

function MatchEditSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-16 bg-muted/60 animate-pulse rounded" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted/60 animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted/60 animate-pulse rounded" />
        </div>
      </div>

      {/* 1st Card: Ubicación y Tiempo */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="h-5 w-40 bg-muted/60 animate-pulse rounded" />
        <div className="space-y-2">
          <div className="h-4 w-12 bg-muted/60 animate-pulse rounded" />
          <div className="h-10 w-full bg-muted/60 animate-pulse rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted/60 animate-pulse rounded" />
          <div className="h-10 w-full bg-muted/60 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-12 bg-muted/60 animate-pulse rounded" />
            <div className="h-10 w-full bg-muted/60 animate-pulse rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 bg-muted/60 animate-pulse rounded" />
            <div className="h-10 w-full bg-muted/60 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>

      {/* 2nd Card: Formato */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="h-5 w-24 bg-muted/60 animate-pulse rounded" />
        <div className="space-y-2">
          <div className="h-4 w-28 bg-muted/60 animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-muted/60 animate-pulse rounded-lg" />
            <div className="h-10 bg-muted/60 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function MatchEditContent({ params }: EditMatchPageProps) {
  const { matchId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const response = await getMatchByIdAction(matchId);

  if (response.status !== "ok" || !response.match) {
    redirect("/match");
  }

  const match = response.match;
  const matchDate = new Date(match.date);

  const initialMatch = {
    club: match.club || "",
    courtNumber: match.courtNumber || "",
    date: matchDate.toISOString().split("T")[0],
    time: matchDate.toTimeString().slice(0, 5),
    sets: match.sets.toString(),
    matchType: match.matchType,
    notes: match.notes || "",
    isClosed: match.status === "CONFIRMED",
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Link
          href={`/match/${matchId}`}
          prefetch={true}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-all w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] rounded px-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Editar detalles</h1>
          <p className="text-sm text-muted-foreground">Ajustá la información del partido.</p>
        </div>
      </div>

      <EditMatchForm matchId={matchId} initialMatch={initialMatch} />
    </>
  );
}
