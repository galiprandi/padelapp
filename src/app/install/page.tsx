import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InstallContent } from "@/components/share/install-content";

export default function InstallPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <Card className="w-full max-w-sm border-border bg-card shadow-sm rounded-xl">
        <CardHeader className="space-y-4 pb-6 pt-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-4xl border border-primary/20">
            📲
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">PadelApp</CardTitle>
            <CardDescription className="text-balance px-4 text-sm text-muted-foreground">
              Disfrutá de la mejor experiencia agregando la app a tu pantalla de inicio.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          <InstallContent />
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
