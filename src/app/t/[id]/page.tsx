import { Suspense } from "react";
import { TurnPublicDetails } from "./turn-public-details";
import { TurnSkeleton } from "./turn-skeleton";
import { getTurnByIdAction } from "@/app/(app)/turnos/actions";
import appSettings from "@/config/app-settings.json";
import type { Metadata } from "next";

interface TurnPageProps {
  params: Promise<{ id: string }>;
}

const brandName = appSettings.shortName;

export async function generateMetadata({
  params,
}: TurnPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getTurnByIdAction(id);

  if (result.status !== "ok" || !result.turn) {
    return { title: "Turno no encontrado" };
  }

  const turn = result.turn;
  const title = `Turno en ${turn.club} - ${brandName}`;
  const description = `Unite al turno en ${turn.club} el ${new Date(turn.date).toLocaleDateString("es-ES", { timeZone: "America/Argentina/Buenos_Aires" })}.`;

  return {
    title,
    description,
  };
}

export default async function TurnPublicPage({ params }: TurnPageProps) {
  return (
    <Suspense fallback={<TurnSkeleton />}>
      <TurnPublicDetails params={params} />
    </Suspense>
  );
}
