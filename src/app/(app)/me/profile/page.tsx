import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "./profile-form";
import { PasskeyManager } from "@/components/webauthn/passkey-manager";
import { getEditableProfile, getGoogleAvatarUrl } from "@/lib/queries";
import { getUserPasskeys } from "@/lib/webauthn/actions";
import { UserCircle } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Personalizá tu identidad y nivel.
        </p>
      </div>

      <Suspense fallback={<ProfileFormSkeleton />}>
        <ProfileFormSection />
      </Suspense>
    </div>
  );
}

async function ProfileFormSection() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, googleAvatarUrl, passkeys] = await Promise.all([
    getEditableProfile(session.user.id),
    getGoogleAvatarUrl(session.user.id),
    getUserPasskeys(),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4">
        {user.image ? (
          <img
            src={user.image}
            alt={user.displayName ?? ""}
            className="w-20 h-20 rounded-xl object-cover border-2 border-border"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center border-2 border-border">
            <UserCircle className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {user.displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.alias || user.email}
          </p>
        </div>
      </div>

      <ProfileForm
        initialAlias={user.alias ?? ""}
        initialLevel={user.level}
        initialImage={user.image}
        googleAvatarUrl={googleAvatarUrl}
      />

      <PasskeyManager initialPasskeys={passkeys} />
    </div>
  );
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* User avatar and info card skeleton */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-20 w-20 rounded-xl" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>

      {/* Profile Form skeleton */}
      <div className="space-y-6 rounded-xl border border-border bg-card p-4">
        {/* Avatar selector skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-4 rounded-xl border border-border p-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Alias field skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {/* Level selector skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
