import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { NetworkPageClient } from "./network-page-client";
import { getAdoptionMetrics, getGraphData, getPlayersLikeYouAction } from "./actions";
import { NetworkSkeleton } from "./network-skeleton";

export default function NetworkPage() {
  return (
    <Suspense fallback={<NetworkSkeleton />}>
      <NetworkContent />
    </Suspense>
  );
}

async function NetworkContent() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const [metrics, graphData, playersLikeYou] = await Promise.all([
    getAdoptionMetrics(),
    getGraphData(),
    getPlayersLikeYouAction(session.user.id),
  ]);

  return (
    <NetworkPageClient
      metrics={metrics}
      graphData={graphData}
      viewerId={session.user.id}
      playersLikeYou={playersLikeYou}
    />
  );
}
