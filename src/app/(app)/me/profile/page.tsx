import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "./profile-form";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      alias: true,
      level: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative flex flex-col gap-12 pb-8 animate-in fade-in duration-700">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-primary/10 blur-[100px] -z-10 rounded-full opacity-50" />

      <PageHeader
        title="Editar perfil"
        description="Personalizá cómo te ven tus rivales y tu nivel de juego."
        size="lg"
        backHref="/me"
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <section className="space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">
            Cuenta vinculada
          </h2>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/40 p-8 backdrop-blur-md shadow-xl transition-all hover:bg-card/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Nombre de Google</span>
              <p className="text-2xl font-black text-foreground tracking-tight">
                {user.displayName}
              </p>
              <p className="mt-2 text-[11px] font-medium leading-relaxed text-muted-foreground/40 italic">
                Este nombre está vinculado a tu cuenta de Google y no puede ser modificado manualmente.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2">
            Personalización
          </h2>
          <div className="rounded-[2.5rem] border border-border/40 bg-card/40 p-8 backdrop-blur-md shadow-xl">
            <ProfileForm initialAlias={user.alias ?? ""} initialLevel={user.level} />
          </div>
        </section>
      </div>
    </div>
  );
}
