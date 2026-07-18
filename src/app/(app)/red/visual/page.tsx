import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GraphView from "./graph-view";

export default async function VisualPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <GraphView />
    </div>
  );
}
