import Link from "next/link";
import { ChevronLeft, TrendingUp, TrendingDown, Users, CalendarDays, Trophy, Bell, Network, Activity } from "lucide-react";
import type { AdoptionMetrics } from "./actions";
import { PlayerAvatar } from "@/components/players/player-avatar";

interface StatsPanelProps {
  metrics: AdoptionMetrics;
  graphNodes: number;
  graphLinks: number;
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

export function StatsPanel({ metrics, graphNodes, graphLinks }: StatsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/me"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted active:scale-[0.98]"
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
                  name={p.alias ?? p.name}
                  image={p.image ?? undefined}
                  size={32}
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {p.alias ?? p.name}
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
    </div>
  );
}
