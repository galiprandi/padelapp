import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar perfil"
        description="Personalizá cómo te ven tus rivales y tu nivel de juego."
        size="md"
      />

      <Card className="rounded-3xl bg-card/50 backdrop-blur-sm border-border/40 overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Nombre de Google</p>
            <p className="text-lg font-bold text-foreground">
              {user.displayName}
            </p>
            <p className="text-xs text-muted-foreground italic">
              Este nombre viene de tu cuenta de Google y no se puede cambiar.
            </p>
          </div>

          <ProfileForm initialAlias={user.alias ?? ""} initialLevel={user.level} />
        </CardContent>
      </Card>
    </div>
  );
}
