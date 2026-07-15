import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InstallLinkButton } from "@/components/pwa-install-link";

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
    <main className="relative flex min-h-[100dvh] items-center justify-center bg-background px-6 py-10">
      <Card className="w-full max-w-sm border-border bg-card shadow-sm">
        <CardHeader className="space-y-4 pb-8 pt-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-4xl border border-primary/20">
            🎾
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">PadelApp</CardTitle>
            <CardDescription className="text-balance px-4 text-sm font-medium leading-relaxed">
              Registrá tus partidos, armá equipos y escalá en la comunidad de pádel.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-12">
          <form action={handleContinue}>
            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base font-semibold"
            >
              Comenzar ahora
            </Button>
          </form>
          <div className="flex flex-col gap-2">
            <InstallLinkButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
