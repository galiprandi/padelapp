import { Suspense } from "react";
import { getTurnByIdAction } from "@/app/(app)/turnos/actions";
import { TurnPublicDetails } from "./turn-public-details";
import { TurnSkeleton } from "./turn-skeleton";
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

export default function TurnPublicPage({ params }: TurnPageProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-32">
      <Suspense fallback={<TurnSkeleton />}>
        <TurnPublicDetails params={params} />
      </Suspense>
    </main>
  );
}
