import Link from "next/link";
import { auth } from "@/auth";
import {
  MatchResultCompact,
  type MatchResultCompactMatch,
} from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { TurnCard } from "@/components/turns/turn-card";
import { OpenToNetworkButton } from "@/components/turns/open-to-network-button";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { PushPermissionPrompt } from "@/components/pwa/push-permission-prompt";
import { PasskeyOnboarding } from "@/components/webauthn/passkey-onboarding";
import {
  CalendarDays,
  Trophy,
  ChevronRight,
  Activity,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import {
  getEnhancedUserMatches,
  getPendingActions,
  getPendingAttendanceActions,
  getDashboardUserStats,
  getMyUpcomingTurns,
  getMySubstituteTurns,
  getRecommendedTurns,
} from "@/lib/queries";
import { getUserPasskeys } from "@/lib/webauthn/actions";
import { cn, getMatchWinner } from "@/lib/utils";
import { Greeting } from "@/components/greeting";
import { LocalDate } from "@/components/ui/local-date";
import { OnboardingChecklist } from "@/components/onboarding-checklist";

export default async function DashboardContent() {
  const session = await auth();
  const viewerId = session?.user?.id;

  if (!viewerId) return null;

  const now = new Date();

  const [
    userStats,
    allPendingMatches,
    recentMatches,
    pendingAttendance,
    myTurns,
    mySubstituteTurns,
    recommendedTurns,
    passkeys,
  ] = await Promise.all([
    getDashboardUserStats(viewerId),
    getEnhancedUserMatches(viewerId, "PENDING"),
    getEnhancedUserMatches(viewerId, "CONFIRMED"),
    getPendingAttendanceActions(viewerId),
    getMyUpcomingTurns(viewerId, 3),
    getMySubstituteTurns(viewerId, 3),
    getRecommendedTurns(viewerId, 3),
    getUserPasskeys(),
  ]);

  const user = userStats;

  const pendingActionMatches = await getPendingActions(
    viewerId,
    allPendingMatches,
  );

  const upcomingMatches = allPendingMatches
    .filter((m) => new Date(m.date || m.createdAt) >= now)
    .sort(
      (a, b) =>
        new Date(a.date || a.createdAt).getTime() -
        new Date(b.date || b.createdAt).getTime(),
    );

  const displayName =
    user?.alias ?? user?.displayName ?? session?.user?.name ?? "Jugador";

  const isNewUser = user ? user.matchesPlayed === 0 : false;

  const agendaItems = [
    ...myTurns.map((turn) => ({
      id: turn.id,
      type: "turn" as const,
      date: new Date(turn.date),
      data: turn,
    })),
    ...upcomingMatches.map((match) => ({
      id: match.id,
      type: "match" as const,
      date: new Date(match.date ?? match.createdAt),
      data: match,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const heroActivity =
    agendaItems.length > 0 &&
    agendaItems[0].date.getTime() - now.getTime() < 24 * 60 * 60 * 1000
      ? agendaItems[0]
      : null;

  const remainingAgendaItems = heroActivity
    ? agendaItems.slice(1)
    : agendaItems;

  const recentForm = recentMatches.slice(0, 5).map((match) => {
    const winner = getMatchWinner(match.score ?? null);
    if (!winner) return "L";
    const player = match.players.find((p) => p.user?.id === viewerId);
    if (!player) return "L";
    const playerTeam = player.position < 2 ? "A" : "B";
    return winner === playerTeam ? "W" : "L";
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <PlayerAvatar
          name={displayName}
          image={user?.image ?? undefined}
          size={44}
          aria-hidden="true"
        />
        <div className="space-y-0.5">
          <Greeting name={displayName} />
          <p className="text-sm text-muted-foreground">
            {isNewUser
              ? "¡Bienvenido! Empezá creando tu primer turno."
              : "Tu actividad de pádel en un solo lugar."}
          </p>
        </div>
      </div>

      {isNewUser ? (
        <>
          {/* Hero CTA for first-time users */}
          {agendaItems.length === 0 && (
            <Link
              href="/turnos/nuevo"
              className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    Creá tu primer turno
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Armá un turno, compartilo por WhatsApp y jugá.
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </Link>
          )}
          <OnboardingChecklist
            initialAlias={user?.alias ?? null}
            hasActivity={agendaItems.length > 0}
          />
        </>
      ) : (
        !user?.alias && (
          <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-amber-600" />
              <h2 className="text-sm font-bold text-amber-800">
                ¡Completá tu perfil de jugador!
              </h2>
            </div>
            <p className="text-xs text-amber-700 leading-normal">
              Elegí tu alias en la cancha para que otros
              jugadores te reconozcan en los partidos y ranking.
            </p>
            <Button
              className="w-full h-10 bg-amber-500 text-primary-foreground hover:bg-amber-600 text-xs font-bold"
              asChild
            >
              <Link href="/me/profile">Configurar mi perfil</Link>
            </Button>
          </div>
        )
      )}

      {/* Passkey Onboarding */}
      <PasskeyOnboarding hasPasskeys={passkeys.length > 0} />

      {/* Stats row */}
      {user && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/ranking"
            className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary/70 transition-colors">
              Ranking
            </span>
            <span className="text-xl font-bold text-foreground">
              #{user.rankingPosition ?? "-"}
            </span>
          </Link>
          <Link
            href="/match"
            className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary/70 transition-colors">
              Partidos
            </span>
            <span className="text-xl font-bold text-foreground">
              {user.matchesPlayed}
            </span>
          </Link>
          <Link
            href="/ranking"
            className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary/70 transition-colors">
              Victorias
            </span>
            <span className="text-xl font-bold text-primary">{user.wins}</span>
          </Link>
          <Link
            href="/ranking"
            className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02]"
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary/70 transition-colors">
              Reputación
            </span>
            <span className="text-xl font-bold text-foreground">
              {Math.round((user.attendanceScore ?? 1) * 100)}%
            </span>
          </Link>
        </div>
      )}

      {!isNewUser && (
        <>
          <PwaInstallBanner />
          <PushPermissionPrompt />
        </>
      )}

      {/* Hero Activity */}
      {heroActivity && (
        <section
          className={cn(
            "space-y-3 rounded-xl border p-4",
            heroActivity.type === "turn" &&
              heroActivity.data.players.length < heroActivity.data.maxPlayers
              ? "border-amber-500/30 bg-amber-50"
              : "border-primary/20 bg-muted/30",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {heroActivity.type === "turn" &&
              heroActivity.data.players.length <
                heroActivity.data.maxPlayers ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <Activity className="h-4 w-4 text-primary" />
              )}
              <h2 className="text-sm font-bold text-foreground">
                {heroActivity.type === "turn" &&
                heroActivity.data.players.length < heroActivity.data.maxPlayers
                  ? "Turno incompleto"
                  : "Próxima actividad"}
              </h2>
            </div>
            {heroActivity.type === "turn" &&
              heroActivity.data.players.length <
                heroActivity.data.maxPlayers && (
                <span className="text-xs font-bold text-amber-600">
                  ¡Faltan{" "}
                  {heroActivity.data.maxPlayers -
                    heroActivity.data.players.length}
                  !
                </span>
              )}
          </div>

          {heroActivity.type === "turn" ? (
            <div className="flex flex-col gap-3">
              <TurnCard
                turn={heroActivity.data}
                isJoined={true}
                isCreator={heroActivity.data.creatorId === viewerId}
              />
              {heroActivity.data.players.length <
                heroActivity.data.maxPlayers && (
                <OpenToNetworkButton
                  turnId={heroActivity.id}
                  club={heroActivity.data.club}
                  lastNetworkNotificationAt={heroActivity.data.lastNetworkNotificationAt}
                  variant="default"
                  label="Salvar turno: Notificar a mi red"
                  className="h-10 bg-amber-500 hover:bg-amber-600"
                />
              )}
            </div>
          ) : (
            <MatchResultCompact
              match={heroActivity.data as MatchResultCompactMatch}
              detailUrl={`/match/${heroActivity.id}`}
              label="Partido inminente"
              viewerId={viewerId}
            />
          )}
        </section>
      )}

      {/* Pending actions */}
      {pendingActionMatches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Acciones pendientes
              </h2>
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                {pendingActionMatches.length}
              </span>
            </div>
            {pendingActionMatches.length > 3 && (
              <Link
                href="/notifications"
                className="flex items-center text-xs text-muted-foreground hover:text-foreground"
              >
                Ver todas <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {pendingActionMatches.slice(0, 3).map((match) => {
              const needsScore = !match.score;
              return (
                <MatchResultCompact
                  key={match.id}
                  match={match}
                  detailUrl={
                    needsScore
                      ? `/match/${match.id}/result`
                      : `/match/${match.id}`
                  }
                  label={
                    needsScore ? "Cargar resultado" : "Confirmación pendiente"
                  }
                  viewerId={viewerId}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Pending attendance marking (creator only) */}
      {pendingAttendance.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">
              Marcar asistencia
            </h2>
            <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-600">
              {pendingAttendance.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingAttendance.slice(0, 3).map((match) => (
              <Link
                key={match.id}
                href={`/match/${match.id}/result`}
                className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-card p-3 transition-all hover:bg-muted hover:border-amber-500/50"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {match.club || "Partido"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <LocalDate
                      date={match.date}
                      options={{ day: "2-digit", month: "2-digit" }}
                      locale="es-AR"
                    />{" "}
                    · {match.playersWithoutAttendance} sin marcar
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* My Agenda */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Mi Agenda</h2>
          <Link
            href="/turnos"
            className="flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {remainingAgendaItems.length > 0 ? (
            remainingAgendaItems.map((item) => {
              return item.type === "turn" ? (
                <div
                  key={item.id}
                  className="border-l-4 border-l-blue-500/40 rounded-r-xl overflow-hidden"
                >
                  <TurnCard
                    turn={item.data}
                    isJoined={item.data.players.some(
                      (p: { userId: string }) => p.userId === viewerId,
                    )}
                    isCreator={item.data.creatorId === viewerId}
                  />
                </div>
              ) : (
                <div
                  key={item.id}
                  className="border-l-4 border-l-primary/40 rounded-r-xl overflow-hidden"
                >
                  <MatchResultCompact
                    match={item.data as MatchResultCompactMatch}
                    detailUrl={`/match/${item.id}`}
                    label="Próximo partido"
                    viewerId={viewerId}
                  />
                </div>
              );
            })
          ) : !heroActivity ? (
            <EmptyState
              icon={CalendarDays}
              title="Tu agenda está vacía"
              description="Sumate a un turno abierto o creá un partido con amigos."
              action={
                <div className="flex flex-col gap-2 w-full">
                  <Button className="w-full h-12" asChild>
                    <Link href="/turnos">Explorar turnos</Link>
                  </Button>
                  <Button variant="outline" className="w-full h-12" asChild>
                    <Link href="/turnos/nuevo">Crear un turno</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-muted-foreground">
                No hay más actividades programadas.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* My substitute turns */}
      {mySubstituteTurns.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Soy suplente</h2>
            <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-600">
              {mySubstituteTurns.length}
            </span>
          </div>
          <div className="space-y-2">
            {mySubstituteTurns.map((turn) => {
              const hasOpenSlot = turn.players.length < turn.maxPlayers;
              return (
                <Link
                  key={turn.id}
                  href={`/t/${turn.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-card p-3 transition-all hover:bg-muted hover:border-amber-500/50"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {turn.club}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <LocalDate
                        date={turn.date}
                        options={{
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }}
                        locale="es-AR"
                      />
                      {" · "}
                      {turn.players.length}/{turn.maxPlayers} jugadores
                    </span>
                  </div>
                  {hasOpenSlot ? (
                    <span className="rounded-md bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-600 shrink-0">
                      ¡Cupo libre!
                    </span>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommended turns */}
      {recommendedTurns.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">
            Turnos disponibles
          </h2>
          <div className="space-y-2">
            {recommendedTurns.map((turn) => (
              <TurnCard
                key={turn.id}
                turn={turn}
                variant="recommended"
                isJoined={turn.players.some(
                  (p: { userId: string }) => p.userId === viewerId,
                )}
                isCreator={turn.creatorId === viewerId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent results */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">
              Últimos resultados
            </h2>
            {recentForm.length > 0 && (
              <div
                className="flex gap-1"
                aria-label={`Forma reciente: ${recentForm
                  .map((r) => (r === "W" ? "G" : "P"))
                  .join(", ")}`}
              >
                {recentForm.map((result, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={cn(
                      "h-2 w-2 rounded-full",
                      result === "W" ? "bg-emerald-500" : "bg-rose-500",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <MatchResultCompact
                key={match.id}
                match={match}
                detailUrl={`/match/${match.id}`}
                viewerId={viewerId}
              />
            ))
          ) : (
            <EmptyState
              icon={Trophy}
              title="Sin resultados todavía"
              description="Cuando registres un marcador, vas a verlo acá."
              action={
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/match">Ver historial</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
