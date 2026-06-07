import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/me");
  }

  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/me" });
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      <Card className="relative w-full max-w-sm overflow-hidden border-border/40 bg-card/50 shadow-2xl backdrop-blur-md rounded-[2.5rem]">
        <CardHeader className="space-y-4 pb-8 pt-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-4xl shadow-inner">
            🎾
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight">PadelApp</CardTitle>
            <CardDescription className="text-balance px-4 text-sm font-medium leading-relaxed">
              Armá equipos rápido, registrá tus resultados y escalá en la comunidad.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form action={handleSignIn}>
            <Button
              type="submit"
              className="h-14 w-full rounded-2xl text-lg font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              size="lg"
            >
              Continuar con Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-border/40 bg-muted/30 py-6 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            Al continuar, aceptás nuestros términos y condiciones.
          </p>
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
          >
            Volver al inicio
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
