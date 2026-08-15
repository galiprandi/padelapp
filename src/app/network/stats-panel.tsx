import Link from "next/link";
import { ChevronLeft, TrendingUp, TrendingDown, Users, CalendarDays, Trophy, Bell, Network, Activity, MapPin, Clock } from "lucide-react";
import type { AdoptionMetrics, RecommendedPlayer } from "./actions";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { capitalizeName } from "@/lib/utils";

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return months === 1 ? "hace 1 mes" : `hace ${months} meses`;
  }
  if (days >= 1) return days === 1 ? "hace 1 día" : `hace ${days} días`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours >= 1) return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes >= 1) return `hace ${minutes} min`;
  return "recién";
}

interface StatsPanelProps {
  metrics: AdoptionMetrics;
  graphNodes: number;
  graphLinks: number;
  playersLikeYou: RecommendedPlayer[];
}

function GrowthBadge({ rate }: { rate: number }) {
  const isPositive = rate >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-bold tabular-nums ${
        isPositive ? "text-emerald-600" : "text-red-600"
      }`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {isPositive ? "+" : ""}
      {rate.toFixed(0)}%
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  growth,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: React.ReactNode;
  growth?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        {growth !== undefined && <GrowthBadge rate={growth} />}
      </div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function StatsPanel({ metrics, graphNodes, graphLinks, playersLikeYou }: StatsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/me"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
          aria-label="Volver al inicio"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Red & Adopción
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoreo de la red de contactos y adopción de la app.
          </p>
        </div>
      </div>

      {/* Adoption stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Usuarios"
          value={metrics.totalUsers}
          icon={Users}
          sub={`${metrics.newUsers7d} nuevos esta semana`}
          growth={metrics.userGrowthRate}
        />
        <StatCard
          label="Turnos"
          value={metrics.totalTurns}
          icon={CalendarDays}
          sub={`${metrics.newTurns7d} esta semana`}
          growth={metrics.turnGrowthRate}
        />
        <StatCard
          label="Partidos"
          value={metrics.totalMatches}
          icon={Trophy}
          sub={`${metrics.confirmedMatches} confirmados`}
          growth={metrics.matchGrowthRate}
        />
        <StatCard
          label="Inscripciones"
          value={metrics.totalEnrollments}
          icon={Activity}
          sub="Total a turnos"
        />
      </div>

      {/* Network stats */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">Red de contactos</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Jugadores</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {graphNodes}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Conexiones</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {graphLinks}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Densidad</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {(metrics.networkDensity * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="space-y-0.5 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Promedio de contactos por jugador
          </p>
          <p className="text-sm font-bold tabular-nums text-foreground">
            {metrics.avgConnectionsPerPlayer.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Jugadores como vos 🧠 */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-foreground">Jugadores como vos 🧠</h2>
            <p className="text-xs text-muted-foreground">
              Gente de tu nivel y comunidad con la que todavía no jugaste.
            </p>
          </div>
        </div>
        {playersLikeYou.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {playersLikeYou.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar
                    name={capitalizeName(player.name ?? player.alias ?? "?")}
                    image={player.image ?? undefined}
                    size={36}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {capitalizeName(player.name ?? player.alias ?? "?")}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {player.matchesPlayed} {player.matchesPlayed === 1 ? "partido" : "partidos"} · {player.preferredSide === "RIGHT" ? "Derecha" : player.preferredSide === "LEFT" ? "Revés" : "Lado no definido"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="rounded-md bg-muted px-2 py-1 text-center border border-border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Score</p>
                    <p className="text-xs font-bold tabular-nums text-foreground">
                      {player.skillScore}
                    </p>
                  </div>
                  <Link
                    href={`/p/${player.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                  >
                    Perfil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground pt-1 italic">
            No hay nuevos jugadores sugeridos por ahora.
          </p>
        )}
      </div>

      {/* Engagement stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Sesiones activas"
          value={metrics.activeSessions}
          icon={Activity}
        />
        <StatCard
          label="Activos (30d)"
          value={metrics.pushEnabled}
          icon={Bell}
          sub="Con sesión reciente"
        />
      </div>

      {/* Latest registered users */}
      {metrics.recentUsers.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">
              Últimos usuarios
            </h2>
          </div>
          <div className="space-y-2">
            {metrics.recentUsers.map((u) => (
              <Link
                key={u.id}
                href={`/p/${u.id}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <PlayerAvatar
                  name={capitalizeName(u.name ?? u.alias ?? "?")}
                  image={u.image ?? undefined}
                  size={32}
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {capitalizeName(u.name ?? u.alias ?? "?")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(u.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top communities */}
      {metrics.communities.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-foreground">Comunidades</h2>
          <div className="space-y-2">
            {metrics.communities.map((c) => {
              const max = metrics.communities[0]?.size ?? 1;
              const pct = (c.size / max) * 100;
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      Grupo {c.id}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {c.size} jugadores
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top connected players */}
      {metrics.topPlayers.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-foreground">
            Más conectados
          </h2>
          <div className="space-y-2">
            {metrics.topPlayers.map((p, i) => (
              <Link
                key={p.id}
                href={`/p/${p.id}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <span className="text-xs font-bold text-muted-foreground w-4 tabular-nums">
                  {i + 1}
                </span>
                <PlayerAvatar
                  name={capitalizeName(p.name ?? p.alias ?? "?")}
                  image={p.image ?? undefined}
                  size={32}
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {capitalizeName(p.name ?? p.alias ?? "?")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.matchesPlayed} partidos
                  </p>
                </div>
                <span className="text-xs font-bold tabular-nums text-primary">
                  {p.networkSize}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 30-day summary */}
      <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
        <h2 className="text-sm font-bold text-foreground">Últimos 30 días</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.newUsers30d}
            </p>
            <p className="text-xs text-muted-foreground">Usuarios</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.newTurns30d}
            </p>
            <p className="text-xs text-muted-foreground">Turnos</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.newMatches30d}
            </p>
            <p className="text-xs text-muted-foreground">Partidos</p>
          </div>
        </div>
      </div>

      {/* Top clubs by activity */}
      {metrics.topClubs.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">
              Clubes con más actividad
            </h2>
          </div>
          <div className="space-y-2">
            {metrics.topClubs.map((c, i) => {
              const max = metrics.topClubs[0]?.total ?? 1;
              const pct = (c.total / max) * 100;
              return (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-foreground truncate">
                      <span className="text-muted-foreground tabular-nums w-4">
                        {i + 1}.
                      </span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="text-muted-foreground tabular-nums shrink-0">
                      {c.turns}T · {c.matches}P
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
