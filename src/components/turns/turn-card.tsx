"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn, isToday, isTomorrow } from "@/lib/utils";
import {
  joinTurnAction,
  joinSubstituteAction,
} from "@/app/(app)/turnos/actions";
import { ShareButton } from "@/components/share/share-button";
import { OpenToNetworkButton } from "@/components/turns/open-to-network-button";
import { createMagicLink } from "@/lib/magic-link";
import { useToast } from "@/components/toast/use-toast";
import { LocalDay, LocalMonth, LocalTime } from "@/components/ui/local-date";
import { Badge } from "@/components/ui/badge";
import { useMounted } from "@/lib/hooks/use-mounted";
import { type PadelContact } from "@/lib/queries";
import {
  getOpenSlotsBadgeText,
  getTurnUrgencyBadgeText,
  getTurnSalvageShareMessage,
  formatContactPlayersSummary,
  getTurnCardAriaLabel,
  getQuickJoinAriaLabel,
  getTurnStatusBadgeAriaLabel,
  getJoinTurnSuccessToast,
  getJoinSubstituteSuccessToast,
  getJoinTurnErrorToast,
  getTurnCardSubstitutesText,
  getTurnCardContactPlayersAriaLabel,
  getTurnCardDetailLinkAriaLabel,
  getTodayBadgeText,
  getTomorrowBadgeText,
  getTurnCardShareTitle,
  getTurnCardSalvageLabel,
  getTurnCardQuickJoinText,
  getTurnCardStatusBadgeText,
  getTurnCardContainerClasses,
  getTurnCardDateContainerClasses,
  getTurnCardContactPlayersClasses,
  getTurnCardOpenSlotsBadgeClasses,
  getTurnCardQuickJoinButtonClasses,
  getTurnCardActionsContainerClasses,
  getTurnCardHeaderContainerClasses,
  getTurnCardContentContainerClasses,
  getTurnCardTitleContainerClasses,
  getTurnCardClubTitleClasses,
  getTurnCardMetaContainerClasses,
  getTurnCardMetaItemClasses,
  getTurnCardSubstitutesTextClasses,
  getTurnCardContactDotClasses,
  getTurnCardStatusBadgeContainerClasses,
  getTurnCardSalvageWrapperClasses,
  getTurnCardShareButtonClasses,
  getTurnCardDateMonthClasses,
  getTurnCardDateDayClasses,
} from "@/components/turns/turn-utils";

interface TurnCardProps {
  turn: {
    id: string;
    club: string;
    date: Date | string;
    players: {
      userId?: string;
      user?: {
        id: string;
        displayName: string;
        alias: string | null;
        image: string | null;
      };
    }[];
    substitutes?: {
      userId?: string;
      user?: {
        id: string;
        displayName: string;
        alias: string | null;
        image: string | null;
      };
    }[];
    maxPlayers: number;
    status?: string;
    lastNetworkNotificationAt?: Date | string | null;
  };
  variant?: "default" | "recommended";
  isJoined?: boolean;
  isSubstitute?: boolean;
  isCreator?: boolean;
  contacts?: PadelContact[];
}

export function TurnCard({
  turn,
  variant = "default",
  isJoined,
  isSubstitute,
  isCreator,
  contacts,
}: TurnCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const mounted = useMounted();
  const dateObj = new Date(turn.date);

  const isRecommended = variant === "recommended";

  // Only compute date-relative labels after mount to avoid hydration
  // mismatch (server uses UTC, client uses local timezone).
  const isTodayDate = mounted && isToday(dateObj);
  const isTomorrowDate = mounted && isTomorrow(dateObj);

  const isFull = turn.players.length >= turn.maxPlayers;
  const openSlots = Math.max(0, turn.maxPlayers - turn.players.length);
  const canJoinAsSubstitute =
    isFull &&
    !isJoined &&
    !isSubstitute;
  const canJoin =
    !isJoined &&
    !isSubstitute &&
    (turn.status === "OPEN" || canJoinAsSubstitute);

  const urgencyText = mounted ? getTurnUrgencyBadgeText(turn.date, isFull) : null;

  const { showToast } = useToast();

  const handleQuickJoin = () => {
    startTransition(async () => {
      const isSub = canJoinAsSubstitute;
      const res = isSub
        ? await joinSubstituteAction(turn.id)
        : await joinTurnAction(turn.id);
      if (res.status === "ok") {
        showToast(
          isSub
            ? getJoinSubstituteSuccessToast()
            : getJoinTurnSuccessToast()
        );
        router.refresh();
      } else {
        showToast(getJoinTurnErrorToast(res.message));
      }
    });
  };

  // Find which of the enrolled players are in the contacts list
  const contactIds = new Set(contacts?.map((c) => c.id));
  const contactPlayers = turn.players
    .filter((p) => p.user && contactIds.has(p.user.id))
    .map((p) => p.user?.alias ?? p.user?.displayName ?? "");

  const cardAriaLabel = getTurnCardAriaLabel({
    club: turn.club,
    enrolledCount: turn.players.length,
    maxPlayers: turn.maxPlayers,
    isCreator,
    isJoined,
    isSubstitute,
  });

  const statusBadgeText = getTurnCardStatusBadgeText({
    isCreator,
    isSubstitute,
    isJoined,
    isFull: turn.status === "FULL" || isFull,
    openSlots,
  });

  return (
    <div
      role="region"
      aria-label={cardAriaLabel}
      className={getTurnCardContainerClasses({ isRecommended, isPending })}
    >
      <Link
        href={`/t/${turn.id}`}
        prefetch={true}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        aria-label={getTurnCardDetailLinkAriaLabel(turn.club)}
      />
        <div className={getTurnCardHeaderContainerClasses()}>
          {/* Date */}
          <div className={getTurnCardDateContainerClasses()}>
            <span className={getTurnCardDateMonthClasses()}>
              <LocalMonth date={turn.date} />
            </span>
            <span className={getTurnCardDateDayClasses()}>
              <LocalDay date={turn.date} />
            </span>
          </div>

          {/* Content */}
          <div className={getTurnCardContentContainerClasses()}>
            <div className={getTurnCardTitleContainerClasses()}>
              <p className={getTurnCardClubTitleClasses()}>
                {turn.club}
              </p>
              {isTodayDate && <Badge variant="success">{getTodayBadgeText()}</Badge>}
              {isTomorrowDate && <Badge variant="default">{getTomorrowBadgeText()}</Badge>}
              {urgencyText && (
                <Badge variant="warning">
                  {urgencyText}
                </Badge>
              )}
            </div>

            <div className={getTurnCardMetaContainerClasses()}>
              <span className={getTurnCardMetaItemClasses()}>
                <Clock className="h-3 w-3" />
                <LocalTime date={turn.date} />
              </span>
              <span className={getTurnCardMetaItemClasses()}>
                <Users className="h-3 w-3" />
                {turn.players.length}/{turn.maxPlayers}
                {turn.substitutes && turn.substitutes.length > 0 && (
                  <span className={getTurnCardSubstitutesTextClasses()}>
                    {getTurnCardSubstitutesText(turn.substitutes.length)}
                  </span>
                )}
              </span>
            </div>

            {mounted && contactPlayers.length > 0 && (
              <p
                className={getTurnCardContactPlayersClasses()}
                aria-label={getTurnCardContactPlayersAriaLabel(contactPlayers)}
              >
                <span className={getTurnCardContactDotClasses()} aria-hidden="true" />
                <span className="truncate">
                  {formatContactPlayersSummary(contactPlayers)}
                </span>
              </p>
            )}
          </div>

          {/* Status badge */}
          <div className={getTurnCardStatusBadgeContainerClasses()}>
            {isCreator ? (
              <Badge
                variant="primary"
                aria-label={getTurnStatusBadgeAriaLabel({ openSlots, isCreator: true })}
              >
                {statusBadgeText}
              </Badge>
            ) : isSubstitute ? (
              <Badge
                variant="default"
                aria-label={getTurnStatusBadgeAriaLabel({ openSlots, isSubstitute: true })}
              >
                {statusBadgeText}
              </Badge>
            ) : isJoined ? (
              <Badge
                variant="primary"
                aria-label={getTurnStatusBadgeAriaLabel({ openSlots, isJoined: true })}
              >
                {statusBadgeText}
              </Badge>
            ) : turn.status === "FULL" ? (
              <Badge
                variant="default"
                aria-label={getTurnStatusBadgeAriaLabel({ openSlots: 0 })}
              >
                {statusBadgeText}
              </Badge>
            ) : openSlots > 0 ? (
              <Badge
                className={getTurnCardOpenSlotsBadgeClasses(openSlots)}
                aria-label={getTurnStatusBadgeAriaLabel({ openSlots })}
              >
                {statusBadgeText}
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Actions row */}
        {(isJoined || isCreator || isSubstitute || canJoin) && (
          <div className={getTurnCardActionsContainerClasses()}>
            {(isJoined || isCreator) && openSlots > 0 && (
              <div className={getTurnCardSalvageWrapperClasses()}>
                <OpenToNetworkButton
                  turnId={turn.id}
                  club={turn.club}
                  lastNetworkNotificationAt={turn.lastNetworkNotificationAt}
                  variant="outline"
                  size="sm"
                  showText={false}
                  label={getTurnCardSalvageLabel()}
                  iconOnly={false}
                />
              </div>
            )}

            <ShareButton
              url={createMagicLink({ resource: "turn", identifier: turn.id }).url}
              title={getTurnCardShareTitle()}
              text={
                openSlots > 0
                  ? getTurnSalvageShareMessage({
                      club: turn.club,
                      date: turn.date,
                      openSlots,
                    })
                  : undefined
              }
              shareData={
                openSlots <= 0
                  ? {
                      type: "turn",
                      club: turn.club,
                      date: turn.date,
                    }
                  : undefined
              }
              variant="default"
              size="sm"
              iconOnly={false}
              className={getTurnCardShareButtonClasses()}
            />

            {canJoin && (
              <button
                onClick={handleQuickJoin}
                disabled={isPending}
                aria-busy={isPending}
                aria-label={getQuickJoinAriaLabel({
                  club: turn.club,
                  isSubstitute: canJoinAsSubstitute,
                  isPending,
                })}
                className={getTurnCardQuickJoinButtonClasses()}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  getTurnCardQuickJoinText({ isSubstitute: canJoinAsSubstitute })
                )}
              </button>
            )}
          </div>
        )}
    </div>
  );
}
