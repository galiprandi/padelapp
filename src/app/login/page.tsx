import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Trophy, Users, Zap } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl || "/me");
  }

  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl || "/me" });
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-3">
          <img src="/icon.svg" alt="PadelApp" className="h-16 w-16" />
          <h1 className="text-2xl font-bold text-foreground">PadelApp</h1>
          <p className="text-sm text-muted-foreground text-center max-w-[260px]">
            Organizá turnos, registrá partidos y escalá en el ranking de tu
            comunidad.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Turnos abiertos
              </p>
              <p className="text-xs text-muted-foreground">
                Encontrá partidos en segundos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                4 jugadores confirmados
              </p>
              <p className="text-xs text-muted-foreground">
                Registra el resultado y sumá puntos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Ranking dinámico
              </p>
              <p className="text-xs text-muted-foreground">
                Subí de nivel con cada victoria
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <form action={handleSignIn}>
          <SignInButton />
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Al continuar, aceptás nuestros términos de servicio.
        </p>
      </div>
    </main>
  );
}
