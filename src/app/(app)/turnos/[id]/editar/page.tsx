import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTurnByIdAction } from "../../actions";
import { EditTurnForm } from "./edit-form";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getEditTurnHeadingTitle,
  getEditTurnHeadingDescription,
  getEditTurnLoadingAriaLabel,
  getTurnBackButtonAriaLabel,
} from "@/components/turns/turn-utils";
import Link from "next/link";

interface EditTurnPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTurnPage({ params }: EditTurnPageProps) {
  return (
    <div className="flex flex-col gap-6 pb-20">
      <Suspense fallback={<TurnEditSkeleton />}>
        <TurnEditContent params={params} />
      </Suspense>
    </div>
  );
}

function TurnEditSkeleton() {
  return (
    <div
      role="region"
      aria-busy="true"
      aria-label={getEditTurnLoadingAriaLabel()}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="p-6 flex flex-col gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function TurnEditContent({ params }: EditTurnPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const response = await getTurnByIdAction(id);

  if (response.status !== "ok" || !response.turn) {
    redirect("/turnos");
  }

  const turn = response.turn;
  const turnDate = new Date(turn.date);

  const initialTurn = {
    club: turn.club,
    date: turnDate.toISOString().split("T")[0],
    time: turnDate.toTimeString().slice(0, 5),
    duration: turn.duration.toString(),
    maxPlayers: turn.maxPlayers.toString(),
    notes: turn.notes || "",
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Link
          href={`/t/${id}`}
          prefetch={true}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
          aria-label={getTurnBackButtonAriaLabel()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {getEditTurnHeadingTitle()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getEditTurnHeadingDescription()}
          </p>
        </div>
      </div>

      <EditTurnForm id={id} initialTurn={initialTurn} />
    </>
  );
}
