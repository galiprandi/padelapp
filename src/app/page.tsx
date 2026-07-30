import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { CalendarCheck, Users, Trophy } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { PasskeyLoginButton } from "@/components/webauthn/passkey-login-button";
import Image from "next/image";

// The landing page reads searchParams (from, invite) to contextualize the hero
// for WhatsApp arrivals. This makes it dynamic rather than instant-prerendered.
export const instant = false;

interface LandingPageProps {
  searchParams: Promise<{ from?: string; invite?: string }>;
}

export default async function MarketingLanding({ searchParams }: LandingPageProps) {
  const params = await searchParams;
  const fromWhatsApp = params.from === "whatsapp";
  const hasInvite = params.invite === "1";

  async function handleContinue() {
    "use server";
    const session = await auth();
    if (session?.user) {
      redirect("/me");
    }

    await signIn("google", { redirectTo: "/me" });
  }

  const heroTitle = fromWhatsApp
    ? "Te invitaron a un turno"
    : "Turnos que no se cancelan";

  const heroSubtitle = fromWhatsApp
    ? "Entrá con Google para confirmar tu lugar y ver los detalles de la cancha."
    : "Tu comunidad de pádel en un solo lugar. Creá el turno, compartí el link por WhatsApp, y jugá.";

  const ctaHelper = hasInvite
    ? "Entrá con Google y confirmá tu lugar en el turno."
    : "Entrá con Google y organizá tu primer turno hoy.";

  return (
    <main className="relative flex min-h-dvh flex-col bg-background px-6 py-10">
      <div className="flex w-full max-w-sm mx-auto flex-col gap-6">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4 pt-6">
          <Image
            src="/icon.svg"
            alt="Padel Red"
            className="h-20 w-20"
            width={80}
            height={80}
            unoptimized
          />
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-lg font-semibold text-foreground">
              Padel Red
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {heroSubtitle}
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
                Alguien se bajó del turno?
              </h2>
              <p className="text-xs text-muted-foreground">
                Encontramos reemplazo en tu círculo de pádel automáticamente.
                Sin tener que rogar por jugadores en el grupo de WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground">
                Tu red se arma desde la cancha
              </h2>
              <p className="text-xs text-muted-foreground">
                Cada cancha que compartís suma jugadores a tu red. Sin
                agregar contactos manualmente, sin solicitudes de amistad.
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
                Competí con tu club, subí en el ranking, y demostrá quién
                es el mejor de la cancha.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 pt-2">
          <form action={handleContinue} aria-label="Iniciar sesión con Google">
            <SignInButton label="Comenzar ahora" />
          </form>
          <PasskeyLoginButton />
          <p className="text-center text-xs text-muted-foreground">
            {ctaHelper}
          </p>
          <p className="text-center text-xs font-semibold text-primary">
            Gratis para siempre — sin costos ni suscripciones.
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Tu red de contactos es privada — solo jugadores con quienes
            compartiste cancha pueden ver tu actividad.
          </p>
        </div>
      </div>
    </main>
  );
}
