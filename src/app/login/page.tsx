import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { auth, signIn } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { safeCallbackUrl } from "@/lib/auth-utils";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-12">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-6">
          <img
            src="/icon.svg"
            alt="Padel Red"
            className="h-24 w-24"
            width={96}
            height={96}
          />
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Padel Red
            </h1>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Turnos que no se cancelan.
              <br />
              Tu comunidad de pádel en un solo lugar.
            </p>
          </div>
        </div>

        {/* CTA wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="flex h-12 w-full items-center justify-center rounded-xl bg-muted text-muted-foreground text-sm font-semibold">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
              Cargando…
            </div>
          }
        >
          <LoginForm searchParams={searchParams} />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground">
          Al continuar, aceptás nuestros términos de servicio.
        </p>
      </div>
    </main>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [session, resolvedParams] = await Promise.all([
    auth(),
    searchParams,
  ]);
  const callbackUrl = resolvedParams.callbackUrl;
  const safeCallback = safeCallbackUrl(callbackUrl);

  if (session?.user) {
    redirect(safeCallback);
  }

  async function handleSignIn() {
    "use server";
    const resolved = await searchParams;
    await signIn("google", {
      redirectTo: safeCallbackUrl(resolved.callbackUrl),
    });
  }

  return (
    <form action={handleSignIn} className="w-full">
      <SignInButton />
    </form>
  );
}
