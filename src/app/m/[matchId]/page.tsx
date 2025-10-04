import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { acceptInvitationAction } from "./actions";

interface InvitationPageProps {
  params: { matchId: string };
  searchParams: { token?: string };
}

export default async function InvitationPage({ params, searchParams }: InvitationPageProps) {
  const { matchId } = params;
  const token = searchParams.token;

  if (!token) {
    notFound();
  }

  const session = await auth();

  const invitation = await prisma.matchInvitation.findFirst({
    where: { matchId, token },
    include: {
      match: {
        include: {
          creator: true,
          players: {
            orderBy: { position: "asc" },
            include: { user: true },
          },
        },
      },
    },
  });

  if (!invitation) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-5 py-10 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Invitation not found</h1>
        <p className="text-sm text-muted-foreground">
          This match invitation may have expired or was already used.
        </p>
        <Button asChild>
          <Link href="/">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  const isExpired = invitation.expiresAt < new Date();
  const isAccepted = invitation.accepted;
  const match = invitation.match;
  const acceptAction = acceptInvitationAction.bind(null, matchId, token);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-5 py-10">
      <header className="space-y-2 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Match invitation</p>
        <h1 className="text-2xl font-semibold text-foreground">Join this match</h1>
        <p className="text-sm text-muted-foreground">
          {match.creator.displayName} is inviting you to confirm a padel match.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Match type</span>
          <span className="font-medium text-foreground">{match.matchType.replace("_", " ")}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sets</span>
          <span className="font-medium text-foreground">{match.sets}</span>
        </div>
        {match.club ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Club</span>
            <span className="font-medium text-foreground">{match.club}</span>
          </div>
        ) : null}
        {match.courtNumber ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Court</span>
            <span className="font-medium text-foreground">{match.courtNumber}</span>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Players</h2>
        <div className="grid grid-cols-2 gap-3">
          {match.players.map((slot) => (
            <div key={slot.position} className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">{slot.user?.displayName ?? "Pending"}</p>
              <p className="text-xs text-muted-foreground">
                {slot.position < 2 ? "Team A" : "Team B"} · Player {slot.position % 2 === 0 ? 1 : 2}
              </p>
            </div>
          ))}
        </div>
      </section>

      {isExpired ? (
        <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-5 text-center">
          <h3 className="text-lg font-semibold text-foreground">Invitation expired</h3>
          <p className="text-sm text-muted-foreground">
            Ask the match creator to resend the invitation.
          </p>
        </div>
      ) : isAccepted ? (
        <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-5 text-center">
          <h3 className="text-lg font-semibold text-foreground">Already confirmed</h3>
          <p className="text-sm text-muted-foreground">
            This slot has already been claimed. Continue to the match details to review the information.
          </p>
          <Button asChild>
            <Link href={`/match/${matchId}`}>View match</Link>
          </Button>
        </div>
      ) : session?.user ? (
        <form action={acceptAction} className="space-y-4">
          <Button className="w-full" size="lg" type="submit">
            Confirm my spot
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href={`/match/${matchId}`}>View match details</Link>
          </Button>
        </form>
      ) : (
        <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in with Google to confirm your participation.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link href={`/login?callbackUrl=${encodeURIComponent(`/m/${matchId}?token=${token}`)}`}>
              Continue with Google
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
