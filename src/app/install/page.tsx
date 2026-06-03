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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      <Card className="relative w-full max-w-sm overflow-hidden border-border/40 bg-card/50 shadow-2xl backdrop-blur-md rounded-[2.5rem]">
        <CardHeader className="space-y-4 pb-6 pt-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-4xl shadow-inner animate-in zoom-in duration-500">
            📲
          </div>
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
            <CardTitle className="text-3xl font-black tracking-tight">Instalá PadelApp</CardTitle>
            <CardDescription className="text-balance px-4 text-sm font-medium leading-relaxed">
              Disfrutá de la mejor experiencia agregando la app a tu pantalla de inicio.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-2xl bg-background/40 p-4 border border-border/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-sm">
                  {step.icon}
                </div>
                <p className="text-sm font-medium leading-tight text-foreground/90">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs font-medium text-muted-foreground leading-relaxed">
            <p className="mb-1 font-bold text-foreground">¿No ves la opción?</p>
            <p>Asegurate de estar usando el navegador por defecto (Safari en iOS o Chrome en Android).</p>
          </section>
        </CardContent>

        <CardFooter className="pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
          <Button
            variant="secondary"
            className="w-full rounded-xl font-bold"
            asChild
          >
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
