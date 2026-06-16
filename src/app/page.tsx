import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <main className="relative flex min-h-[100dvh] items-center justify-center bg-background px-6 py-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      <Card className="relative w-full max-w-sm overflow-hidden border-border/40 bg-card/50 shadow-2xl backdrop-blur-md rounded-[2.5rem]">
        <CardHeader className="space-y-4 pb-8 pt-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-4xl shadow-inner animate-in zoom-in duration-500">
            🎾
          </div>
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
            <CardTitle className="text-3xl font-black tracking-tight">PadelApp</CardTitle>
            <CardDescription className="text-balance px-4 text-sm font-medium leading-relaxed">
              Registrá tus partidos, armá equipos y escalá en la comunidad de pádel.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <form action={handleContinue}>
            <Button
              type="submit"
              size="lg"
              className="h-14 w-full rounded-2xl text-lg font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              Registrar partido
            </Button>
          </form>
          <Button
            variant="ghost"
            size="lg"
            className="h-12 w-full rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/install">Instalar App</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
