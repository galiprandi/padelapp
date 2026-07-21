import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GraphView from "./graph-view";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function VisualPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[100dvh] flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <GraphContent />
    </Suspense>
  );
}

async function GraphContent() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="w-full h-[100dvh] overflow-hidden">
      <GraphView />
    </div>
  );
}
