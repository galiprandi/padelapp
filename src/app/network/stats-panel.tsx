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
  get30dSummaryMatchesLabel,
  get30dSummaryTurnsLabel,
  get30dSummaryUsersLabel,
  getActive30dLabel,
  getActive30dSubtext,
  getActiveSessionsLabel,
  getEnrollmentsOverviewCardSubtext,
  getEnrollmentsOverviewCardTitle,
  getGrowthBadgeClasses,
  getMatchesOverviewCardSubtext,
  getMatchesOverviewCardTitle,
  getNetworkActivityTier,
  getNetworkAvgConnectionsLabel,
  getNetworkConnectionsLabel,
  getNetworkDensityLabel,
  getNetworkPlayersLabel,
  getNetworkSectionTitle,
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
  getStatCardHeaderClasses,
  getStatCardLabelClasses,
  getStatCardValueGroupClasses,
  getStatCardValueClasses,
  getStatCardSubtextClasses,
  getRecommendedPlayerSimilarityAriaLabel,
  getRecommendedPlayerSimilarityTitle,
  getStatsCardCommunityBalanceAriaLabel,
  getStatsCardCommunityBalanceTitle,
  getStatsCardCommunityCohesionAriaLabel,
  getStatsCardCommunityCohesionTitle,
  getStatsCardCommunityLabel,
  getStatsCardCommunityMembersText,
  getStatsPanelBackAriaLabel,
  getStatsPanelBadgeTagClasses,
  getStatsPanelContainerClasses,
  getStatsPanelHeaderBackLinkClasses,
  getStatsPanelHeadingDescription,
  getStatsPanelHeadingTitle,
  getStatsPanelOverviewGridClasses,
  getStatsPanelRecentUserItemClasses,
  getStatsPanelRegionAriaLabel,
  getStatsPanelSectionCardClasses,
  getStatsPanelSummaryCardClasses,
  getStatsPanelTopPlayerItemClasses,
  getStatsPanelScoreBadgeClasses,
  getStatsPanelScoreLabelText,
  getStatsPanelProfileButtonClasses,
  getStatsPanelProfileButtonText,
  getStatsPanelCommunityBarContainerClasses,
  getStatsPanelTopPlayerRankClasses,
  getStatsPanelTopPlayerContactsClasses,
  getTopClubsHeadingTitle,
  getTopCommunitiesHeadingTitle,
  getTopConnectedHeadingTitle,
  getTopClubTurnsMatchesText,
  getTopPlayerActivityAriaLabel,
  getTopPlayerCentralityAriaLabel,
  getTopPlayerContactsText,
  getTopPlayerDiversityAriaLabel,
  getTopPlayerExpansionAriaLabel,
  getTopPlayerMatchesText,
  getTopPlayerMultiBelongingAriaLabel,
  getTopPlayerRankText,
  getTopPlayerReciprocityAriaLabel,
  getTopPlayerRoleAriaLabel,
  getTopPlayerRoleTitle,
  getTopPlayerActivityTitle,
  getTopPlayerCentralityTitle,
  getTopPlayerDiversityTitle,
  getTopPlayerMultiBelongingTitle,
  getTopPlayerReciprocityTitle,
  getTopPlayerStabilityTitle,
  getTopPlayerExpansionTitle,
  getRecentUsersItemAriaLabel,
  getTopClubItemAriaLabel,
  getCommunityItemAriaLabel,
  getTopPlayerStabilityAriaLabel,
  getTurnsOverviewCardSubtext,
  getTurnsOverviewCardTitle,
  getUsersOverviewCardSubtext,
  getUsersOverviewCardTitle,
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
      <div className={getStatCardHeaderClasses()}>
        <span className={getStatCardLabelClasses()}>{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className={getStatCardValueGroupClasses()}>
        <span className={getStatCardValueClasses()}>
          {value}
        </span>
        {growth !== undefined && <GrowthBadge rate={growth} />}
      </div>
      {sub && <p className={getStatCardSubtextClasses()}>{sub}</p>}
    </div>
  );
}

export function StatsPanel({ metrics, graphNodes, graphLinks, playersLikeYou, graphData, viewerId }: StatsPanelProps) {
  return (
    <div className={getStatsPanelContainerClasses()}>
      {/* Header */}
      <div
        role="region"
        aria-label={getStatsPanelRegionAriaLabel("header")}
        className="flex items-center gap-3"
      >
        <Link
          href="/me"
          prefetch={true}
          className={getStatsPanelHeaderBackLinkClasses()}
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
        className={getStatsPanelOverviewGridClasses()}
      >
        <StatCard
          label={getUsersOverviewCardTitle()}
          value={metrics.totalUsers}
          icon={Users}
          sub={getUsersOverviewCardSubtext(metrics.newUsers7d)}
          growth={metrics.userGrowthRate}
        />
        <StatCard
          label={getTurnsOverviewCardTitle()}
          value={metrics.totalTurns}
          icon={CalendarDays}
          sub={getTurnsOverviewCardSubtext(metrics.newTurns7d)}
          growth={metrics.turnGrowthRate}
        />
        <StatCard
          label={getMatchesOverviewCardTitle()}
          value={metrics.totalMatches}
          icon={Trophy}
          sub={getMatchesOverviewCardSubtext(metrics.confirmedMatches)}
          growth={metrics.matchGrowthRate}
        />
        <StatCard
          label={getEnrollmentsOverviewCardTitle()}
          value={metrics.totalEnrollments}
          icon={Activity}
          sub={getEnrollmentsOverviewCardSubtext()}
        />
      </div>

      {/* Network stats */}
      <div
        role="region"
        aria-label={getStatsPanelRegionAriaLabel("network")}
        className={getStatsPanelSectionCardClasses()}
      >
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">
            {getNetworkSectionTitle()}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {getNetworkPlayersLabel()}
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {graphNodes}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {getNetworkConnectionsLabel()}
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {graphLinks}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {getNetworkDensityLabel()}
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {(metrics.networkDensity * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="space-y-0.5 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {getNetworkAvgConnectionsLabel()}
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
        className={getStatsPanelSectionCardClasses()}
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
                            className={getStatsPanelBadgeTagClasses(similarity.badgeStyle)}
                            title={getRecommendedPlayerSimilarityTitle(
                              similarity.similarityTier,
                              similarity.formattedSummary,
                            )}
                            aria-label={getRecommendedPlayerSimilarityAriaLabel(
                              name,
                              similarity.similarityTier,
                              similarity.formattedSummary,
                            )}
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
                      <div className={getStatsPanelScoreBadgeClasses()}>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">{getStatsPanelScoreLabelText()}</p>
                        <p className="text-xs font-bold tabular-nums text-foreground">
                          {skillText}
                        </p>
                      </div>
                      <Link
                        href={`/p/${player.id}`}
                        prefetch={true}
                        aria-label={getRecommendedPlayerProfileLinkAriaLabel(name)}
                        className={getStatsPanelProfileButtonClasses()}
                      >
                        {getStatsPanelProfileButtonText()}
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
        className={getStatsPanelOverviewGridClasses()}
      >
        <StatCard
          label={getActiveSessionsLabel()}
          value={metrics.activeSessions}
          icon={Activity}
        />
        <StatCard
          label={getActive30dLabel()}
          value={metrics.pushEnabled}
          icon={Bell}
          sub={getActive30dSubtext()}
        />
      </div>

      {/* Latest registered users */}
      {metrics.recentUsers.length > 0 && (
        <div
          role="region"
          aria-label={getStatsPanelRegionAriaLabel("users")}
          className={getStatsPanelSectionCardClasses()}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">
              {getRecentUsersHeadingTitle()}
            </h2>
          </div>
          <div className="space-y-2">
            {metrics.recentUsers.map((u) => {
              const userName = capitalizeName(u.name ?? u.alias ?? "?");
              const timeAgoText = formatTimeAgo(u.createdAt);
              return (
                <Link
                  key={u.id}
                  href={`/p/${u.id}`}
                  prefetch={true}
                  aria-label={getRecentUsersItemAriaLabel(userName, timeAgoText)}
                  className={getStatsPanelRecentUserItemClasses()}
                >
                  <PlayerAvatar
                    name={userName}
                    image={u.image ?? undefined}
                    size={32}
                  />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgoText}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Top communities */}
      {metrics.communities.length > 0 && (
        <div
          role="region"
          aria-label={getStatsPanelRegionAriaLabel("communities")}
          className={getStatsPanelSectionCardClasses()}
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
                <div
                  key={c.id}
                  className="space-y-1.5"
                  aria-label={getCommunityItemAriaLabel(c.id, c.size)}
                >
                  <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {getStatsCardCommunityLabel(c.id)}
                      </span>
                      {cohesion && (
                        <span
                          className={getStatsPanelBadgeTagClasses(cohesion.badgeStyle)}
                          title={getStatsCardCommunityCohesionTitle(
                            cohesion.cohesionTier,
                            cohesion.formattedCohesionSummary,
                          )}
                          aria-label={getStatsCardCommunityCohesionAriaLabel(
                            c.id,
                            cohesion.cohesionTier,
                            cohesion.formattedCohesionSummary,
                          )}
                        >
                          {cohesion.cohesionTier}
                        </span>
                      )}
                      {balanceInfo && (
                        <span
                          className={getStatsPanelBadgeTagClasses(balanceInfo.badgeStyle)}
                          title={getStatsCardCommunityBalanceTitle(
                            balanceInfo.balanceTier,
                            balanceInfo.formattedBalanceSummary,
                          )}
                          aria-label={getStatsCardCommunityBalanceAriaLabel(
                            c.id,
                            balanceInfo.balanceTier,
                            balanceInfo.formattedBalanceSummary,
                          )}
                        >
                          {balanceInfo.balanceTier}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground tabular-nums text-xs">
                      {getStatsCardCommunityMembersText(c.size)}
                    </span>
                  </div>
                  <div className={getStatsPanelCommunityBarContainerClasses()}>
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
          className={getStatsPanelSectionCardClasses()}
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
                  className={getStatsPanelTopPlayerItemClasses()}
                >
                  <span className={getStatsPanelTopPlayerRankClasses()}>
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
                          className={getStatsPanelBadgeTagClasses(roleInfo.badgeStyle)}
                          title={getTopPlayerRoleTitle(roleInfo.roleLabel, roleInfo.description)}
                          aria-label={getTopPlayerRoleAriaLabel(
                            capitalizeName(p.name ?? p.alias ?? "Jugador"),
                            roleInfo.roleLabel,
                            roleInfo.description,
                          )}
                        >
                          {roleInfo.roleLabel}
                        </span>
                      ) : (
                        <span
                          className={getStatsPanelBadgeTagClasses(activityTier.badgeStyle)}
                          title={getTopPlayerActivityTitle(activityTier.label)}
                          aria-label={getTopPlayerActivityAriaLabel(
                            capitalizeName(p.name ?? p.alias ?? "Jugador"),
                            activityTier.label,
                          )}
                        >
                          {activityTier.label}
                        </span>
                      )}
                      {centrality && (
                        <span
                          className={getStatsPanelBadgeTagClasses(centrality.badgeStyle)}
                          title={getTopPlayerCentralityTitle(centrality.centralityTier, centrality.formattedSummary)}
                          aria-label={getTopPlayerCentralityAriaLabel(
                            capitalizeName(p.name ?? p.alias ?? "Jugador"),
                            centrality.centralityTier,
                            centrality.formattedSummary,
                          )}
                        >
                          {centrality.centralityTier}
                        </span>
                      )}
                      {diversity && (
                        <span
                          className={getStatsPanelBadgeTagClasses(diversity.badgeStyle)}
                          title={getTopPlayerDiversityTitle(diversity.diversityTier, diversity.formattedSummary)}
                          aria-label={getTopPlayerDiversityAriaLabel(
                            capitalizeName(p.name ?? p.alias ?? "Jugador"),
                            diversity.diversityTier,
                            diversity.formattedSummary,
                          )}
                        >
                          {diversity.diversityTier}
                        </span>
                      )}
                      {multiBelonging && (
                        <span
                          className={getStatsPanelBadgeTagClasses(multiBelonging.badgeStyle)}
                          title={getTopPlayerMultiBelongingTitle(multiBelonging.multiBelongingTier, multiBelonging.formattedSummary)}
                          aria-label={getTopPlayerMultiBelongingAriaLabel(
                            capitalizeName(p.name ?? p.alias ?? "Jugador"),
                            multiBelonging.multiBelongingTier,
                            multiBelonging.formattedSummary,
                          )}
                        >
                          {multiBelonging.multiBelongingTier}
                        </span>
                      )}
                      {reciprocity && (
                        <span
                          className={getStatsPanelBadgeTagClasses(reciprocity.badgeStyle)}
                          title={getTopPlayerReciprocityTitle(reciprocity.reciprocityTier, reciprocity.formattedSummary)}
                          aria-label={getTopPlayerReciprocityAriaLabel(
                            capitalizeName(p.name ?? p.alias ?? "Jugador"),
                            reciprocity.reciprocityTier,
                            reciprocity.formattedSummary,
                          )}
                        >
                          {reciprocity.reciprocityTier}
                        </span>
                      )}
                      {stability && (
                        <span
                          className={getStatsPanelBadgeTagClasses(stability.badgeStyle)}
                          title={getTopPlayerStabilityTitle(stability.stabilityTier, stability.formattedSummary)}
                          aria-label={getTopPlayerStabilityAriaLabel(
                            capitalizeName(p.name ?? p.alias ?? "Jugador"),
                            stability.stabilityTier,
                            stability.formattedSummary,
                          )}
                        >
                          {stability.stabilityTier}
                        </span>
                      )}
                      {expansion && (
                        <span
                          className={getStatsPanelBadgeTagClasses(expansion.badgeStyle)}
                          title={getTopPlayerExpansionTitle(expansion.expansionTier, expansion.formattedSummary)}
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
                    <span className={getStatsPanelTopPlayerContactsClasses()}>
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
        className={getStatsPanelSummaryCardClasses()}
      >
        <h2 className="text-sm font-bold text-foreground">{getRecent30DaysHeadingTitle()}</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.newUsers30d}
            </p>
            <p className="text-xs text-muted-foreground">
              {get30dSummaryUsersLabel()}
            </p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.newTurns30d}
            </p>
            <p className="text-xs text-muted-foreground">
              {get30dSummaryTurnsLabel()}
            </p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-foreground">
              {metrics.newMatches30d}
            </p>
            <p className="text-xs text-muted-foreground">
              {get30dSummaryMatchesLabel()}
            </p>
          </div>
        </div>
      </div>

      {/* Top clubs by activity */}
      {metrics.topClubs.length > 0 && (
        <div
          role="region"
          aria-label={getStatsPanelRegionAriaLabel("clubs")}
          className={getStatsPanelSectionCardClasses()}
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
                <div
                  key={c.name}
                  className="space-y-1"
                  aria-label={getTopClubItemAriaLabel(i + 1, c.name, c.turns, c.matches)}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-foreground truncate">
                      <span className="text-muted-foreground tabular-nums w-4">
                        {i + 1}.
                      </span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="text-muted-foreground tabular-nums shrink-0">
                      {getTopClubTurnsMatchesText(c.turns, c.matches)}
                    </span>
                  </div>
                  <div className={getStatsPanelCommunityBarContainerClasses()}>
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
