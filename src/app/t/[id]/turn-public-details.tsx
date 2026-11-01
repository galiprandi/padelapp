import { auth } from "@/auth";
import { getTurnByIdAction } from "@/app/(app)/turnos/actions";
import { getCachedPadelContacts, calculatePadelContactAriaLabel, type PadelContact } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { LocalDate, LocalTime } from "@/components/ui/local-date";
import { ShareButton } from "@/components/share/share-button";
import { LeaveTurnButton } from "@/components/turns/leave-turn-button";
import {
  RemovePlayerButton,
  AssignSubstituteButton,
} from "@/components/turns/organizer-actions";
import { createMagicLink } from "@/lib/magic-link";
import { SignInForm } from "@/components/auth/sign-in-form";
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  Edit3,
  MapPin,
  Info,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { WhatsAppInviteButton, WhatsAppGroupInviteButton } from "@/components/turns/whatsapp-invite-button";
import { TurnChat } from "@/components/turns/turn-chat";
import {
  getTurnSalvageBannerText,
  getTurnUrgencyBadgeText,
  getTurnPublicSubtitle,
  formatTurnSalvageCalloutAriaLabel,
  formatTurnProgressPercentage,
  formatTurnProgressAriaLabel,
  formatSubstituteListAriaLabel,
  buildTurnConnectionMap,
  getContactBadgeText,
  getSuggestedContactSectionAriaLabel,
  getTurnActionsRegionAriaLabel,
  getSubstituteWaitlistMessage,
  getSubstituteNoSlotsText,
  getTurnCompletedButtonLabel,
  getAlreadyJoinedButtonLabel,
  getSignInPromptText,
  getTurnDetailsHeading,
  getTurnInfoSectionTitle,
  getTurnInfoRegionAriaLabel,
  getTurnStatusBadgeText,
  getTurnStatusBadgeClasses,
  getTurnEnrolledSectionTitle,
  getTurnEnrolledRegionAriaLabel,
  getTurnSubstitutesSectionTitle,
  getTurnSubstitutesRegionAriaLabel,
  getTurnSubstitutesCountText,
  getTurnChatSectionTitle,
  getTurnChatRegionAriaLabel,
  getTurnConnectionText,
  getTurnConnectionAriaLabel,
  getTurnBackAriaLabel,
  getTurnUrgencyBadgeAriaLabel,
  getTurnPublicDetailsHeaderTitleClasses,
  getTurnPublicDetailsHeaderSubtitleClasses,
  getTurnPublicDetailsHeaderRowClasses,
  getTurnPublicDetailsSectionTitleClasses,
  getTurnPublicDetailsTimeLabelClasses,
  getTurnPublicDetailsTimeValueClasses,
  getTurnPublicDetailsLocationClubClasses,
  getTurnPublicDetailsLocationDateClasses,
  getTurnPublicDetailsProgressBarClasses,
  getTurnPublicDetailsProgressBarFillClasses,
  getTurnPublicDetailsNotesHeadingClasses,
  getTurnPublicDetailsSpacerClasses,
  getTurnPublicDetailsWaitlistNoticeClasses,
  getTurnActionsFlexSlotClasses,
  getTurnContactProfileLinkAriaLabel,
  getTurnContactCompatibilityAriaLabel,
  getTurnContactBadgeAriaLabel,
  getTurnShareTitle,
  getTurnShareButtonClasses,
  getTurnSalvageBannerBadgeText,
  getTurnTimeLabel,
  getTurnCoveredSlotsLabel,
  getTurnCoveredSlotsText,
  getTurnNotesTitle,
  getTurnOpenSlotsBadgeText,
  getTurnOrganizerBadgeText,
  getTurnYouBadgeText,
  formatTurnCompactDate,
  getTurnEditButtonText,
  getTurnEditButtonAriaLabel,
  getTurnActionsEditButtonClasses,
  getTurnActionsSubstituteNoSlotsClasses,
  getTurnActionsCompletedButtonClasses,
  getTurnActionsAlreadyJoinedButtonClasses,
  getTurnActionsContainerClasses,
  getTurnCancelledHeaderProps,
  getTurnSuggestedContactsHeaderProps,
  getTurnPublicDetailsShareButtonAriaLabel,
  getTurnPublicDetailsEmptySlotsProps,
  getTurnPublicDetailsHeaderBackLinkClasses,
  getTurnPublicDetailsBannerContainerClasses,
  getTurnPublicDetailsBannerShareButtonClasses,
  getTurnPublicDetailsInfoCardClasses,
  getTurnPublicDetailsInfoCardHeaderClasses,
  getTurnPublicDetailsInfoCardNotesClasses,
  getTurnPublicDetailsPlayerItemClasses,
  getTurnPublicDetailsEmptySlotClasses,
  getTurnPublicDetailsSuggestedContactItemClasses,
  getTurnPublicDetailsSubstituteItemClasses,
  getTurnShareData,
  getTurnShareText,
  getTurnPublicDetailsContainerClasses,
  getTurnPublicDetailsHeaderContainerClasses,
  getTurnPublicDetailsGridDividerClasses,
  getTurnPublicDetailsTimeCardClasses,
  getTurnPublicDetailsLocationCardClasses,
  getTurnPublicDetailsLocationIconBadgeClasses,
  getTurnPublicDetailsSlotsProgressCardClasses,
  getTurnPublicDetailsCalendarContainerClasses,
  getTurnPublicDetailsEnrolledSectionClasses,
  getTurnPublicDetailsEnrolledHeaderClasses,
  getTurnPublicDetailsSuggestedSectionClasses,
  getTurnPublicDetailsSuggestedHeaderClasses,
  getTurnPublicDetailsCancelledButtonClasses,
  getTurnPublicDetailsEmptySlotIconBadgeClasses,
  getTurnPublicDetailsEmptySlotContentClasses,
  getTurnPublicDetailsEmptySlotTextClasses,
  getTurnPublicDetailsEmptySlotShareButtonClasses,
  getTurnPublicDetailsSubstitutesSectionClasses,
  getTurnPublicDetailsSubstitutesHeaderClasses,
  getTurnPublicDetailsSubstitutesCountBadgeClasses,
  getTurnPublicDetailsSubstitutesListClasses,
  getTurnPublicDetailsSubstituteIndexBadgeClasses,
  getTurnPublicDetailsChatSectionClasses,
  getTurnActionsInnerContainerClasses,
  getTurnActionsStackClasses,
  getTurnActionsButtonGroupClasses,
  getTurnActionsFullWidthRowClasses,
  getTurnActionsSignInFormClasses,
  getTurnActionsShareButtonSmallClasses,
  getTurnActionsShareButtonLargeClasses,
} from "@/components/turns/turn-utils";
import {
  CancelTurnForm,
  StartMatchForm,
  JoinTurnForm,
  JoinSubstituteForm,
  LeaveSubstituteForm,
  TakeOpenSlotForm,
  ScheduleNextTurnForm,
  PlayCasualForm,
  QuickJoinEmptySlotButton,
} from "@/components/turns/turn-actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OpenToNetworkButton } from "@/components/turns/open-to-network-button";
import { AddToCalendarButton } from "@/components/turns/add-to-calendar";
import { AddPlayerButton } from "@/components/turns/add-player-button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { playerEdges } from "@/db/schema";
import { and, inArray } from "drizzle-orm";

interface TurnPublicDetailsProps {
  params: Promise<{ id: string }>;
}

/** Shared share button for the turn detail page — avoids 6× repetition. */
function TurnShareButton({
  shareUrl,
  club,
  date,
  openSlots = 0,
  variant = "full",
  className,
}: {
  shareUrl: string;
  club: string;
  date: Date;
  openSlots?: number;
  variant?: "full" | "icon";
  className?: string;
}) {
  const shareText = getTurnShareText({ club, date, openSlots });
  const shareData = getTurnShareData({ club, date, openSlots });

  return (
    <ShareButton
      title={getTurnShareTitle()}
      text={shareText}
      shareData={shareData}
      url={shareUrl}
      variant="outline"
      iconOnly={variant === "icon"}
      className={getTurnShareButtonClasses(variant, className)}
      aria-label={getTurnPublicDetailsShareButtonAriaLabel(openSlots, club)}
    />
  );
}

export async function TurnPublicDetails({ params }: TurnPublicDetailsProps) {
  const { id } = await params;
  const session = await auth();
  const result = await getTurnByIdAction(id);

  if (result.status !== "ok" || !result.turn) {
    notFound();
  }

  const turn = result.turn;
  const viewerId = session?.user?.id;
  const isJoined = turn.players.some((p) => p.userId === viewerId);
  const isCreator = turn.creatorId === viewerId;
  const isCancelled = turn.status === "CANCELLED";
  const isCompleted = turn.status === "COMPLETED";
  const isFull = turn.players.length >= turn.maxPlayers;
  const isSubstitute = turn.substitutes.some((s) => s.userId === viewerId);
  const hasOpenSlot = turn.players.length < turn.maxPlayers;

  // Compute share URL once instead of 6 times
  const shareUrl = createMagicLink({ resource: "turn", identifier: id }).url;

  // Fetch viewer's contacts
  let viewerContacts: PadelContact[] = [];
  if (viewerId) {
    viewerContacts = await getCachedPadelContacts(viewerId);
  }
  const contactIds = new Set(viewerContacts.map((c) => c.id));

  // Fetch prioritized salvage recommendations for the network section
  let suggestedContacts: PadelContact[] = [];
  if (viewerId && (isJoined || isCreator) && hasOpenSlot && !isCompleted) {
    const { getCachedTurnNetworkContacts } = await import("@/lib/queries");
    suggestedContacts = await getCachedTurnNetworkContacts(id);
  }

  // Find mutual contact connections among players and substitutes
  const allTurnUserIds = [
    ...turn.players.map((p) => p.userId),
    ...turn.substitutes.map((s) => s.userId),
  ];

  const connectionMap: Record<string, string> = {};
  if (allTurnUserIds.length >= 2 && !(process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true")) {
    const edges = await db
      .select()
      .from(playerEdges)
      .where(
        and(
          inArray(playerEdges.playerAId, allTurnUserIds),
          inArray(playerEdges.playerBId, allTurnUserIds)
        )
      );

    Object.assign(
      connectionMap,
      buildTurnConnectionMap(
        [
          ...turn.players.map((p) => ({
            userId: p.userId,
            joinedAt: p.joinedAt,
            name: p.user.alias ?? p.user.displayName,
          })),
          ...turn.substitutes.map((s) => ({
            userId: s.userId,
            joinedAt: s.joinedAt,
            name: s.user.alias ?? s.user.displayName,
          })),
        ],
        edges,
      ),
    );
  }

  if (isCancelled) {
    const cancelledHeader = getTurnCancelledHeaderProps();
    return (
      <div className={getTurnPublicDetailsContainerClasses()}>
        <div className={getTurnPublicDetailsHeaderContainerClasses()}>
          <Link
            href={viewerId ? "/me" : "/"}
            prefetch={true}
            aria-label={getTurnBackAriaLabel()}
            className={getTurnPublicDetailsHeaderBackLinkClasses()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className={getTurnPublicDetailsHeaderTitleClasses()}>
              {cancelledHeader.title}
            </h1>
            <p className={getTurnPublicDetailsHeaderSubtitleClasses()}>
              {cancelledHeader.description}
            </p>
          </div>
        </div>
        <Button asChild className={getTurnPublicDetailsCancelledButtonClasses()}>
          <Link href="/turnos" prefetch={true}>{cancelledHeader.buttonLabel}</Link>
        </Button>
      </div>
    );
  }

  // Compact date for subtitle (server-side, Argentina timezone)
  const compactDate = formatTurnCompactDate(turn.date);

  // Expanded subtitle logic — extracted to pure helper function
  const subtitle = getTurnPublicSubtitle({
    viewerId,
    creatorName: turn.creator.alias ?? turn.creator.displayName,
    compactDate,
    isJoined,
    isSubstitute,
    substituteIndex: turn.substitutes.findIndex((s) => s.userId === viewerId),
    substitutesCount: turn.substitutes.length,
    isCompleted,
    isFull,
  });

  const openSlotsCount = turn.maxPlayers - turn.players.length;
  const salvageBannerText = hasOpenSlot && !isCompleted ? getTurnSalvageBannerText(openSlotsCount) : null;
  const urgencyText = getTurnUrgencyBadgeText(turn.date, isFull);

  return (
    <div className={getTurnPublicDetailsContainerClasses()}>
      <div className={getTurnPublicDetailsHeaderRowClasses()}>
        <Link
          href={viewerId ? "/me" : "/"}
          prefetch={true}
          aria-label={getTurnBackAriaLabel()}
          className={getTurnPublicDetailsHeaderBackLinkClasses()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className={getTurnPublicDetailsHeaderTitleClasses()}>
            {getTurnDetailsHeading()}
          </h1>
          <p className={getTurnPublicDetailsHeaderSubtitleClasses()}>{subtitle}</p>
        </div>
      </div>

      {salvageBannerText && (
        <div
          role="region"
          aria-label={formatTurnSalvageCalloutAriaLabel({
            club: turn.club,
            openSlots: openSlotsCount,
          })}
          className={getTurnPublicDetailsBannerContainerClasses()}
        >
          <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              {getTurnSalvageBannerBadgeText()}
            </p>
            <p className="text-sm font-semibold mt-0.5 leading-snug">
              {salvageBannerText}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <WhatsAppGroupInviteButton
              club={turn.club}
              date={turn.date}
              openSlots={openSlotsCount}
              shareUrl={shareUrl}
              variant="amber"
              className="h-9 text-xs font-bold"
            />
            <TurnShareButton
              shareUrl={shareUrl}
              club={turn.club}
              date={turn.date}
              openSlots={openSlotsCount}
              variant="icon"
              className={getTurnPublicDetailsBannerShareButtonClasses()}
            />
          </div>
        </div>
      )}

      <div
        role="region"
        aria-label={getTurnInfoRegionAriaLabel()}
        className={getTurnPublicDetailsInfoCardClasses()}
      >
        <div className={getTurnPublicDetailsInfoCardHeaderClasses()}>
          <h2 className={getTurnPublicDetailsSectionTitleClasses()}>
            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
            {getTurnInfoSectionTitle()}
          </h2>
          <div className="flex items-center gap-1.5">
            {urgencyText && (
              <Badge variant="warning" aria-label={getTurnUrgencyBadgeAriaLabel(urgencyText)}>
                {urgencyText}
              </Badge>
            )}
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${getTurnStatusBadgeClasses({ isCompleted, isFull })}`}
            >
              {getTurnStatusBadgeText({ isCompleted, isFull })}
            </span>
          </div>
        </div>

        <div className={getTurnPublicDetailsGridDividerClasses()}>
          <div className={getTurnPublicDetailsTimeCardClasses()}>
            <div className={getTurnPublicDetailsTimeLabelClasses()}>
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-xs font-semibold">{getTurnTimeLabel()}</span>
            </div>
            <p className={getTurnPublicDetailsTimeValueClasses()}>
              <LocalTime date={turn.date} />
            </p>
          </div>

          <div className={getTurnPublicDetailsLocationCardClasses()}>
            <div className={getTurnPublicDetailsLocationIconBadgeClasses()}>
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className={getTurnPublicDetailsLocationClubClasses()}>{turn.club}</p>
              <p className={getTurnPublicDetailsLocationDateClasses()}>
                <LocalDate date={turn.date} />
              </p>
            </div>
          </div>

          <div className={getTurnPublicDetailsSlotsProgressCardClasses()}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">{getTurnCoveredSlotsLabel()}</span>
              <span className="text-xs font-bold text-foreground tabular-nums">
                {getTurnCoveredSlotsText(turn.players.length, turn.maxPlayers)}
              </span>
            </div>
            <div
              className={getTurnPublicDetailsProgressBarClasses()}
              role="progressbar"
              aria-valuenow={turn.players.length}
              aria-valuemin={0}
              aria-valuemax={turn.maxPlayers}
              aria-label={formatTurnProgressAriaLabel(turn.players.length, turn.maxPlayers)}
            >
              <div
                className={getTurnPublicDetailsProgressBarFillClasses()}
                style={{ width: `${formatTurnProgressPercentage(turn.players.length, turn.maxPlayers)}%` }}
              />
            </div>
          </div>
        </div>

        {turn.notes && (
          <div className={getTurnPublicDetailsInfoCardNotesClasses()}>
            <span className={getTurnPublicDetailsNotesHeadingClasses()}>
              {getTurnNotesTitle()}
            </span>
            &ldquo;{turn.notes}&rdquo;
          </div>
        )}

        {(isJoined || isCreator) && (
          <div className={getTurnPublicDetailsCalendarContainerClasses()}>
            <AddToCalendarButton
              turnId={id}
              club={turn.club}
              date={turn.date}
              duration={turn.duration}
              notes={turn.notes}
            />
          </div>
        )}
      </div>

      <section
        role="region"
        aria-label={getTurnEnrolledRegionAriaLabel()}
        className={getTurnPublicDetailsEnrolledSectionClasses()}
      >
        <div className={getTurnPublicDetailsEnrolledHeaderClasses()}>
          <h2 className={getTurnPublicDetailsSectionTitleClasses()}>
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {getTurnEnrolledSectionTitle()}
          </h2>
          <Badge variant="primary">
            {getTurnOpenSlotsBadgeText(turn.maxPlayers - turn.players.length)}
          </Badge>
        </div>

        <div className="grid gap-2">
          {turn.players.map((p) => {
            const isContact = contactIds.has(p.userId);
            return (
              <Link
                key={p.id}
                href={`/p/${p.userId}`}
                prefetch={true}
                className={getTurnPublicDetailsPlayerItemClasses()}
              >
                <PlayerAvatar
                  name={p.user.alias ?? p.user.displayName}
                  image={p.user.image ?? undefined}
                  size={40}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {p.user.alias ?? p.user.displayName}
                    {isContact && (
                      <Badge variant="primary" className="text-[10px] px-1.5 py-0 font-normal">
                        {getContactBadgeText()}
                      </Badge>
                    )}
                  </p>
                  {connectionMap[p.userId] && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1" aria-label={getTurnConnectionAriaLabel(connectionMap[p.userId])}>
                      <Info className="h-3 w-3 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                      <span>{getTurnConnectionText(connectionMap[p.userId])}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {p.userId === turn.creatorId && (
                    <Badge variant="primary">
                      {getTurnOrganizerBadgeText()}
                    </Badge>
                  )}
                  {isCreator &&
                    p.userId !== turn.creatorId &&
                    turn.status !== "COMPLETED" && (
                      <RemovePlayerButton
                        turnId={id}
                        playerUserId={p.userId}
                        playerName={p.user.alias ?? p.user.displayName}
                      />
                    )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                </div>
              </Link>
            );
          })}
          {(() => {
            const emptySlotsProps = getTurnPublicDetailsEmptySlotsProps(
              turn.maxPlayers - turn.players.length
            );
            return Array.from({ length: turn.maxPlayers - turn.players.length }).map(
              (_, i) => (
                <div
                  key={`${emptySlotsProps.keyPrefix}-${i}`}
                  role="region"
                  aria-label={emptySlotsProps.ariaLabel}
                  className={getTurnPublicDetailsEmptySlotClasses()}
                >
                  <div className={getTurnPublicDetailsEmptySlotIconBadgeClasses()}>
                    <Users className="h-5 w-5 text-muted-foreground/50" aria-hidden="true" />
                  </div>
                  <div className={getTurnPublicDetailsEmptySlotContentClasses()}>
                    <p className={getTurnPublicDetailsEmptySlotTextClasses()}>
                      {emptySlotsProps.text}
                    </p>
                    {isJoined || isCreator ? (
                      <TurnShareButton
                        shareUrl={shareUrl}
                        club={turn.club}
                        date={turn.date}
                        openSlots={turn.maxPlayers - turn.players.length}
                        variant="icon"
                        className={getTurnPublicDetailsEmptySlotShareButtonClasses()}
                      />
                    ) : (
                      viewerId && !isSubstitute && turn.status === "OPEN" && (
                        <QuickJoinEmptySlotButton turnId={id} />
                      )
                    )}
                  </div>
                </div>
              ),
            );
          })()}
        </div>

        {isCreator && hasOpenSlot && !isCompleted && (
          <AddPlayerButton
            turnId={id}
            existingPlayerIds={turn.players.map((p) => p.userId)}
          />
        )}

        {isJoined && !isFull && turn.status === "OPEN" && (
          <OpenToNetworkButton
            turnId={id}
            club={turn.club}
            lastNetworkNotificationAt={turn.lastNetworkNotificationAt}
          />
        )}
      </section>

      {suggestedContacts.length > 0 && (
        <section
          role="region"
          aria-label={getSuggestedContactSectionAriaLabel({
            count: Math.min(suggestedContacts.length, 4),
            openSlots: openSlotsCount,
          })}
          className={getTurnPublicDetailsSuggestedSectionClasses()}
        >
          <div className={getTurnPublicDetailsSuggestedHeaderClasses()}>
            <h2 className={getTurnPublicDetailsSectionTitleClasses()}>
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" aria-hidden="true" />
              {getTurnSuggestedContactsHeaderProps().title}
            </h2>
            <span className="text-xs font-medium text-muted-foreground">
              {getTurnSuggestedContactsHeaderProps().subtitle}
            </span>
          </div>

          <div className="grid gap-2">
            {suggestedContacts.slice(0, 4).map((contact) => {
              const contactName = contact.alias ?? contact.displayName;
              const ariaLabel = calculatePadelContactAriaLabel(contact);

              return (
                <div
                  key={contact.id}
                  role="region"
                  aria-label={ariaLabel}
                  title={ariaLabel}
                  className={getTurnPublicDetailsSuggestedContactItemClasses()}
                >
                  <Link
                    href={`/p/${contact.id}`}
                    prefetch={true}
                    aria-label={getTurnContactProfileLinkAriaLabel(contactName)}
                    className="flex items-center gap-3 flex-1 min-w-0 rounded-lg transition-all hover:opacity-80 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                  >
                    <PlayerAvatar
                      name={contactName}
                      image={contact.image ?? undefined}
                      size={40}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm truncate leading-tight text-foreground hover:text-primary transition-colors">
                          {contactName}
                        </p>
                        {contact.proximityTier && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${
                              contact.badgeStyle ?? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
                            }`}
                            title={`Compatibilidad con el turno: ${contact.proximityTier}. ${contact.proximitySummary ?? ""}`}
                            aria-label={getTurnContactCompatibilityAriaLabel(contactName, contact.proximityTier, contact.proximitySummary)}
                          >
                            {contact.proximityTier}
                          </span>
                        )}
                        <Badge variant="primary" className="text-[10px] px-1.5 py-0 font-normal">
                          {getContactBadgeText(contact.matchesTogether > 1)}
                        </Badge>
                      </div>
                      {contact.proximitySummary ? (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {contact.proximitySummary}
                        </p>
                      ) : contact.matchesTogether > 0 ? (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {contact.matchesTogether} {contact.matchesTogether === 1 ? "partido compartido" : "partidos compartidos"}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                  <WhatsAppInviteButton
                    club={turn.club}
                    date={turn.date}
                    contactName={contactName}
                    openSlots={turn.maxPlayers - turn.players.length}
                    shareUrl={shareUrl}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {turn.substitutes.length > 0 && (
        <section
          role="region"
          aria-label={getTurnSubstitutesRegionAriaLabel()}
          className={getTurnPublicDetailsSubstitutesSectionClasses()}
        >
          <div className={getTurnPublicDetailsSubstitutesHeaderClasses()}>
            <h2 className={getTurnPublicDetailsSectionTitleClasses()}>
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {getTurnSubstitutesSectionTitle()}
            </h2>
            <span className={getTurnPublicDetailsSubstitutesCountBadgeClasses()}>
              {getTurnSubstitutesCountText(turn.substitutes.length)}
            </span>
          </div>
          <div className={getTurnPublicDetailsSubstitutesListClasses()}>
            {turn.substitutes.map((s, index) => {
              const isContact = contactIds.has(s.userId);
              const name = s.user.alias ?? s.user.displayName;
              return (
                <Link
                  key={s.id}
                  href={`/p/${s.userId}`}
                  prefetch={true}
                  aria-label={formatSubstituteListAriaLabel(index, turn.substitutes.length, name)}
                  className={getTurnPublicDetailsSubstituteItemClasses()}
                >
                  <span className={getTurnPublicDetailsSubstituteIndexBadgeClasses()}>
                    {index + 1}
                  </span>
                  <PlayerAvatar
                    name={s.user.alias ?? s.user.displayName}
                    image={s.user.image ?? undefined}
                    size={40}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {s.user.alias ?? s.user.displayName}
                      {isContact && (
                        <span
                          className="h-2 w-2 rounded-full bg-primary"
                          title="Contacto"
                          aria-label={getTurnContactBadgeAriaLabel("Contacto frecuente")}
                        />
                      )}
                    </p>
                    {connectionMap[s.userId] && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1" aria-label={getTurnConnectionAriaLabel(connectionMap[s.userId])}>
                        <Info className="h-3 w-3 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                        <span>{getTurnConnectionText(connectionMap[s.userId])}</span>
                      </p>
                    )}
                  </div>
                  {s.userId === viewerId && (
                    <Badge variant="primary">
                      {getTurnYouBadgeText()}
                    </Badge>
                  )}
                  {isCreator &&
                    hasOpenSlot &&
                    turn.status !== "COMPLETED" &&
                    s.userId !== viewerId && (
                      <AssignSubstituteButton
                        turnId={id}
                        substituteUserId={s.userId}
                        substituteName={s.user.alias ?? s.user.displayName}
                      />
                    )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {(isJoined || isCreator || isSubstitute) && (
        <section
          role="region"
          aria-label={getTurnChatRegionAriaLabel()}
          className={getTurnPublicDetailsChatSectionClasses()}
        >
          <h2 className={getTurnPublicDetailsSectionTitleClasses()}>
            <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {getTurnChatSectionTitle()}
          </h2>
          <TurnChat turnId={id} currentUserId={viewerId} />
        </section>
      )}

      <div className={getTurnPublicDetailsSpacerClasses()} />

      <div
        className={getTurnActionsContainerClasses()}
        role="region"
        aria-label={getTurnActionsRegionAriaLabel({
          club: turn.club,
          viewerId,
          isSubstitute,
          isJoined,
          isCreator,
          isFull,
          isCompleted,
          openSlots: turn.maxPlayers - turn.players.length,
        })}
      >
        <div className={getTurnActionsInnerContainerClasses()}>
          <TurnActions
            viewerId={viewerId}
            isSubstitute={isSubstitute}
            isFull={isFull}
            isJoined={isJoined}
            isCreator={isCreator}
            isCompleted={isCompleted}
            hasOpenSlot={hasOpenSlot}
            openSlots={turn.maxPlayers - turn.players.length}
            turnId={id}
            club={turn.club}
            date={turn.date}
            shareUrl={shareUrl}
            playersCount={turn.players.length}
          />
        </div>
      </div>
    </div>
  );
}

/** Bottom action bar — extracted from 235-line ternary into a clear component. */
function TurnActions({
  viewerId,
  isSubstitute,
  isFull,
  isJoined,
  isCreator,
  isCompleted,
  hasOpenSlot,
  openSlots,
  turnId,
  club,
  date,
  shareUrl,
  playersCount,
}: {
  viewerId: string | undefined;
  isSubstitute: boolean;
  isFull: boolean;
  isJoined: boolean;
  isCreator: boolean;
  isCompleted: boolean;
  hasOpenSlot: boolean;
  openSlots: number;
  turnId: string;
  club: string;
  date: Date;
  shareUrl: string;
  playersCount: number;
}) {
  // State 1: Not logged in
  if (!viewerId) {
    return (
      <div className={getTurnActionsStackClasses()}>
        <SignInForm
          callbackUrl={`/t/${turnId}`}
          label={getSignInPromptText(club)}
          className={getTurnActionsSignInFormClasses()}
        />
        <TurnShareButton shareUrl={shareUrl} club={club} date={date} openSlots={openSlots} />
      </div>
    );
  }

  // State 2: Substitute
  if (isSubstitute) {
    return (
      <div className={getTurnActionsStackClasses()}>
        {hasOpenSlot ? (
          <TakeOpenSlotForm turnId={turnId} />
        ) : (
          <>
            <div className={getTurnActionsSubstituteNoSlotsClasses()}>
              {getSubstituteNoSlotsText()}
            </div>
            <p className={getTurnPublicDetailsWaitlistNoticeClasses()}>
              {getSubstituteWaitlistMessage()}
            </p>
          </>
        )}
        {!isCompleted && (
          <TurnShareButton shareUrl={shareUrl} club={club} date={date} openSlots={openSlots} />
        )}
        <LeaveSubstituteForm turnId={turnId} hasOpenSlot={hasOpenSlot} />
      </div>
    );
  }

  // State 3: Full turn
  if (isFull) {
    return (
      <div className={getTurnActionsStackClasses()}>
        {isCreator && !isCompleted && (
          <>
            <StartMatchForm turnId={turnId} />
            <ScheduleNextTurnForm turnId={turnId} />
            <div className={getTurnActionsButtonGroupClasses()}>
              <Button
                asChild
                variant="outline"
                className={getTurnActionsEditButtonClasses()}
              >
                <Link
                  href={`/turnos/${turnId}/editar`}
                  prefetch={true}
                  aria-label={getTurnEditButtonAriaLabel(club)}
                >
                  <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
                  {getTurnEditButtonText()}
                </Link>
              </Button>
              <CancelTurnForm turnId={turnId} />
            </div>
          </>
        )}
        {isCompleted ? (
          <Button
            disabled
            className={getTurnActionsCompletedButtonClasses()}
          >
            {getTurnCompletedButtonLabel()}
          </Button>
        ) : isJoined ? (
          <Button
            disabled
            className={getTurnActionsAlreadyJoinedButtonClasses()}
          >
            {getAlreadyJoinedButtonLabel()}
          </Button>
        ) : (
          <JoinSubstituteForm turnId={turnId} />
        )}
        {!isCompleted && (
          <TurnShareButton shareUrl={shareUrl} club={club} date={date} />
        )}
        {isJoined && !isCompleted && (
          <LeaveTurnButton
            turnId={turnId}
            club={club}
            wasFull
            isCreator={isCreator}
            date={date}
          />
        )}
      </div>
    );
  }

  // State 4: Joined (not full)
  if (isJoined) {
    return (
      <div className={getTurnActionsStackClasses()}>
        {isCreator && (
          <>
            {playersCount >= 4 && !isCompleted && (
              <StartMatchForm turnId={turnId} />
            )}
            {playersCount >= 2 && playersCount < 4 && !isCompleted && (
              <PlayCasualForm turnId={turnId} />
            )}
            <div className={getTurnActionsFullWidthRowClasses()}>
              <div className={getTurnActionsFlexSlotClasses()}>
                <ScheduleNextTurnForm turnId={turnId} />
              </div>
              {!isCompleted && (
                <TurnShareButton
                  shareUrl={shareUrl}
                  club={club}
                  date={date}
                  openSlots={openSlots}
                  variant="icon"
                  className={getTurnActionsShareButtonSmallClasses()}
                />
              )}
            </div>
            <div className={getTurnActionsButtonGroupClasses()}>
              <Button
                asChild
                variant="outline"
                className={getTurnActionsEditButtonClasses()}
              >
                <Link
                  href={`/turnos/${turnId}/editar`}
                  prefetch={true}
                  aria-label={getTurnEditButtonAriaLabel(club)}
                >
                  <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
                  {getTurnEditButtonText()}
                </Link>
              </Button>
              <CancelTurnForm turnId={turnId} />
            </div>
            <LeaveTurnButton
              turnId={turnId}
              club={club}
              isCreator={isCreator}
              date={date}
            />
          </>
        )}
        {!isCreator && (
          <div className={getTurnActionsFullWidthRowClasses()}>
            <div className={getTurnActionsFlexSlotClasses()}>
              <LeaveTurnButton
                turnId={turnId}
                club={club}
                isCreator={isCreator}
                date={date}
              />
            </div>
            {!isCompleted && (
              <TurnShareButton
                shareUrl={shareUrl}
                club={club}
                date={date}
                openSlots={openSlots}
                variant="icon"
                className={getTurnActionsShareButtonSmallClasses()}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // State 5: Not joined (open turn)
  return (
    <div className={getTurnActionsStackClasses()}>
      {isCreator && (
        <>
          {playersCount >= 2 && playersCount < 4 && !isCompleted && (
            <PlayCasualForm turnId={turnId} />
          )}
          <ScheduleNextTurnForm turnId={turnId} />
          <div className={getTurnActionsButtonGroupClasses()}>
            <Button
              asChild
              variant="outline"
              className={getTurnActionsEditButtonClasses()}
            >
              <Link
                href={`/turnos/${turnId}/editar`}
                prefetch={true}
                aria-label={getTurnEditButtonAriaLabel(club)}
              >
                <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
                {getTurnEditButtonText()}
              </Link>
            </Button>
            <CancelTurnForm turnId={turnId} />
          </div>
        </>
      )}
      <div className={getTurnActionsFullWidthRowClasses()}>
        <div className={getTurnActionsFlexSlotClasses()}>
          <Suspense fallback={null}>
            <JoinTurnForm turnId={turnId} />
          </Suspense>
        </div>
        {!isCompleted && (
          <TurnShareButton
            shareUrl={shareUrl}
            club={club}
            date={date}
            openSlots={openSlots}
            variant="icon"
            className={getTurnActionsShareButtonLargeClasses()}
          />
        )}
      </div>
    </div>
  );
}
