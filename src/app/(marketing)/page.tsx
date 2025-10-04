import Link from "next/link";
import { Button } from "@/components/ui/button";

const highlights = [
  {
    title: "Organiza turnos abiertos",
    description: "Comparte un link, gestiona cupos y mantén todos al día en segundos.",
  },
  {
    title: "Registra partidos reales",
    description: "Carga resultados en la cancha y valida con tus rivales sin fricción.",
  },
  {
    title: "Ranking y reputación",
    description:
      "Tu nivel y compromiso importan. Sube de categoría jugando partidos verificados.",
  },
];

export default function MarketingLanding() {
  return (
    <main className="flex min-h-screen flex-col gap-10 px-5 pb-24 pt-10">
      <header className="flex flex-col gap-6 text-balance">
        <span className="text-sm font-semibold uppercase text-muted-foreground">
          Hecha para la pista
        </span>
        <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground">
          Juega, registra y escala en la comunidad de pádel sin descargas.
        </h1>
        <p className="text-base text-muted-foreground">
          PadelApp es una PWA mobile-first: login con Google, turnos abiertos y ranking
          dinámico en un solo lugar.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/install">Instalar en mi móvil</Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full border border-border bg-background sm:w-auto"
            asChild
          >
            <Link href="/(app)/dashboard">Ver prototipo</Link>
          </Button>
        </div>
      </header>

      <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">
          ¿Por qué PadelApp?
        </h2>
        <ul className="space-y-4">
          {highlights.map((item) => (
            <li key={item.title} className="rounded-2xl bg-secondary/60 p-4">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto flex flex-col gap-2 text-sm text-muted-foreground">
        <p>Lista para pruebas internas. Construida con Next.js 15 y Tailwind.</p>
        <p>
          MVP enfocado en links compartibles, ranking honesto y reputación de asistencia.
        </p>
      </footer>
    </main>
  );
}
