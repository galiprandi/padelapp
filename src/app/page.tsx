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
      {/* V9+ High-Fidelity Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      <Card className="relative w-full max-w-sm overflow-hidden border-border/40 bg-card/50 shadow-2xl backdrop-blur-2xl rounded-[2.5rem] animate-in fade-in zoom-in-95 duration-1000">
        <CardHeader className="space-y-4 pb-8 pt-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 text-4xl shadow-inner border border-primary/20 animate-in zoom-in duration-1000">
            🎾
          </div>
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
            <CardTitle className="text-4xl font-black tracking-tight">PadelApp</CardTitle>
            <CardDescription className="text-balance px-4 text-sm font-medium leading-relaxed opacity-80">
              Registrá tus partidos, armá equipos y escalá en la comunidad de pádel con estilo.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-400 fill-mode-both">
          <form action={handleContinue}>
            <Button
              type="submit"
              size="lg"
              className="h-16 w-full rounded-[2rem] text-lg font-black shadow-[0_20px_40px_-12px_theme(colors.primary.DEFAULT/0.3)] transition-all active:scale-[0.98] hover:scale-[1.01]"
            >
              Comenzar ahora
            </Button>
          </form>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="ghost"
              size="lg"
              className="h-12 w-full rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-foreground transition-all active:scale-[0.95]"
              asChild
            >
              <Link href="/install">Instalar App</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
