import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <Card className="w-full max-w-sm border border-border/80">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">🎾 Bienvenido a PadelApp</CardTitle>
          <CardDescription>
            Ingresa con tu cuenta de Google para abrir turnos, registrar partidos y seguir tu ranking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSignIn} className="space-y-4">
            <Button type="submit" className="w-full" size="lg">
              Continuar con Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Volver a la landing
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
