"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Calendar, AlertCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/components/toast/use-toast";
import { useMounted } from "@/lib/hooks/use-mounted";
import { confirmMatchResultAction } from "@/app/(app)/match/actions";
import Link from "next/link";
import {
  getPendingConfirmationsTitle,
  getPendingConfirmationsCountText,
  formatPendingMatchDate,
  getPendingMatchConfirmAriaLabel,
  getPendingMatchResultAriaLabel,
  getPendingMatchDetailAriaLabel,
  getRankingRegionAriaLabel,
  getPendingMatchConfirmSuccessToast,
  getPendingMatchConfirmErrorToast,
  getPendingMatchConfirmExceptionToast,
  getPendingMatchScoreLoadedLabel,
  getPendingMatchScorePendingText,
  getPendingMatchConfirmButtonText,
  getPendingMatchResultButtonText,
  getPendingConfirmationsContainerClasses,
  getPendingConfirmationsItemClasses,
  getPendingMatchConfirmButtonClasses,
  getPendingMatchResultButtonClasses,
  getPendingMatchDetailButtonClasses,
} from "./ranking-utils";

interface PendingPlayer {
  id: string;
  position: number;
  displayName?: string | null;
  resultConfirmed?: boolean;
  user?: {
    id: string;
    displayName: string | null;
    alias?: string | null;
  } | null;
}

interface PendingMatch {
  id: string;
  score?: string | null;
  date?: Date | string;
  createdAt: Date | string;
  players: PendingPlayer[];
}

interface PendingConfirmationsAlertProps {
  pendingActions: PendingMatch[];
  viewerId: string;
}

export function PendingConfirmationsAlert({
  pendingActions,
}: PendingConfirmationsAlertProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const mounted = useMounted();
  const [isConfirming, startTransition] = useTransition();
  const [activeConfirmingId, setActiveConfirmingId] = useState<string | null>(null);

  if (pendingActions.length === 0) return null;

  const handleConfirm = (matchId: string) => {
    setActiveConfirmingId(matchId);
    startTransition(async () => {
      try {
        const res = await confirmMatchResultAction(matchId);
        if (res.status === "ok") {
          showToast(getPendingMatchConfirmSuccessToast(), {
            type: "success",
          });
          router.refresh();
        } else {
          showToast(getPendingMatchConfirmErrorToast(res.message), {
            type: "error",
          });
        }
      } catch (err) {
        console.error("Error confirming match:", err);
        showToast(getPendingMatchConfirmExceptionToast(), {
          type: "error",
        });
      } finally {
        setActiveConfirmingId(null);
      }
    });
  };

  return (
    <div
      role="region"
      aria-label={getRankingRegionAriaLabel("pending")}
      className={getPendingConfirmationsContainerClasses()}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground leading-tight">
            {getPendingConfirmationsTitle()}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getPendingConfirmationsCountText(pendingActions.length)}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {pendingActions.map((match) => {
          const hasScore = !!match.score;
          const matchDateValue = match.date || match.createdAt;
          const formattedDate = formatPendingMatchDate(matchDateValue, mounted);

          const isThisConfirming = activeConfirmingId === match.id && isConfirming;

          return (
            <div
              key={match.id}
              className={getPendingConfirmationsItemClasses()}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">{formattedDate}</span>
                </div>
                {hasScore ? (
                  <p className="text-sm font-bold text-foreground">
                    {getPendingMatchScoreLoadedLabel()}{" "}
                    <span className="text-primary tabular-nums">{match.score}</span>
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-destructive">
                    {getPendingMatchScorePendingText()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hasScore ? (
                  <button
                    type="button"
                    onClick={() => handleConfirm(match.id)}
                    disabled={isConfirming}
                    aria-busy={isThisConfirming}
                    aria-label={getPendingMatchConfirmAriaLabel(match.score, formattedDate)}
                    className={getPendingMatchConfirmButtonClasses()}
                  >
                    {isThisConfirming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {getPendingMatchConfirmButtonText()}
                  </button>
                ) : (
                  <Link
                    href={`/match/${match.id}/result`}
                    prefetch={true}
                    aria-label={getPendingMatchResultAriaLabel(formattedDate)}
                    className={getPendingMatchResultButtonClasses()}
                  >
                    {getPendingMatchResultButtonText()}
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
                <Link
                  href={`/match/${match.id}`}
                  prefetch={true}
                  aria-label={getPendingMatchDetailAriaLabel(formattedDate)}
                  className={getPendingMatchDetailButtonClasses()}
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
