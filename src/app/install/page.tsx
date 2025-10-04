import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InstallPage() {
  return (
    <main className="flex min-h-screen flex-col gap-6 px-5 pb-16 pt-10">
      <header className="space-y-2 text-balance">
        <h1 className="text-3xl font-bold">🎾 Instala PadelApp</h1>
        <p className="text-sm text-muted-foreground">
          Sigue estos pasos para agregarla a tu pantalla de inicio. Funciona offline de forma básica y se actualizará automáticamente.
        </p>
      </header>

      <ol className="space-y-3 text-sm text-muted-foreground">
        <li>
          <span className="font-semibold text-foreground">1.</span> Abre el menú de compartir de tu navegador.
        </li>
        <li>
          <span className="font-semibold text-foreground">2.</span> Selecciona <strong>&quot;Agregar a la pantalla de inicio&quot;</strong> en iOS o <strong>&quot;Instalar app&quot;</strong> en Android/Chrome.
        </li>
        <li>
          <span className="font-semibold text-foreground">3.</span> Confirma. La próxima vez podrás abrirla como una app nativa.
        </li>
      </ol>

      <section className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">
        <p className="mb-2 font-semibold text-foreground">¿No te aparece la opción?</p>
        <p>Abre 🎾 PadelApp desde el navegador por defecto de tu dispositivo y vuelve a intentar.</p>
      </section>

      <Button className="mt-auto rounded-full" variant="secondary" asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </main>
  );
}
