import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { CalendarCheck, Users, Trophy } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";

export default function MarketingLanding() {
  async function handleContinue() {
    "use server";
    const session = await auth();
    if (session?.user) {
      redirect("/me");
    }

    await signIn("google", { redirectTo: "/me" });
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col bg-background px-6 py-10">
      <div className="flex w-full max-w-sm mx-auto flex-col gap-10">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4 pt-6">
          <img
            src="/icon.svg"
            alt="Padel Red"
            className="h-20 w-20"
            width={80}
            height={80}
          />
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground">Padel Red</h1>
            <p className="text-base text-foreground font-medium">
              Turnos que no se cancelan.
            </p>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Tu comunidad de pádel en un solo lugar. Creá el turno, compartí el
              link, y jugá.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground">
                Nunca más un turno cancelado
              </h2>
              <p className="text-xs text-muted-foreground">
                Si faltan jugadores, avisamos automáticamente a tu red de
                contactos de pádel.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground">
                Tu red se arma sola
              </h2>
              <p className="text-xs text-muted-foreground">
                Cada partido confirmado suma contactos. Sin solicitudes
                manuales.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground">
                Ranking que motiva
              </h2>
              <p className="text-xs text-muted-foreground">
                Sumá puntos, subí de nivel y competí con tu comunidad.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-2">
          <form action={handleContinue}>
            <SignInButton label="Comenzar ahora" />
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Entrá con Google y jugá tu primer turno hoy.
          </p>
        </div>
      </div>
    </main>
  );
}
