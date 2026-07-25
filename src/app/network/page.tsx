import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { NetworkPageClient } from "./network-page-client";
import { getAdoptionMetrics, getGraphData } from "./actions";

export default function NetworkPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[100dvh] flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <NetworkContent />
    </Suspense>
  );
}

async function NetworkContent() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const [metrics, graphData] = await Promise.all([
    getAdoptionMetrics(),
    getGraphData(),
  ]);

  return <NetworkPageClient metrics={metrics} graphData={graphData} />;
}
