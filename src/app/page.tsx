import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/auth";

export const dynamic = "force-dynamic";

export default function MarketingLanding() {
  async function handleContinue() {
    "use server";
    const session = await auth();
    if (session?.user) {
      redirect("/match");
    }

    await signIn("google", { redirectTo: "/match" });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <header className="space-y-4 text-balance">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground">
          Registra tus partidos
        </h1>
        <p className="text-base text-muted-foreground">
          Juega, registra y escala en la comunidad de pádel sin descargas.
        </p>
      </header>
      <form action={handleContinue} className="w-full max-w-sm space-y-3">
        <Button type="submit" size="lg" className="w-full">
          Registrar partido
        </Button>
        <Button variant="ghost" size="lg" className="w-full" asChild>
          <Link href="/install">Instalar ahora</Link>
        </Button>
      </form>
    </main>
  );
}
