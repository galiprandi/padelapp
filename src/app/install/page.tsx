import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InstallContent } from "@/components/share/install-content";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function InstallPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* Logo */}
        <img
          src="/icon.svg"
          alt="Padel Red"
          className="h-20 w-20"
          width={80}
          height={80}
        />

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Instalar Padel Red
          </h1>
          <p className="text-sm text-muted-foreground max-w-[260px]">
            Agregá la app a tu pantalla de inicio para acceder más rápido.
          </p>
        </div>

        <div className="w-full">
          <InstallContent />
        </div>

        <Button
          variant="ghost"
          className="h-10 w-full rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
