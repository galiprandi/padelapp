import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";

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
      <div className="flex w-full max-w-sm flex-col items-center gap-12">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center gap-6">
          <img
            src="/icon.svg"
            alt="PadelApp"
            className="h-24 w-24"
            width={96}
            height={96}
          />
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              PadelApp
            </h1>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Turnos que no se cancelan.
              <br />
              Tu comunidad de pádel en un solo lugar.
            </p>
          </div>
        </div>

        {/* CTA */}
        <form action={handleSignIn} className="w-full">
          <SignInButton />
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Al continuar, aceptás nuestros términos de servicio.
        </p>
      </div>
    </main>
  );
}
