"use client";

import { useState, useTransition, useEffect } from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import {
  markAttendanceAction,
  getMatchFeedbacksAction,
  savePlayerFeedbackAction,
} from "@/app/(app)/match/actions";
import { cn } from "@/lib/utils";
import { getNextRadioIndex } from "@/lib/match-helpers";
import {
  AttendanceStatus,
  getAttendanceStatusAriaLabel,
  getPlayerFeedbackAriaLabel,
  getAttendanceSummaryText,
  getAttendanceSaveSuccessToast,
  getAttendanceSaveErrorToast,
  getAttendanceSaveButtonLabel,
  getAttendanceSaveButtonAriaLabel,
  getAttendanceSectionRegionAriaLabel,
  getPlayerFeedbackHeadingText,
  getPlayerFeedbackSectionAriaLabel,
  getFeedbackOptionButtonLabel,
  getFeedbackOptionClasses,
  getAttendanceHeadingTitle,
  getAttendanceGroupAriaLabel,
  getAttendanceStatusButtonClasses,
  getAttendanceMarkerContainerClasses,
  getAttendanceMarkerTitleClasses,
  getAttendanceMarkerDescriptionClasses,
  getAttendanceMarkerPlayerListClasses,
  getAttendanceMarkerPlayerCardClasses,
  getAttendanceMarkerPlayerRowClasses,
  getAttendanceMarkerPlayerAvatarClasses,
  getAttendanceMarkerPlayerNameClasses,
  getAttendanceMarkerStatusRadiogroupClasses,
  getAttendanceMarkerFeedbackRowClasses,
  getAttendanceMarkerFeedbackLabelClasses,
  getAttendanceMarkerFeedbackRadiogroupClasses,
  getAttendanceMarkerSaveButtonClasses,
  getAttendanceMarkerSaveButtonContentClasses,
  getAttendanceMarkerSaveButtonSpinnerClasses,
  ATTENDANCE_STATUS_LABELS,
} from "@/components/matches/attendance-utils";

interface AttendancePlayer {
  id: string;
  userId: string;
  name: string;
  image?: string;
  currentStatus: AttendanceStatus | null;
}

interface AttendanceMarkerProps {
  matchId: string;
  players: AttendancePlayer[];
  viewerId?: string;
  onSaved?: () => void;
}

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; icon: typeof Check }
> = {
  ATTENDED: {
    label: ATTENDANCE_STATUS_LABELS.ATTENDED,
    icon: Check,
  },
  LATE: {
    label: ATTENDANCE_STATUS_LABELS.LATE,
    icon: Clock,
  },
  NO_SHOW: {
    label: ATTENDANCE_STATUS_LABELS.NO_SHOW,
    icon: X,
  },
};

export function AttendanceMarker({
  matchId,
  players,
  viewerId,
  onSaved,
}: AttendanceMarkerProps) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(
      players.map((p) => [
        p.id,
        (p.currentStatus as AttendanceStatus) ?? "ATTENDED",
      ]),
    ),
  );

  const [feedbacks, setFeedbacks] = useState<Record<string, "STRONGER" | "WEAKER" | null>>({});

  useEffect(() => {
    getMatchFeedbacksAction(matchId).then((res) => {
      if (res.status === "ok" && res.feedbacks) {
        setFeedbacks(
          Object.fromEntries(
            res.feedbacks.map((f) => [f.playerId, f.feedback]),
          ),
        );
      }
    });
  }, [matchId]);

  const handleStatusChange = (playerId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [playerId]: status }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const entries = Object.entries(statuses).map(([matchPlayerId, status]) => ({
        matchPlayerId,
        status,
      }));
      // 1. Save attendance
      const res = await markAttendanceAction(matchId, entries);
      if (res.status === "ok") {
        // 2. Save feedback
        const feedbackEntries = Object.entries(feedbacks).map(([playerId, feedback]) => ({
          playerId,
          feedback,
        }));
        if (feedbackEntries.length > 0) {
          const fbRes = await savePlayerFeedbackAction({
            matchId,
            feedbacks: feedbackEntries,
          });
          if (fbRes.status !== "ok") {
            showToast(getAttendanceSaveSuccessToast(false), {
              duration: 4000,
            });
            onSaved?.();
            return;
          }
        }
        showToast(getAttendanceSaveSuccessToast(true));
        onSaved?.();
      } else {
        showToast(getAttendanceSaveErrorToast(res.message), {
          duration: 4000,
        });
      }
    });
  };

  return (
    <section
      role="region"
      aria-label={getAttendanceSectionRegionAriaLabel()}
      className={getAttendanceMarkerContainerClasses()}
    >
      <div>
        <h2 className={getAttendanceMarkerTitleClasses()}>{getAttendanceHeadingTitle()}</h2>
        <p className={getAttendanceMarkerDescriptionClasses()}>
          {getAttendanceSummaryText(players.length)}
        </p>
      </div>

      <div className={getAttendanceMarkerPlayerListClasses()}>
        {players.map((player) => {
          const current = statuses[player.id] ?? "ATTENDED";
          return (
            <div
              key={player.id}
              className={getAttendanceMarkerPlayerCardClasses()}
            >
              {/* Row 1: Player Info & Attendance status */}
              <div className={getAttendanceMarkerPlayerRowClasses()}>
                <PlayerAvatar
                  name={player.name}
                  image={player.image}
                  className={getAttendanceMarkerPlayerAvatarClasses()}
                />
                <span className={getAttendanceMarkerPlayerNameClasses()}>
                  {player.name}
                </span>
                <div
                  className={getAttendanceMarkerStatusRadiogroupClasses()}
                  role="radiogroup"
                  aria-label={getAttendanceGroupAriaLabel(player.name)}
                  onKeyDown={(e) => {
                    if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) {
                      e.preventDefault();
                      const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]'));
                      if (buttons.length === 0) return;
                      const currentIndex = buttons.findIndex((btn) => btn === document.activeElement);
                      const nextIndex = getNextRadioIndex(
                        currentIndex,
                        buttons.length,
                        e.key as "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp",
                      );
                      buttons[nextIndex]?.focus();
                    }
                  }}
                >
                  {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(
                    (status) => {
                      const config = STATUS_CONFIG[status];
                      const Icon = config.icon;
                      const isActive = current === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => handleStatusChange(player.id, status)}
                          aria-label={getAttendanceStatusAriaLabel(status, player.name)}
                          className={getAttendanceStatusButtonClasses(isActive, status)}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Row 2: Subtle level feedback (only for other players) */}
              {viewerId && player.userId !== viewerId && (
                <div className={getAttendanceMarkerFeedbackRowClasses()}>
                  <span className={getAttendanceMarkerFeedbackLabelClasses()}>
                    {getPlayerFeedbackHeadingText()}
                  </span>
                  <div
                    className={getAttendanceMarkerFeedbackRadiogroupClasses()}
                    role="radiogroup"
                    aria-label={getPlayerFeedbackSectionAriaLabel(player.name)}
                    onKeyDown={(e) => {
                      if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) {
                        e.preventDefault();
                        const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]'));
                        if (buttons.length === 0) return;
                        const currentIndex = buttons.findIndex((btn) => btn === document.activeElement);
                        const nextIndex = getNextRadioIndex(
                          currentIndex,
                          buttons.length,
                          e.key as "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp",
                        );
                        buttons[nextIndex]?.focus();
                      }
                    }}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-label={getPlayerFeedbackAriaLabel("STRONGER", player.name)}
                      aria-checked={feedbacks[player.userId] === "STRONGER"}
                      tabIndex={feedbacks[player.userId] === "WEAKER" ? -1 : 0}
                      onClick={() => {
                        setFeedbacks((prev) => ({
                          ...prev,
                          [player.userId]:
                            prev[player.userId] === "STRONGER"
                              ? null
                              : "STRONGER",
                        }));
                      }}
                      className={getFeedbackOptionClasses(
                        feedbacks[player.userId] === "STRONGER",
                        "STRONGER",
                      )}
                    >
                      {getFeedbackOptionButtonLabel("STRONGER")}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-label={getPlayerFeedbackAriaLabel("WEAKER", player.name)}
                      aria-checked={feedbacks[player.userId] === "WEAKER"}
                      tabIndex={feedbacks[player.userId] === "WEAKER" ? 0 : -1}
                      onClick={() => {
                        setFeedbacks((prev) => ({
                          ...prev,
                          [player.userId]:
                            prev[player.userId] === "WEAKER" ? null : "WEAKER",
                        }));
                      }}
                      className={getFeedbackOptionClasses(
                        feedbacks[player.userId] === "WEAKER",
                        "WEAKER",
                      )}
                    >
                      {getFeedbackOptionButtonLabel("WEAKER")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={pending}
        aria-busy={pending}
        aria-label={getAttendanceSaveButtonAriaLabel(pending)}
        className={getAttendanceMarkerSaveButtonClasses()}
      >
        {pending ? (
          <span className={getAttendanceMarkerSaveButtonContentClasses()}>
            <Loader2 className={getAttendanceMarkerSaveButtonSpinnerClasses()} aria-hidden="true" />
            <span>{getAttendanceSaveButtonLabel(pending)}</span>
          </span>
        ) : (
          getAttendanceSaveButtonLabel(pending)
        )}
      </Button>
    </section>
  );
}
