import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InstallContent } from "@/components/share/install-content";
import Image from "next/image";

export default function InstallPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* Logo */}
        <Image
          src="/icon.svg"
          alt="Padel Red"
          className="h-20 w-20"
          width={80}
          height={80}
          unoptimized
        />

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">
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
          className="h-10 w-full rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          asChild
        >
          <Link href="/" prefetch={true}>Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
