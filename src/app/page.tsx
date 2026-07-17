import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { InstallLinkButton } from "@/components/pwa-install-link";
import { SignInButton } from "@/components/auth/sign-in-button";

export const dynamic = "force-dynamic";

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
        <div className="w-full space-y-3">
          <form action={handleContinue}>
            <SignInButton label="Comenzar ahora" />
          </form>
          <InstallLinkButton />
        </div>
      </div>
    </main>
  );
}
