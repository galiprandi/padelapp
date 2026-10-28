import { Suspense } from "react";
import { TurnPublicDetails } from "./turn-public-details";
import { TurnSkeleton } from "./turn-skeleton";
import { getTurnByIdAction } from "@/app/(app)/turnos/actions";
import { getTurnPublicPageMainClasses } from "@/components/turns/turn-utils";
import type { Metadata } from "next";

interface TurnPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TurnPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getTurnByIdAction(id);

  if (result.status !== "ok" || !result.turn) {
    return { title: "Turno no encontrado" };
  }

  const turn = result.turn;
  const title = `Turno en ${turn.club}`;
  const description = `Unite al turno en ${turn.club} el ${new Date(turn.date).toLocaleDateString("es-ES", { timeZone: "America/Argentina/Buenos_Aires" })}.`;

  return {
    title,
    description,
  };
}

export default function TurnPublicPage({ params }: TurnPageProps) {
  return (
    <main className={getTurnPublicPageMainClasses()}>
      <Suspense fallback={<TurnSkeleton />}>
        <TurnPublicDetails params={params} />
      </Suspense>
    </main>
  );
}
