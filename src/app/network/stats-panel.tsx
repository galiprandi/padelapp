import Link from "next/link";
import { ChevronLeft, TrendingUp, TrendingDown, Users, CalendarDays, Trophy, Bell, Network, Activity, MapPin, Clock } from "lucide-react";
import type { AdoptionMetrics, GraphData, RecommendedPlayer } from "./actions";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { capitalizeName, cn } from "@/lib/utils";
import {
  calculateCommunityBalanceInfo,
  calculateCommunityCohesion,
  calculateNetworkCentralityScore,
  calculateNetworkDiversityScore,
  calculateNetworkExpansionPotential,
  calculateNetworkMultiBelonging,
  calculateNetworkRoleInfo,
  calculatePartnershipStabilityInfo,
  calculatePlayerInteractionReciprocity,
  calculatePlayerSimilarityInfo,
  formatGrowthRateText,
  formatTimeAgo,
  getGrowthBadgeClasses,
  getNetworkActivityTier,
  getRecent30DaysHeadingTitle,
  getRecentUsersHeadingTitle,
  getRecommendedPlayerAriaLabel,
  getRecommendedPlayerAvatarAriaLabel,
  getRecommendedPlayerContainerClasses,
  getRecommendedPlayerProfileLinkAriaLabel,
  getRecommendedPlayerSideText,
  getRecommendedPlayerSkillText,
  getRecommenderEmptyStateText,
  getRecommenderHeadingDescription,
  getRecommenderHeadingTitle,
  getStatCardContainerClasses,
  getStatsCardCommunityLabel,
  getStatsCardCommunityMembersText,
  getStatsPanelBackAriaLabel,
  getStatsPanelHeadingDescription,
  getStatsPanelHeadingTitle,
  getStatsPanelRegionAriaLabel,
  getTopClubsHeadingTitle,
  getTopCommunitiesHeadingTitle,
  getTopConnectedHeadingTitle,
  getTopPlayerContactsText,
  getTopPlayerExpansionAriaLabel,
  getTopPlayerMatchesText,
  getTopPlayerRankText,
} from "./graph-utils";

interface StatsPanelProps {
  metrics: AdoptionMetrics;
  graphNodes: number;
  graphLinks: number;
  playersLikeYou: RecommendedPlayer[];
  graphData?: GraphData;
  viewerId?: string;
}

function GrowthBadge({ rate }: { rate: number }) {
  const isPositive = rate >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={getGrowthBadgeClasses(rate)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {formatGrowthRateText(rate)}
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
    <div className={getStatCardContainerClasses()}>
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

export function StatsPanel({ metrics, graphNodes, graphLinks, playersLikeYou, graphData, viewerId }: StatsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div
        role="region"
        aria-label={getStatsPanelRegionAriaLabel("header")}
        className="flex items-center gap-3"
      >
        <Link
          href="/me"
          prefetch={true}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
          aria-label={getStatsPanelBackAriaLabel()}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-foreground">
            {getStatsPanelHeadingTitle()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getStatsPanelHeadingDescription()}
          </p>
        </div>
      </div>

      {/* Adoption stats grid */}
      <div
        role="region"
        aria-label={getStatsPanelRegionAriaLabel("overview")}
        className="grid grid-cols-2 gap-3"
      >
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
      <div
        role="region"
        aria-label={getStatsPanelRegionAriaLabel("network")}
        className="rounded-xl border border-border bg-card p-4 space-y-3"
      >
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
      <div
        role="region"
        aria-label={getStatsPanelRegionAriaLabel("recommender")}
        className="rounded-xl border border-border bg-card p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-foreground">{getRecommenderHeadingTitle()}</h2>
            <p className="text-xs text-muted-foreground">
              {getRecommenderHeadingDescription()}
            </p>
          </div>
        </div>
        {playersLikeYou.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {playersLikeYou.map((player) => {
              const effectiveViewerId = viewerId ?? "p-01";
              const viewerNode = graphData?.nodes.find((n) => n.id === effectiveViewerId);
              const similarity = calculatePlayerSimilarityInfo(
                player,
                {
                  id: viewerNode?.id ?? effectiveViewerId,
                  skillScore: viewerNode?.skillScore ?? 1000,
                  preferredSide: viewerNode?.preferredSide ?? null,
                },
                graphData?.links ?? [],
              );

              const name = capitalizeName(player.name ?? player.alias ?? "Jugador");
              const avatarName = capitalizeName(player.name ?? player.alias ?? "?");
              const sideText = getRecommendedPlayerSideText(player.preferredSide);
              const skillText = getRecommendedPlayerSkillText(player.skillScore);
              const recommendedAriaLabel = getRecommendedPlayerAriaLabel(
                name,
                player.matchesPlayed,
                player.preferredSide,
                player.skillScore,
              );

              return (
                <div
                  key={player.id}
                  className={getRecommendedPlayerContainerClasses()}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/p/${player.id}`}
                      prefetch={true}
                      aria-label={recommendedAriaLabel}
                      className="flex items-center gap-3 min-w-0 rounded-lg transition-all hover:opacity-80 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    >
                      <div aria-label={getRecommendedPlayerAvatarAriaLabel(name)}>
                        <PlayerAvatar
                          name={avatarName}
                          image={player.image ?? undefined}
                          size={36}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-foreground truncate">
                            {name}
                          </p>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                              similarity.badgeStyle,
                            )}
                            title={`Similitud de juego: ${similarity.similarityTier}. ${similarity.formattedSummary}`}
                            aria-label={`Similitud de juego de ${name}: ${similarity.similarityTier}. ${similarity.formattedSummary}`}
                          >
                            {similarity.similarityTier}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {getTopPlayerMatchesText(player.matchesPlayed)} · {sideText}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="rounded-md bg-muted px-2 py-1 text-center border border-border">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Score</p>
                        <p className="text-xs font-bold tabular-nums text-foreground">
                          {skillText}
                        </p>
                      </div>
                      <Link
                        href={`/p/${player.id}`}
                        prefetch={true}
                        aria-label={getRecommendedPlayerProfileLinkAriaLabel(name)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                      >
                        Perfil
                      </Link>
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground/90 pl-11 truncate">
                    {similarity.formattedSummary}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground pt-1 italic">
            {getRecommenderEmptyStateText()}
          </p>
        )}
      </div>

      {/* Engagement stats */}
      <div
        role="region"
        aria-label={getStatsPanelRegionAriaLabel("users")}
        className="grid grid-cols-2 gap-3"
      >
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
        <div
          role="region"
          aria-label={getStatsPanelRegionAriaLabel("users")}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">
              {getRecentUsersHeadingTitle()}
            </h2>
          </div>
          <div className="space-y-2">
            {metrics.recentUsers.map((u) => (
              <Link
                key={u.id}
                href={`/p/${u.id}`}
                prefetch={true}
                className="flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
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
                    {formatTimeAgo(u.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top communities */}
      {metrics.communities.length > 0 && (
        <div
          role="region"
          aria-label={getStatsPanelRegionAriaLabel("communities")}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
        >
          <h2 className="text-sm font-bold text-foreground">{getTopCommunitiesHeadingTitle()}</h2>
          <div className="space-y-2.5">
            {metrics.communities.map((c) => {
              const max = metrics.communities[0]?.size ?? 1;
              const pct = (c.size / max) * 100;
              const cohesion = graphData
                ? calculateCommunityCohesion(graphData.nodes, graphData.links, c.id)
                : null;
              const balanceInfo = graphData
                ? calculateCommunityBalanceInfo(graphData.nodes, c.id)
                : null;

              return (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {getStatsCardCommunityLabel(c.id)}
                      </span>
                      {cohesion && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            cohesion.badgeStyle,
                          )}
                          title={`Cohesión: ${cohesion.cohesionTier}. ${cohesion.formattedCohesionSummary}`}
                          aria-label={`Cohesión de Grupo ${c.id}: ${cohesion.cohesionTier}. ${cohesion.formattedCohesionSummary}`}
                        >
                          {cohesion.cohesionTier}
                        </span>
                      )}
                      {balanceInfo && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            balanceInfo.badgeStyle,
                          )}
                          title={`Balance de posiciones: ${balanceInfo.balanceTier}. ${balanceInfo.formattedBalanceSummary}`}
                          aria-label={`Balance de posiciones de Grupo ${c.id}: ${balanceInfo.balanceTier}. ${balanceInfo.formattedBalanceSummary}`}
                        >
                          {balanceInfo.balanceTier}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground tabular-nums text-xs">
                      {getStatsCardCommunityMembersText(c.size)}
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
        <div
          role="region"
          aria-label={getStatsPanelRegionAriaLabel("top-players")}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
        >
          <h2 className="text-sm font-bold text-foreground">
            {getTopConnectedHeadingTitle()}
          </h2>
          <div className="space-y-2">
            {metrics.topPlayers.map((p, i) => {
              const activityTier = getNetworkActivityTier(p.networkSize, p.matchesPlayed);
              const roleInfo = graphData
                ? calculateNetworkRoleInfo(graphData.nodes, graphData.links, p.id)
                : null;
              const centrality = graphData
                ? calculateNetworkCentralityScore(graphData.nodes, graphData.links, p.id)
                : null;
              const diversity = graphData
                ? calculateNetworkDiversityScore(graphData.nodes, graphData.links, p.id)
                : null;
              const multiBelonging = graphData
                ? calculateNetworkMultiBelonging(graphData.links, graphData.nodes, p.id)
                : null;
              const reciprocity = graphData
                ? calculatePlayerInteractionReciprocity(graphData.links, p.id)
                : null;
              const stability = graphData
                ? calculatePartnershipStabilityInfo(graphData.links, p.id)
                : null;
              const expansion = graphData
                ? calculateNetworkExpansionPotential(graphData.links, graphData.nodes, p.id)
                : null;

              return (
                <Link
                  key={p.id}
                  href={`/p/${p.id}`}
                  prefetch={true}
                  className="flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                >
                  <span className="text-xs font-bold text-muted-foreground w-4 tabular-nums shrink-0">
                    {getTopPlayerRankText(i)}
                  </span>
                  <PlayerAvatar
                    name={capitalizeName(p.name ?? p.alias ?? "?")}
                    image={p.image ?? undefined}
                    size={32}
                  />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {capitalizeName(p.name ?? p.alias ?? "?")}
                      </p>
                      {roleInfo ? (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            roleInfo.badgeStyle,
                          )}
                          title={`Rol en la red: ${roleInfo.roleLabel}. ${roleInfo.description}`}
                          aria-label={`Rol en la red de ${capitalizeName(p.name ?? p.alias ?? "Jugador")}: ${roleInfo.roleLabel}. ${roleInfo.description}`}
                        >
                          {roleInfo.roleLabel}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            activityTier.badgeStyle,
                          )}
                          title={`Actividad: ${activityTier.label}`}
                          aria-label={`Nivel de actividad de ${capitalizeName(p.name ?? p.alias ?? "Jugador")}: ${activityTier.label}`}
                        >
                          {activityTier.label}
                        </span>
                      )}
                      {centrality && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            centrality.badgeStyle,
                          )}
                          title={`Centralidad en la red: ${centrality.centralityTier}. ${centrality.formattedSummary}`}
                          aria-label={`Centralidad en la red de ${capitalizeName(p.name ?? p.alias ?? "Jugador")}: ${centrality.centralityTier}. ${centrality.formattedSummary}`}
                        >
                          {centrality.centralityTier}
                        </span>
                      )}
                      {diversity && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            diversity.badgeStyle,
                          )}
                          title={`Diversidad de red: ${diversity.diversityTier}. ${diversity.formattedSummary}`}
                          aria-label={`Diversidad de red de ${capitalizeName(p.name ?? p.alias ?? "Jugador")}: ${diversity.diversityTier}. ${diversity.formattedSummary}`}
                        >
                          {diversity.diversityTier}
                        </span>
                      )}
                      {multiBelonging && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            multiBelonging.badgeStyle,
                          )}
                          title={`Multipertenencia comunitaria: ${multiBelonging.multiBelongingTier}. ${multiBelonging.formattedSummary}`}
                          aria-label={`Multipertenencia comunitaria de ${capitalizeName(p.name ?? p.alias ?? "Jugador")}: ${multiBelonging.multiBelongingTier}. ${multiBelonging.formattedSummary}`}
                        >
                          {multiBelonging.multiBelongingTier}
                        </span>
                      )}
                      {reciprocity && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            reciprocity.badgeStyle,
                          )}
                          title={`Reciprocidad de interacción: ${reciprocity.reciprocityTier}. ${reciprocity.formattedSummary}`}
                          aria-label={`Reciprocidad de interacción de ${capitalizeName(p.name ?? p.alias ?? "Jugador")}: ${reciprocity.reciprocityTier}. ${reciprocity.formattedSummary}`}
                        >
                          {reciprocity.reciprocityTier}
                        </span>
                      )}
                      {stability && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            stability.badgeStyle,
                          )}
                          title={`Estabilidad de duplas: ${stability.stabilityTier}. ${stability.formattedSummary}`}
                          aria-label={`Estabilidad de duplas de ${capitalizeName(p.name ?? p.alias ?? "Jugador")}: ${stability.stabilityTier}. ${stability.formattedSummary}`}
                        >
                          {stability.stabilityTier}
                        </span>
                      )}
                      {expansion && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0",
                            expansion.badgeStyle,
                          )}
                          title={`Potencial de expansión de red: ${expansion.expansionTier}. ${expansion.formattedSummary}`}
                          aria-label={getTopPlayerExpansionAriaLabel(
                            capitalizeName(p.name ?? p.alias ?? "Jugador"),
                            expansion.expansionTier,
                            expansion.formattedSummary,
                          )}
                        >
                          {expansion.expansionTier}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getTopPlayerMatchesText(p.matchesPlayed)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold tabular-nums text-primary block">
                      {getTopPlayerContactsText(p.networkSize)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 30-day summary */}
      <div
        role="region"
        aria-label={getStatsPanelRegionAriaLabel("recent")}
        className="rounded-xl border border-border bg-muted p-4 space-y-2"
      >
        <h2 className="text-sm font-bold text-foreground">{getRecent30DaysHeadingTitle()}</h2>
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
        <div
          role="region"
          aria-label={getStatsPanelRegionAriaLabel("clubs")}
          className="rounded-xl border border-border bg-card p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">
              {getTopClubsHeadingTitle()}
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
