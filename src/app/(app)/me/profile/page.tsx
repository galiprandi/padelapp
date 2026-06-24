import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { prisma } from "@/lib/prisma";
import { UserCircle } from "lucide-react";

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
      image: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-12 pb-10 animate-in fade-in duration-700">
      <div className="space-y-8">
        <PageHeader
          title="Mi Perfil"
          description="Personalizá tu identidad y nivel de juego para la comunidad."
          size="lg"
          backHref="/me"
        />

        <section className="relative group">
          <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full -z-10 group-hover:bg-primary/20 transition-colors duration-1000" />

          <Card className="rounded-[2.5rem] bg-card/30 backdrop-blur-2xl border-border/40 overflow-hidden shadow-2xl relative">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.displayName ?? ""}
                    className="relative w-32 h-32 rounded-[2.5rem] object-cover border-4 border-background shadow-xl"
                  />
                ) : (
                  <div className="relative w-32 h-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border-4 border-background shadow-xl">
                    <UserCircle className="w-16 h-16 text-primary/40" />
                  </div>
                )}
              </div>

              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  Nombre de Google
                </p>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  {user.displayName}
                </h2>
                <p className="text-xs text-muted-foreground/60 italic max-w-[240px] mx-auto leading-relaxed">
                  Este nombre está vinculado a tu cuenta y no se puede editar.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both">
        <div className="flex items-center gap-2 px-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Ajustes de cuenta
          </h3>
        </div>

        <Card className="rounded-[2.5rem] bg-card/50 backdrop-blur-md border-border/40 overflow-hidden shadow-lg">
          <CardContent className="p-8">
            <ProfileForm initialAlias={user.alias ?? ""} initialLevel={user.level} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
