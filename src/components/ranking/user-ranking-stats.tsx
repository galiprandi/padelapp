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
            <RefreshCw className="h-3 w-3 animate-spin" aria-hidden="true" />
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
            <p className="text-rose-500 font-semibold text-center">{error}</p>
          )}

          {isPending && (
            <div className="space-y-2 py-1">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
          )}

          {!isPending && breakdown && (
            <>
              <div className={getRankingBreakdownItemRowClasses("default")}>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" aria-hidden="true" /> {getRankingBreakdownBasePointsLabel()}
                </span>
                <span className={getRankingBreakdownValueClasses("default")}>
                  {getRankingBreakdownPointsValueText(breakdown.basePoints, "+")}
                </span>
              </div>

              <div className={getRankingBreakdownItemRowClasses("default")}>
                <span className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> {getRankingBreakdownWinsLabel(breakdown.wins)}
                </span>
                <span className={getRankingBreakdownValueClasses("default")}>
                  {getRankingBreakdownPointsValueText(breakdown.winPoints)}
                </span>
              </div>

              <div className={getRankingBreakdownItemRowClasses("default")}>
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" /> {getRankingBreakdownStreakLabel(breakdown.streak)}
                </span>
                <span className={getRankingBreakdownValueClasses("default")}>
                  {getRankingBreakdownPointsValueText(breakdown.streakPoints)}
                </span>
              </div>

              <div className={getRankingBreakdownItemRowClasses("default")}>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> {getRankingBreakdownSetsLabel()}
                </span>
                <span className={getRankingBreakdownValueClasses("default")}>
                  {getRankingBreakdownPointsValueText(breakdown.setsWonBonus)}
                </span>
              </div>

              {breakdown.lateCount > 0 && (
                <div className={getRankingBreakdownItemRowClasses("late")}>
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> {getRankingBreakdownLateLabel(breakdown.lateCount)}
                  </span>
                  <span className={getRankingBreakdownValueClasses("late")}>
                    -{getRankingBreakdownPointsValueText(breakdown.latePenalty, "")}
                  </span>
                </div>
              )}

              {breakdown.noShowCount > 0 && (
                <div className={getRankingBreakdownItemRowClasses("noShow")}>
                  <span className="flex items-center gap-1 text-rose-600">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> {getRankingBreakdownNoShowLabel(breakdown.noShowCount)}
                  </span>
                  <span className={getRankingBreakdownValueClasses("noShow")}>
                    -{getRankingBreakdownPointsValueText(breakdown.noShowPenalty, "")}
                  </span>
                </div>
              )}

              {breakdown.decayFactor < 1.0 && (
                <div className={getRankingBreakdownItemRowClasses("decay")}>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" /> {getRankingBreakdownDecayLabel()}
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">{getRankingStatLabel("position")}</span>
            <span className="text-2xl font-bold text-foreground">
              {formatRankingPositionText(position, "S/P")}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">{getRankingStatLabel("points")}</span>
            <span className="text-2xl font-bold text-foreground">
              {Math.round(score)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            {matchesPlayed > 0 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                {winRate}% WR
              </span>
            )}
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
              {reputationPercent}% Rep
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">{getRankingStatLabel("myPosition")}</span>
            <span className="text-2xl font-bold text-foreground">
              {formatRankingPositionText(position, "--")}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">
              {Math.round(score ?? 1000)} pts
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {matchesPlayed > 0 && (
                <span className="text-xs font-bold text-primary">{winRate}% WR</span>
              )}
              <span className="text-xs font-medium text-muted-foreground">
                {reputationPercent}% Rep
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
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
            <span className="text-xs text-muted-foreground">
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
