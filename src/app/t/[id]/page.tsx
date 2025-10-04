import appSettings from "@/config/app-settings.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTurns } from "@/lib/mock-data";
import type { Metadata } from "next";
import Link from "next/link";

type TurnPageParams = { id: string };

interface TurnPageProps {
  params: Promise<TurnPageParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const brandWithEmoji = `🎾 ${appSettings.shortName}`;

export async function generateMetadata({ params }: TurnPageProps): Promise<Metadata> {
  const { id } = await params;
  const turn = mockTurns.find((item) => item.id === id);
  const title = turn ? `Turno en ${turn.club}` : `Turno de ${brandWithEmoji}`;
  const description = turn
    ? `${turn.date} · ${turn.time} · Nivel ${turn.level}`
    : `Anótate a un turno abierto organizado con ${brandWithEmoji}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appSettings.baseUrl}/t/${id}`,
      type: "website",
    },
  };
}

export default async function TurnPublicPage({ params }: TurnPageProps) {
  const { id } = await params;
  const turn = mockTurns.find((item) => item.id === id);

  if (!turn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="text-2xl font-bold">Turno no encontrado</h1>
        <p className="text-sm text-muted-foreground">
          El link puede haber expirado o el organizador lo eliminó.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/">Ir a {brandWithEmoji}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 pb-16 pt-10">
      <header className="space-y-2 text-center">
        <Badge variant="success" className="mx-auto w-fit">
          Nivel {turn.level}
        </Badge>
        <h1 className="text-3xl font-bold">Turno en {turn.club}</h1>
        <p className="text-sm text-muted-foreground">
          {turn.date} · {turn.time}
        </p>
      </header>

      <Card className="space-y-0 p-5">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Jugadores</CardTitle>
          <CardDescription>
            {turn.slots.taken}/{turn.slots.total} cupos ocupados · se cierra 1 minuto antes de empezar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-0 pt-4">
          <div className="flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-3">
            <span className="text-sm font-semibold text-muted-foreground">Organizador</span>
            <span className="text-sm font-medium">martina@padelapp.app</span>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <span>+ Añade tu nombre al turno para recibir nuevas partidas.</span>
            <span>+ Confirmaremos tu asistencia automáticamente con tu reputación.</span>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="rounded-full">
        Unirme al turno
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Al unirte aceptas compartir tu perfil de {brandWithEmoji} con los participantes.
      </p>
    </main>
  );
}
