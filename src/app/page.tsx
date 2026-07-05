import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Activity, Cpu } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MarketingLanding() {
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
      {/* HUD Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
           style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Animated HUD Scanline */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-primary/20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] animate-scanline" />

      <div className="relative w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex items-center gap-4 border-l-2 border-primary pl-4 opacity-80">
          <Cpu className="h-5 w-5 text-primary" />
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/50">System v1.0.Neural</p>
        </div>

        <Card className="border-white/10 bg-zinc-950/60 shadow-2xl backdrop-blur-3xl overflow-visible">
          <CardHeader className="space-y-4 pb-8 pt-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] border border-primary/40 animate-pulse">
              <Zap className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-black tracking-tighter italic">PADEL<span className="text-primary">APP</span></CardTitle>
              <CardDescription className="text-balance px-4">
                HIGH-PERFORMANCE SOCIAL TACTICAL INTERFACE
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pb-12">
            <form action={handleContinue}>
              <Button
                type="submit"
                size="xl"
                className="w-full relative group overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  INITIALIZE SESSION
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Button>
            </form>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[10px] font-mono text-white/40 hover:text-white"
                asChild
              >
                <Link href="/install">DOWNLOAD_CORE_ASSETS.exe</Link>
              </Button>
            </div>
          </CardContent>

          {/* HUD Decorative Elements */}
          <div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-primary/60" />
          <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-primary/60" />
        </Card>

        <div className="flex justify-between items-center px-4 opacity-30 text-[8px] font-mono uppercase tracking-widest text-white">
          <span>SECURE_AUTH_LAYER</span>
          <span>LATENCY: 14MS</span>
        </div>
      </div>
    </main>
  );
}
