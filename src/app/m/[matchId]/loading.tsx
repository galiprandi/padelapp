import { InvitationSkeleton } from "./page";

export default function InvitationLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-32">
      <InvitationSkeleton />
    </main>
  );
}
