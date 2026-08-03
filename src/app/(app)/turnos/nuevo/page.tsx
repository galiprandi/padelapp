import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEditableProfile } from "@/lib/queries";
import { CreateTurnForm } from "./create-form";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewTurnPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/turnos"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Nuevo turno</h1>
          <p className="text-sm text-muted-foreground">
            Configurá cancha y cupos.
          </p>
        </div>
      </div>

      <Suspense fallback={<NewTurnSkeleton />}>
        <NewTurnContent />
      </Suspense>
    </div>
  );
}

function NewTurnSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-4 border-b border-border">
        <div className="h-5 w-40 bg-muted/60 animate-pulse rounded" />
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-muted/60 animate-pulse rounded" />
          <div className="h-12 w-full bg-muted/60 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-12 bg-muted/60 animate-pulse rounded" />
            <div className="h-12 w-full bg-muted/60 animate-pulse rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 bg-muted/60 animate-pulse rounded" />
            <div className="h-12 w-full bg-muted/60 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted/60 animate-pulse rounded" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted/60 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function NewTurnContent() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getEditableProfile(session.user.id);

  if (!user) {
    redirect("/login");
  }

  return <CreateTurnForm userLevel={user.level} />;
}
