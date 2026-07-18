import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "./profile-form";
import { getEditableProfile, getGoogleAvatarUrl } from "@/lib/queries";
import { UserCircle } from "lucide-react";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ProfilePage() {
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Personalizá tu identidad y nivel.
        </p>
      </div>

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
    </div>
  );
}
