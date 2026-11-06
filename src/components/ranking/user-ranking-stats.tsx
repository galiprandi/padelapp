"use client";

import { useState, useTransition } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar, Award, AlertTriangle, Flame, RefreshCw, Trophy, Sparkles } from "lucide-react";
import { cn, calculateWinRate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/lib/hooks/use-mounted";
import { getUserRankingBreakdownAction } from "@/app/(app)/ranking/actions";
import {
  calculateDecayFactor,
  getDecayFactorText,
  getRankingDeltaText,
} from "@/lib/match-helpers";
import {
  getRankingBreakdownButtonAriaLabel,
  getRankingUserSummaryAriaLabel,
  getRankingRegionAriaLabel,
  getRankingStatLabel,
  getRankingBreakdownErrorText,
  formatRankingPositionText,
  formatMatchRecordText,
  getRankingBreakdownButtonClasses,
  getRankingBreakdownContainerClasses,
  getRankingDecayBannerClasses,
  getRankingDeltaClasses,
  getUserRankingBannerContainerClasses,
  getUserRankingCardContainerClasses,
  getRankingBreakdownBasePointsLabel,
  getRankingBreakdownWinsLabel,
  getRankingBreakdownStreakLabel,
  getRankingBreakdownSetsLabel,
  getRankingBreakdownLateLabel,
  getRankingBreakdownNoShowLabel,
  getRankingBreakdownDecayLabel,
  getRankingBreakdownFinalLabel,
  getRankingBreakdownPointsValueText,
  getRankingBreakdownDecayMultiplierText,
  getRankingBreakdownDividerClasses,
  getRankingBreakdownItemRowClasses,
  getRankingBreakdownValueClasses,
  getRankingBreakdownSkeletonContainerClasses,
  getRankingBreakdownSkeletonItemClasses,
  getRankingBreakdownErrorClasses,
  getRankingBreakdownLabelGroupClasses,
  getRankingBreakdownItemIconClasses,
  getRankingBreakdownSpinnerClasses,
  getUserRankingBannerRowClasses,
  getUserRankingBannerLeftGroupClasses,
  getUserRankingBannerStatColClasses,
  getUserRankingBannerStatLabelClasses,
  getUserRankingBannerStatValueClasses,
  getUserRankingBannerRightGroupClasses,
  getUserRankingBannerBadgesGroupClasses,
  getUserRankingBannerBadgeClasses,
  getUserRankingBannerRecordGroupClasses,
  getUserRankingBannerRecordTextClasses,
  getUserRankingCardRowClasses,
  getUserRankingCardLeftGroupClasses,
  getUserRankingCardStatColClasses,
  getUserRankingCardStatLabelClasses,
  getUserRankingCardPositionValueClasses,
  getUserRankingCardPointsValueClasses,
  getUserRankingCardSubBadgesGroupClasses,
  getUserRankingCardWinRateBadgeClasses,
  getUserRankingCardReputationBadgeClasses,
  getUserRankingCardRightGroupClasses,
  getUserRankingCardRecordTextClasses,
} from "@/components/ranking/ranking-utils";

interface RankingBreakdownData {
  basePoints: number;
  wins: number;
  losses: number;
  winPoints: number;
  streak: number;
  streakPoints: number;
  setsWonBonus: number;
  lateCount: number;
  latePenalty: number;
  noShowCount: number;
  noShowPenalty: number;
  decayFactor: number;
  finalScore: number;
  lastMatchAt: Date | null;
}

interface UserRankingStatsProps {
  userId?: string;
  position: number | null;
  score: number;
  delta: number;
  wins: number;
  losses: number;
  attendanceScore?: number;
  className?: string;
  matchesPlayed?: number;
  lastMatchAt?: Date | string | null;
}

function RankingBreakdown({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [breakdown, setBreakdown] = useState<RankingBreakdownData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    if (!isOpen && !breakdown && !isPending) {
      startTransition(async () => {
        setError(null);
        const res = await getUserRankingBreakdownAction(userId);
        if (res.status === "ok" && res.breakdown) {
          setBreakdown(res.breakdown);
        } else {
          setError(getRankingBreakdownErrorText(res.message));
        }
      });
    }
    setIsOpen(!isOpen);
  };

  const buttonText = getRankingBreakdownButtonAriaLabel(isOpen, isPending);

  return (
    <div
      className={getRankingBreakdownDividerClasses()}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        className={getRankingBreakdownButtonClasses()}
        aria-expanded={isOpen}
        aria-busy={isPending}
        aria-controls={`ranking-breakdown-${userId}`}
      >
        {isPending ? (
          <>
            <RefreshCw className={getRankingBreakdownSpinnerClasses()} aria-hidden="true" />
            <span>{buttonText}</span>
          </>
        ) : (
          buttonText
        )}
      </button>

      {isOpen && (
        <div
          id={`ranking-breakdown-${userId}`}
          role="region"
          aria-label={getRankingRegionAriaLabel("breakdown")}
          className={getRankingBreakdownContainerClasses()}
        >
          {error && (
            <p className={getRankingBreakdownErrorClasses()}>{error}</p>
          )}

          {isPending && (
            <div className={getRankingBreakdownSkeletonContainerClasses()}>
              <Skeleton className={getRankingBreakdownSkeletonItemClasses("full")} />
              <Skeleton className={getRankingBreakdownSkeletonItemClasses("fiveSixths")} />
              <Skeleton className={getRankingBreakdownSkeletonItemClasses("fourFifths")} />
            </div>
          )}

          {!isPending && breakdown && (
            <>
              <div className={getRankingBreakdownItemRowClasses("default")}>
                <span className={getRankingBreakdownLabelGroupClasses()}>
                  <Award className={getRankingBreakdownItemIconClasses("default")} aria-hidden="true" /> {getRankingBreakdownBasePointsLabel()}
                </span>
                <span className={getRankingBreakdownValueClasses("default")}>
                  {getRankingBreakdownPointsValueText(breakdown.basePoints, "+")}
                </span>
              </div>

              <div className={getRankingBreakdownItemRowClasses("default")}>
                <span className={getRankingBreakdownLabelGroupClasses()}>
                  <Trophy className={getRankingBreakdownItemIconClasses("default")} aria-hidden="true" /> {getRankingBreakdownWinsLabel(breakdown.wins)}
                </span>
                <span className={getRankingBreakdownValueClasses("default")}>
                  {getRankingBreakdownPointsValueText(breakdown.winPoints)}
                </span>
              </div>

              <div className={getRankingBreakdownItemRowClasses("default")}>
                <span className={getRankingBreakdownLabelGroupClasses()}>
                  <Flame className={getRankingBreakdownItemIconClasses("orange")} aria-hidden="true" /> {getRankingBreakdownStreakLabel(breakdown.streak)}
                </span>
                <span className={getRankingBreakdownValueClasses("default")}>
                  {getRankingBreakdownPointsValueText(breakdown.streakPoints)}
                </span>
              </div>

              <div className={getRankingBreakdownItemRowClasses("default")}>
                <span className={getRankingBreakdownLabelGroupClasses()}>
                  <Sparkles className={getRankingBreakdownItemIconClasses("primary")} aria-hidden="true" /> {getRankingBreakdownSetsLabel()}
                </span>
                <span className={getRankingBreakdownValueClasses("default")}>
                  {getRankingBreakdownPointsValueText(breakdown.setsWonBonus)}
                </span>
              </div>

              {breakdown.lateCount > 0 && (
                <div className={getRankingBreakdownItemRowClasses("late")}>
                  <span className={getRankingBreakdownLabelGroupClasses()}>
                    <AlertTriangle className={getRankingBreakdownItemIconClasses("amber")} aria-hidden="true" /> {getRankingBreakdownLateLabel(breakdown.lateCount)}
                  </span>
                  <span className={getRankingBreakdownValueClasses("late")}>
                    -{getRankingBreakdownPointsValueText(breakdown.latePenalty, "")}
                  </span>
                </div>
              )}

              {breakdown.noShowCount > 0 && (
                <div className={getRankingBreakdownItemRowClasses("noShow")}>
                  <span className={getRankingBreakdownLabelGroupClasses()}>
                    <AlertTriangle className={getRankingBreakdownItemIconClasses("rose")} aria-hidden="true" /> {getRankingBreakdownNoShowLabel(breakdown.noShowCount)}
                  </span>
                  <span className={getRankingBreakdownValueClasses("noShow")}>
                    -{getRankingBreakdownPointsValueText(breakdown.noShowPenalty, "")}
                  </span>
                </div>
              )}

              {breakdown.decayFactor < 1.0 && (
                <div className={getRankingBreakdownItemRowClasses("decay")}>
                  <span className={getRankingBreakdownLabelGroupClasses()}>
                    <Calendar className={getRankingBreakdownItemIconClasses("default")} aria-hidden="true" /> {getRankingBreakdownDecayLabel()}
                  </span>
                  <span>{getRankingBreakdownDecayMultiplierText(breakdown.decayFactor)}</span>
                </div>
              )}

              <div className={getRankingBreakdownItemRowClasses("final")}>
                <span>{getRankingBreakdownFinalLabel()}</span>
                <span className={getRankingBreakdownValueClasses("final")}>
                  {getRankingBreakdownPointsValueText(breakdown.finalScore, "")}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function UserRankingBanner({
  userId,
  position,
  score,
  delta,
  wins,
  losses,
  attendanceScore = 1.0,
  className,
  matchesPlayed = 0,
  lastMatchAt,
}: UserRankingStatsProps) {
  const mounted = useMounted();
  const winRate = calculateWinRate(wins, matchesPlayed);
  const reputationPercent = Math.round(attendanceScore * 100);

  const decayFactor = mounted ? calculateDecayFactor(lastMatchAt) : null;
  const decayText = getDecayFactorText(decayFactor);
  const deltaText = getRankingDeltaText(delta);
  const summaryAriaLabel = getRankingUserSummaryAriaLabel(
    true,
    position,
    score,
    winRate,
    reputationPercent,
    wins,
    losses,
    delta
  );

  return (
    <div
      role="region"
      aria-label={summaryAriaLabel}
      className={getUserRankingBannerContainerClasses(className)}
    >
      <div className={getUserRankingBannerRowClasses()}>
        <div className={getUserRankingBannerLeftGroupClasses()}>
          <div className={getUserRankingBannerStatColClasses()}>
            <span className={getUserRankingBannerStatLabelClasses()}>{getRankingStatLabel("position")}</span>
            <span className={getUserRankingBannerStatValueClasses()}>
              {formatRankingPositionText(position, "S/P")}
            </span>
          </div>
          <div className={getUserRankingBannerStatColClasses()}>
            <span className={getUserRankingBannerStatLabelClasses()}>{getRankingStatLabel("points")}</span>
            <span className={getUserRankingBannerStatValueClasses()}>
              {Math.round(score)}
            </span>
          </div>
        </div>

        <div className={getUserRankingBannerRightGroupClasses()}>
          <div className={getUserRankingBannerBadgesGroupClasses()}>
            {matchesPlayed > 0 && (
              <span className={getUserRankingBannerBadgeClasses()}>
                {winRate}% WR
              </span>
            )}
            <span className={getUserRankingBannerBadgeClasses()}>
              {reputationPercent}% Rep
            </span>
          </div>
          <div className={getUserRankingBannerRecordGroupClasses()}>
            <span className={getUserRankingBannerRecordTextClasses()}>
              {formatMatchRecordText(wins, losses)}
            </span>
            {delta > 0 ? (
              <div
                className={getRankingDeltaClasses(delta)}
                aria-label={deltaText}
              >
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                <span>+{delta}</span>
              </div>
            ) : delta < 0 ? (
              <div
                className={getRankingDeltaClasses(delta)}
                aria-label={deltaText}
              >
                <TrendingDown className="h-3 w-3" aria-hidden="true" />
                <span>{delta}</span>
              </div>
            ) : (
              <div
                className={getRankingDeltaClasses(0)}
                aria-label={deltaText}
              >
                <Minus className="h-3 w-3" aria-hidden="true" />
                <span>0</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {decayText && (
        <div className={getRankingDecayBannerClasses()}>
          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{decayText}</span>
        </div>
      )}

      {userId && <RankingBreakdown userId={userId} />}
    </div>
  );
}

export function UserRankingCard({
  userId,
  position,
  score,
  delta,
  attendanceScore = 1.0,
  className,
  wins = 0,
  losses = 0,
  matchesPlayed = 0,
  lastMatchAt,
}: Partial<UserRankingStatsProps>) {
  const mounted = useMounted();
  const winRate = calculateWinRate(wins, matchesPlayed);
  const reputationPercent = Math.round(attendanceScore * 100);

  const decayFactor = mounted ? calculateDecayFactor(lastMatchAt) : null;
  const decayText = getDecayFactorText(decayFactor);
  const deltaText = getRankingDeltaText(delta);
  const summaryAriaLabel = getRankingUserSummaryAriaLabel(
    false,
    position ?? null,
    score ?? 1000,
    winRate,
    reputationPercent,
    wins,
    losses,
    delta ?? null
  );

  return (
    <div
      role="region"
      aria-label={summaryAriaLabel}
      className={getUserRankingCardContainerClasses(className)}
    >
      <div className={getUserRankingCardRowClasses()}>
        <div className={getUserRankingCardLeftGroupClasses()}>
          <div className={getUserRankingCardStatColClasses()}>
            <span className={getUserRankingCardStatLabelClasses()}>{getRankingStatLabel("myPosition")}</span>
            <span className={getUserRankingCardPositionValueClasses()}>
              {formatRankingPositionText(position, "--")}
            </span>
          </div>
          <div className={getUserRankingCardStatColClasses()}>
            <span className={getUserRankingCardPointsValueClasses()}>
              {Math.round(score ?? 1000)} pts
            </span>
            <div className={getUserRankingCardSubBadgesGroupClasses()}>
              {matchesPlayed > 0 && (
                <span className={getUserRankingCardWinRateBadgeClasses()}>{winRate}% WR</span>
              )}
              <span className={getUserRankingCardReputationBadgeClasses()}>
                {reputationPercent}% Rep
              </span>
            </div>
          </div>
        </div>

        <div className={getUserRankingCardRightGroupClasses()}>
          {delta && delta > 0 ? (
            <div
              className={getRankingDeltaClasses(delta)}
              aria-label={deltaText}
            >
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              <span>+{delta}</span>
            </div>
          ) : delta && delta < 0 ? (
            <div
              className={getRankingDeltaClasses(delta)}
              aria-label={deltaText}
            >
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
              <span>{delta}</span>
            </div>
          ) : (
            <div
              className={getRankingDeltaClasses(0)}
              aria-label={deltaText}
            >
              <Minus className="h-3 w-3" aria-hidden="true" />
              <span>0</span>
            </div>
          )}
          {matchesPlayed > 0 && (
            <span className={getUserRankingCardRecordTextClasses()}>
              {formatMatchRecordText(wins, losses)}
            </span>
          )}
        </div>
      </div>
      {decayText && (
        <div className={getRankingDecayBannerClasses()}>
          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{decayText}</span>
        </div>
      )}

      {userId && <RankingBreakdown userId={userId} />}
    </div>
  );
}
