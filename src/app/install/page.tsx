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
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <Card className="w-full max-w-sm border-border bg-card shadow-sm rounded-xl">
        <CardHeader className="space-y-4 pb-6 pt-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-4xl border border-primary/20">
            📲
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">PadelApp</CardTitle>
            <CardDescription className="text-balance px-4 text-sm text-muted-foreground">
              Disfrutá de la mejor experiencia agregando la app a tu pantalla de inicio.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl bg-muted/50 p-4 border border-border"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/10">
                  {step.icon}
                </div>
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="mb-2 text-xs font-bold uppercase text-primary/60">¿No ves la opción?</p>
            <p className="text-sm text-muted-foreground">
              Asegurate de estar usando el navegador por defecto (<span className="text-foreground font-bold">Safari</span> en iOS o <span className="text-foreground font-bold">Chrome</span> en Android).
            </p>
          </section>
        </CardContent>

        <CardFooter className="pb-10 px-8">
          <Button
            variant="outline"
            className="w-full h-12 rounded-lg font-semibold text-sm"
            asChild
          >
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
