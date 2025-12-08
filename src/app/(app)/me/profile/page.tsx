import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

function formatLevel(level: number | null | undefined) {
  if (typeof level !== "number") return "Nivel —";
  if (level <= 2) return `Nivel ${level} · Profesional`;
  if (level <= 4) return `Nivel ${level} · Avanzado`;
  if (level <= 6) return `Nivel ${level} · Intermedio`;
  return `Nivel ${level} · Principiante`;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const displayName = session.user.displayName ?? "Jugador";
  const level = session.user.level;
  const alias = session.user.alias ?? "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Editar perfil"
        description="Personalizá cómo te ven tus rivales."
        size="md"
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Nombre de Google</p>
            <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm font-medium">
              {displayName}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">Nivel</p>
            <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm font-medium">
              {formatLevel(level)}
            </p>
          </div>
        </CardContent>
      </Card>

      <ProfileForm initialAlias={alias} />
    </div>
  );
}
