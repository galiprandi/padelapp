import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "./profile-form";
import { getEditableProfile, getGoogleAvatarUrl } from "@/lib/queries";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Shield, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Cómo te ven los demás jugadores en el ranking y los partidos.
        </p>
      </div>

      <Suspense fallback={<ProfileFormSkeleton />}>
        <ProfileFormSection />
      </Suspense>

      <Link
        href="/me/security"
        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Shield className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            Seguridad
          </p>
          <p className="text-xs text-muted-foreground">
            Huella y Face ID para entrar más rápido
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
      </Link>
    </div>
  );
}

async function ProfileFormSection() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, googleAvatarUrl] = await Promise.all([
    getEditableProfile(session.user.id),
    getGoogleAvatarUrl(session.user.id),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileForm
      initialAlias={user.alias ?? ""}
      initialImage={googleAvatarUrl ?? user.image}
      googleAvatarUrl={googleAvatarUrl}
      displayName={user.displayName}
    />
  );
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar card skeleton */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      {/* Alias field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
