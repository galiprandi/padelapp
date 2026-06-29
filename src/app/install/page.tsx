import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Share, PlusSquare, Smartphone } from "lucide-react";

export default function InstallPage() {
  const steps = [
    {
      icon: <Share className="h-5 w-5 text-primary" />,
      text: "Abrí el menú de compartir de tu navegador.",
    },
    {
      icon: <PlusSquare className="h-5 w-5 text-primary" />,
      text: (
        <>
          Seleccioná <strong>"Agregar a inicio"</strong> (iOS) o <strong>"Instalar app"</strong> (Android).
        </>
      ),
    },
    {
      icon: <Smartphone className="h-5 w-5 text-primary" />,
      text: "¡Listo! Ya podés usar PadelApp como una app nativa.",
    },
  ];

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10 overflow-hidden">
      {/* V9+ High-Fidelity Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      <Card className="relative w-full max-w-sm overflow-hidden border-border/40 bg-card/50 shadow-2xl backdrop-blur-2xl rounded-[2.5rem] animate-in fade-in zoom-in-95 duration-1000">
        <CardHeader className="space-y-4 pb-6 pt-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 text-4xl shadow-inner border border-primary/20 animate-in zoom-in duration-1000">
            📲
          </div>
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
            <CardTitle className="text-4xl font-black tracking-tight">PadelApp</CardTitle>
            <CardDescription className="text-balance px-4 text-sm font-medium leading-relaxed opacity-80">
              Disfrutá de la mejor experiencia agregando la app a tu pantalla de inicio.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-400 fill-mode-both">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-[1.5rem] bg-background/40 p-5 border border-border/20 backdrop-blur-sm shadow-sm transition-all hover:bg-background/60"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 shadow-sm border border-primary/10">
                  {step.icon}
                </div>
                <p className="text-sm font-bold leading-snug text-foreground/90">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <section className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600 fill-mode-both">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">¿No ves la opción?</p>
            <p className="text-[13px] font-medium leading-relaxed text-muted-foreground">
              Asegurate de estar usando el navegador por defecto (<span className="text-foreground font-bold">Safari</span> en iOS o <span className="text-foreground font-bold">Chrome</span> en Android).
            </p>
          </section>
        </CardContent>

        <CardFooter className="pb-10 px-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-800 fill-mode-both">
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] border-border/40 hover:bg-muted/30 transition-all active:scale-[0.98]"
            asChild
          >
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
