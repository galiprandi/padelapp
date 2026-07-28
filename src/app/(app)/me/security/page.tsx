import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PasskeyManager } from "@/components/webauthn/passkey-manager";
import { getUserPasskeys } from "@/lib/webauthn/actions";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/me/profile"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Seguridad</h1>
          <p className="text-sm text-muted-foreground">
            Iniciá sesión sin contraseña usando tu huella o Face ID.
          </p>
        </div>
      </div>

      <Suspense fallback={<SecuritySkeleton />}>
        <PasskeySection />
      </Suspense>
    </div>
  );
}

async function PasskeySection() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const passkeys = await getUserPasskeys();
  return <PasskeyManager initialPasskeys={passkeys} />;
}

function SecuritySkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
