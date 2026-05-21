import appSettings from "@/config/app-settings.json";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

type TurnPageParams = { id: string };

interface TurnPageProps {
  params: Promise<TurnPageParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const brandWithEmoji = `🎾 ${appSettings.shortName}`;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Turno de ${brandWithEmoji}`;
  const description = `Anótate a un turno abierto organizado con ${brandWithEmoji}.`;

  return {
    title,
    description,
  };
}

export default async function TurnPublicPage() {
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
