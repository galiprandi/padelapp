import Link from "next/link";
import { ShieldCheck, TrendingUp, TrendingDown, Minus, Flame } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { getPlayerRecentForm, calculatePlayerStreak } from "@/lib/match-helpers";
import {
  getRankingListItemAriaLabel,
  getWinStreakTitle,
  getDeltaChangeTitle,
  getReliablePlayerBadgeTitle,
  formatRecentFormTitle,
  getRankingPlayerDisplayName,
  getRankingListItemContainerClasses,
  getRankingListItemPositionClasses,
  getRankingListItemNameClasses,
  getRecentFormDotClasses,
  getRankingDeltaClasses,
  getRankingListItemMainGroupClasses,
  getRankingListItemAvatarClasses,
  getRankingListItemContentClasses,
  getRankingListItemHeaderRowClasses,
  getRankingListItemStreakBadgeClasses,
  getRankingListItemMetricsRowClasses,
  getRankingListItemRecordTextClasses,
  getRankingListItemRecentFormContainerClasses,
  getRankingListItemScoreColClasses,
  getRankingListItemScoreValueClasses,
  getRankingListItemDeltaGroupClasses,
} from "./ranking-utils";

interface RankingListItemProps {
  player: {
    id: string;
    displayName: string | null;
    alias: string | null;
    image: string | null;
    rankingScore: number;
    rankingPosition: number | null;
    rankingDelta: number;
    wins: number;
    losses: number;
    attendanceScore: number;
    matchPlayers: Array<{
      position: number;
      match: {
        score: string | null;
      };
    }>;
  };
  index: number;
  viewerId?: string | null;
  customPosition?: number;
}

export function RankingListItem({
  player,
  index,
  viewerId,
  customPosition,
}: RankingListItemProps) {
  const isViewer = player.id === viewerId;
  const recentForm = getPlayerRecentForm(player.matchPlayers);
  const winStreak = calculatePlayerStreak(player.matchPlayers);

  const displayName = getRankingPlayerDisplayName(player.displayName, player.alias, "Jugador");
  const positionNum = customPosition ?? player.rankingPosition ?? index + 1;

  const ariaLabel = getRankingListItemAriaLabel(
    positionNum,
    displayName,
    isViewer,
    player.rankingScore,
    player.wins,
    player.losses,
    player.rankingDelta
  );

  return (
    <Link
      href={`/p/${player.id}?backUrl=/ranking`}
      prefetch={true}
      aria-label={ariaLabel}
      className={getRankingListItemContainerClasses(isViewer)}
    >
      <div
        aria-hidden="true"
        className={getRankingListItemPositionClasses(isViewer)}
      >
        {positionNum}
      </div>

      <div className={getRankingListItemMainGroupClasses()} aria-hidden="true">
        <PlayerAvatar
          name={displayName}
          image={player.image ?? undefined}
          size={36}
          className={getRankingListItemAvatarClasses()}
          aria-hidden="true"
        />
        <div className={getRankingListItemContentClasses()}>
          <div className={getRankingListItemHeaderRowClasses()}>
            <p className={getRankingListItemNameClasses(isViewer)}>
              {displayName}
            </p>
            {winStreak >= 2 && (
              <div
                className={getRankingListItemStreakBadgeClasses()}
                title={getWinStreakTitle(winStreak)}
              >
                <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
                <span>{winStreak}</span>
              </div>
            )}
            {player.attendanceScore >= 0.9 && (
              <span title={getReliablePlayerBadgeTitle()}>
                <ShieldCheck className="h-3 w-3 text-primary" aria-hidden="true" />
              </span>
            )}
          </div>
          <div className={getRankingListItemMetricsRowClasses()}>
            <span className={getRankingListItemRecordTextClasses()}>
              {player.wins}V-{player.losses}D
            </span>
            {recentForm.length > 0 && (
              <div
                className={getRankingListItemRecentFormContainerClasses()}
                title={formatRecentFormTitle(recentForm)}
              >
                {recentForm.map((result, i) => (
                  <div
                    key={i}
                    className={getRecentFormDotClasses(result)}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={getRankingListItemScoreColClasses()} aria-hidden="true">
        <span className={getRankingListItemScoreValueClasses()}>
          {Math.round(player.rankingScore)}
        </span>
        <div className={getRankingListItemDeltaGroupClasses()}>
          {player.rankingDelta > 0 ? (
            <div className={getRankingDeltaClasses(player.rankingDelta)} title={getDeltaChangeTitle(player.rankingDelta)}>
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              <span>+{player.rankingDelta}</span>
            </div>
          ) : player.rankingDelta < 0 ? (
            <div className={getRankingDeltaClasses(player.rankingDelta)} title={getDeltaChangeTitle(player.rankingDelta)}>
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
              <span>{player.rankingDelta}</span>
            </div>
          ) : (
            <div className={getRankingDeltaClasses(0)} title={getDeltaChangeTitle(0)}>
              <Minus className="h-3 w-3" aria-hidden="true" />
              <span>0</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
