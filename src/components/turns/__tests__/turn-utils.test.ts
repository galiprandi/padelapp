import { describe, it, expect } from "vitest";
import {
  formatWhatsAppInviteMessage,
  formatWhatsAppGroupInviteMessage,
  getWhatsAppInviteUrl,
  getWhatsAppGroupInviteUrl,
  getTurnSalvageShareMessage,
  getOpenSlotsBadgeText,
  getTurnSalvageBannerText,
  getTurnRoleBadgeText,
  getCooldownRemainingMinutes,
  getTurnUrgencyBadgeText,
  getNextRadioValue,
  filterTurnsByTab,
  formatSpanishNamesList,
  formatContactPlayersSummary,
  getTurnPublicSubtitle,
  isLateLeaveWarningRequired,
  filterAndSortPlayerOptions,
  getAddPlayerSuccessToast,
  getAddPlayerAriaLabel,
  getAddPlayerSearchStatusAriaLabel,
  getAddPlayerPromptText,
  getAddPlayerEmptyResultsText,
  getAddPlayerClearSearchAriaLabel,
  getIcsDownloadFilename,
  getAddPlayerInputLabelText,
  getAddPlayerCancelSearchAriaLabel,
  validateTurnFormData,
  getNewTurnWhatsAppShareUrl,
  formatTurnSalvageCalloutAriaLabel,
  formatTurnProgressPercentage,
  formatTurnProgressAriaLabel,
  formatSubstituteListAriaLabel,
  buildTurnConnectionMap,
  formatCalendarUTC,
  getGoogleCalendarUrl,
  getCancelTurnAriaLabel,
  getCancelTurnConfirmRegionAriaLabel,
  getStartMatchAriaLabel,
  getJoinTurnAriaLabel,
  getJoinSubstituteAriaLabel,
  getLeaveSubstituteAriaLabel,
  getTakeOpenSlotAriaLabel,
  getScheduleNextTurnAriaLabel,
  getPlayCasualAriaLabel,
  getPlayCasualConfirmRegionAriaLabel,
  getIcsCalendarContent,
  getCalendarOptionsAriaLabel,
  getCalendarButtonText,
  getCalendarButtonAriaLabel,
  getCalendarHeaderPromptText,
  getGoogleButtonText,
  getGoogleButtonAriaLabel,
  getIcsButtonText,
  getIcsButtonAriaLabel,
  getGoogleCalendarToast,
  getIcsCalendarToast,
  getRemovePlayerErrorToast,
  getAssignSubstituteErrorToast,
  getAddPlayerErrorToast,
  getSendChatMessageErrorToast,
  getRemovePlayerAriaLabel,
  getRemovePlayerSuccessToast,
  getAssignSubstituteAriaLabel,
  getAssignSubstituteSuccessToast,
  getTurnFilterAriaLabel,
  formatTurnFilterBadgeText,
  getTurnFilterTabAriaLabel,
  getTurnCardAriaLabel,
  getQuickJoinAriaLabel,
  getTurnStatusBadgeAriaLabel,
  getLeaveTurnSuccessToast,
  getLeaveTurnErrorToast,
  getLeaveTurnTriggerAriaLabel,
  getLeaveTurnRegionAriaLabel,
  getCancelLeaveTurnAriaLabel,
  getConfirmLeaveTurnAriaLabel,
  getOpenToNetworkSuccessToast,
  getOpenToNetworkErrorToast,
  getOpenToNetworkRegionAriaLabel,
  getOpenToNetworkResultText,
  getOpenToNetworkAriaLabel,
  getOpenToNetworkCooldownText,
  getOpenToNetworkButtonText,
  getOpenToNetworkResultAriaLabel,
  getOpenToNetworkHelperText,
  getOpenToNetworkResultSubtitle,
  getOpenToNetworkResultDescription,
  getOpenToNetworkIconResultClasses,
  getOpenToNetworkCompactResultClasses,
  getOpenToNetworkDefaultResultClasses,
  getOpenToNetworkContainerClasses,
  getOpenToNetworkButtonClasses,
  getWhatsAppInviteSuccessToast,
  getWhatsAppGroupInviteSuccessToast,
  getWhatsAppInviteAriaLabel,
  getWhatsAppGroupInviteAriaLabel,
  getWhatsAppInviteButtonText,
  getWhatsAppGroupInviteButtonText,
  getFallbackWhatsAppShareUrl,
  getContactBadgeText,
  getSuggestedContactSectionAriaLabel,
  getTurnActionsRegionAriaLabel,
  getSubstituteWaitlistMessage,
  getSubstituteNoSlotsText,
  getTurnCompletedButtonLabel,
  getAlreadyJoinedButtonLabel,
  getSignInPromptText,
  getCreateTurnSuccessToast,
  getUpdateTurnSuccessToast,
  getTurnFormRegionAriaLabel,
  getTurnFormSubmitButtonAriaLabel,
  getTurnFilterHeadingTitle,
  getTurnFilterEmptyStateProps,
  getCancelTurnSuccessToast,
  getCancelTurnErrorToast,
  getJoinTurnSuccessToast,
  getJoinTurnErrorToast,
  getJoinSubstituteSuccessToast,
  getLeaveSubstituteSuccessToast,
  getLeaveSubstituteErrorToast,
  getTakeOpenSlotSuccessToast,
  getStartMatchSuccessToast,
  getStartMatchErrorToast,
  getScheduleNextTurnSuccessToast,
  getScheduleNextTurnErrorToast,
  getPlayCasualSuccessToast,
  getPlayCasualErrorToast,
  getTurnCardSubstitutesText,
  getTurnCardContactPlayersAriaLabel,
  getTurnCardDetailLinkAriaLabel,
  getTurnCancelledTitle,
  getTurnCancelledDescription,
  getTurnCancelledButtonLabel,
  getTurnDetailsHeading,
  getTurnInfoSectionTitle,
  getTurnInfoRegionAriaLabel,
  getTurnStatusBadgeText,
  getTurnStatusBadgeClasses,
  getTurnEnrolledSectionTitle,
  getTurnEnrolledRegionAriaLabel,
  getEmptySlotText,
  getTurnSuggestedContactsTitle,
  getTurnSuggestedContactsSubtitle,
  getTurnSubstitutesSectionTitle,
  getTurnSubstitutesRegionAriaLabel,
  getTurnSubstitutesCountText,
  getTurnChatSectionTitle,
  getTurnChatRegionAriaLabel,
  getTurnConnectionText,
  getTurnConnectionAriaLabel,
  getTurnBackAriaLabel,
  getTurnSkeletonAriaLabel,
  getTurnosHeadingTitle,
  getTurnosHeadingDescription,
  getNewTurnHeadingTitle,
  getNewTurnHeadingDescription,
  getEditTurnHeadingTitle,
  getEditTurnHeadingDescription,
  getTurnosLoadingAriaLabel,
  getNewTurnLoadingAriaLabel,
  getEditTurnLoadingAriaLabel,
  getLateLeaveWarningTitle,
  getLateLeaveWarningDescription,
  getWasFullSharePromptText,
  getPlayCasualConfirmText,
  getCancelTurnDismissAriaLabel,
  getPlayCasualDismissAriaLabel,
  getQuickJoinEmptySlotAriaLabel,
  getQuickJoinEmptySlotText,
  getTodayBadgeText,
  getTomorrowBadgeText,
  getTurnCardShareTitle,
  getTurnCardSalvageLabel,
  getTurnCardQuickJoinText,
  getTurnCardStatusBadgeText,
  getTurnCardContainerClasses,
  getLeaveSubstituteButtonText,
  getQuickJoinEmptySlotButtonText,
  getCancelTurnButtonText,
  getCancelTurnConfirmButtonText,
  getStartMatchButtonText,
  getJoinTurnButtonText,
  getJoinSubstituteButtonText,
  getTakeOpenSlotButtonText,
  getScheduleNextTurnButtonText,
  getPlayCasualButtonText,
  getPlayCasualCancelButtonText,
  getPlayCasualConfirmButtonText,
  getRemovePlayerConfirmText,
  getAssignSubstituteButtonText,
  getAddPlayerButtonTitle,
  getAddPlayerButtonSubtitle,
  getAddPlayerSearchPlaceholder,
  getAddPlayerSearchResultsRegionAriaLabel,
  getAddPlayerRegionAriaLabel,
  getAddPlayerTriggerButtonClasses,
  getAddPlayerTriggerIconBadgeClasses,
  getAddPlayerCardContainerClasses,
  getAddPlayerSearchHeaderClasses,
  getAddPlayerSearchInputClasses,
  getAddPlayerSearchClearButtonClasses,
  getAddPlayerSearchCancelButtonClasses,
  getAddPlayerSearchResultItemClasses,
  getTurnFormDetailsHeaderTitle,
  getTurnFormClubLabel,
  getTurnFormClubPlaceholder,
  getTurnFormDateLabel,
  getTurnFormTimeLabel,
  getTurnFormDurationLabel,
  getTurnFormDurationTurnLabel,
  getTurnFormPlayersLabel,
  getTurnFormNotesLabel,
  getTurnFormNotesPlaceholder,
  getTurnFormSubmitButtonText,
  getTurnUrgencyBadgeAriaLabel,
  getTurnContactProfileLinkAriaLabel,
  getTurnContactCompatibilityAriaLabel,
  getTurnContactBadgeAriaLabel,
  getLeaveTurnTriggerButtonText,
  getConfirmLeaveButtonText,
  getLeaveTurnCancelButtonText,
  getWasFullShareTitle,
  getWasFullShareText,
  getWhatsAppGroupInviteVariantClasses,
  getTurnFilterTabClasses,
  getTurnShareTitle,
  getTurnPublicDetailsShareButtonAriaLabel,
  getTurnPublicDetailsErrorFallbackProps,
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
  getTurnShareButtonClasses,
  getTurnSalvageBannerBadgeText,
  getTurnTimeLabel,
  getTurnCoveredSlotsLabel,
  getTurnCoveredSlotsText,
  getTurnNotesTitle,
  getTurnOpenSlotsBadgeText,
  getTurnOrganizerBadgeText,
  getTurnYouBadgeText,
  getTurnBackButtonAriaLabel,
  getTurnCreateButtonText,
  formatDurationOptionLabel,
  formatPlayerOptionLabel,
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
  getTurnCardDateContainerClasses,
  getTurnCardContactPlayersClasses,
  getTurnCardOpenSlotsBadgeClasses,
  getTurnCardQuickJoinButtonClasses,
  getWhatsAppInviteButtonClasses,
  getWhatsAppGroupInviteButtonClasses,
  getWhatsAppInviteIconClasses,
  getLeaveTurnTriggerButtonClasses,
  getLeaveTurnLateLeaveCardClasses,
  getLeaveTurnWasFullCardClasses,
  getLeaveTurnCancelButtonClasses,
  getLeaveTurnConfirmButtonClasses,
  getRemovePlayerTriggerButtonClasses,
  getRemovePlayerConfirmButtonClasses,
  getRemovePlayerDismissButtonClasses,
  getAssignSubstituteButtonClasses,
  getCancelTurnTriggerButtonClasses,
  getCancelTurnConfirmContainerClasses,
  getCancelTurnDismissButtonClasses,
  getCancelTurnConfirmButtonClasses,
  getStartMatchButtonClasses,
  getJoinTurnButtonClasses,
  getJoinSubstituteButtonClasses,
  getLeaveSubstituteTriggerButtonClasses,
  getTakeOpenSlotButtonClasses,
  getScheduleNextTurnButtonClasses,
  getPlayCasualTriggerButtonClasses,
  getPlayCasualConfirmContainerClasses,
  getPlayCasualCancelButtonClasses,
  getPlayCasualConfirmButtonClasses,
  getQuickJoinEmptySlotButtonClasses,
  getTurnFormContainerClasses,
  getTurnFormHeaderBackLinkClasses,
  getTurnFormHeaderTitleClasses,
  getTurnFormHeaderDescriptionClasses,
  getTurnFormCardClasses,
  getTurnFormCardHeaderClasses,
  getTurnFormCardHeaderTitleClasses,
  getTurnFormCardContentClasses,
  getTurnFormGroupClasses,
  getTurnFormLabelClasses,
  getTurnFormDurationRadioClasses,
  getTurnFormPlayerRadioClasses,
  getTurnFormTextareaClasses,
  getTurnFormSubmitButtonClasses,
  getTurnFilterContainerClasses,
  getTurnFilterRadiogroupClasses,
  getTurnFilterHeaderContainerClasses,
  getTurnFilterHeaderTitleClasses,
  getTurnFilterBadgeClasses,
  getTurnFilterPrimaryButtonClasses,
  getTurnFilterOutlineButtonClasses,
  getCalendarTriggerButtonClasses,
  getCalendarOptionsContainerClasses,
  getCalendarOptionButtonClasses,
  getLeaveTurnWasFullShareButtonClasses,
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
  getTurnSkeletonHeaderBackBadgeClasses,
  getTurnSkeletonHeaderTitleContainerClasses,
  getTurnSkeletonTimeCardClasses,
  getTurnSkeletonLocationCardClasses,
  getTurnSkeletonLocationIconBadgeClasses,
  getTurnSkeletonPlayersSectionClasses,
  getTurnSkeletonPlayersHeaderClasses,
  getTurnSkeletonPlayersListClasses,
  getTurnSkeletonPlayerItemClasses,
  getTurnSkeletonBottomBarInnerClasses,
  getRemovePlayerRegionContainerClasses,
  getRemovePlayerConfirmRegionClasses,
  getAssignSubstituteRegionContainerClasses,
  getTurnsPageContainerClasses,
  getTurnsPageHeaderClasses,
  getTurnsListSkeletonContainerClasses,
  getTurnsListSkeletonTabGridClasses,
  getTurnsListSkeletonHeaderClasses,
  getTurnsListSkeletonCardListClasses,
  getTurnosLoadingContainerClasses,
  getTurnEditPageContainerClasses,
  getTurnEditSkeletonContainerClasses,
  getTurnEditSkeletonHeaderClasses,
  getTurnEditSkeletonCardClasses,
  getTurnEditSkeletonCardHeaderClasses,
  getTurnEditSkeletonCardBodyClasses,
  getTurnPublicPageMainClasses,
  getTurnSkeletonContainerClasses,
  getTurnSkeletonHeaderClasses,
  getTurnSkeletonCardClasses,
  getTurnSkeletonCardHeaderClasses,
  getTurnSkeletonGridClasses,
  getTurnSkeletonBottomBarClasses,
  getPlayCasualConfirmNoticeText,
  getPlayCasualNoticeClasses,
  getPlayCasualStrongClasses,
  getCalendarHeaderPromptClasses,
  getCalendarOptionsGridClasses,
  getLeaveTurnConfirmContainerClasses,
  getLeaveTurnLateLeaveTitleClasses,
  getLeaveTurnLateLeaveDotClasses,
  getLeaveTurnLateLeaveDescriptionClasses,
  getLeaveTurnWasFullPromptClasses,
  getLeaveTurnActionGroupClasses,
  getOpenToNetworkDefaultResultHeaderClasses,
  getOpenToNetworkDefaultResultDescriptionClasses,
  getOpenToNetworkErrorClasses,
  getOpenToNetworkHelperClasses,
  getTurnCardDateMonthClasses,
  getTurnCardDateDayClasses,
} from "../turn-utils";

describe("formatWhatsAppInviteMessage", () => {
  it("formats invite message correctly for 1 open slot", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(19, 0, 0, 0);

    const msg = formatWhatsAppInviteMessage({
      club: "Central Padel",
      date: futureDate,
      contactName: "Mateo",
      openSlots: 1,
      shareUrl: "https://padelred.app/t/123",
    });

    expect(msg).toContain("Hola Mateo, ¿te sumás al turno de pádel en Central Padel");
    expect(msg).toContain("falta 1 jugador para completarlo.");
    expect(msg).toContain("Sumate acá: https://padelred.app/t/123");
    expect(msg).not.toContain("!");
    expect(msg).not.toContain("¡");
  });

  it("formats invite message correctly for multiple open slots", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(20, 30, 0, 0);

    const msg = formatWhatsAppInviteMessage({
      club: "El Balcón",
      date: futureDate,
      contactName: "Agustín",
      openSlots: 2,
      shareUrl: "https://padelred.app/t/456",
    });

    expect(msg).toContain("Hola Agustín, ¿te sumás al turno de pádel en El Balcón");
    expect(msg).toContain("20:30hs");
    expect(msg).toContain("faltan 2 jugadores para completarlo.");
    expect(msg).toContain("Sumate acá: https://padelred.app/t/456");
  });

  it("formats invite message correctly for today date", () => {
    const todayDate = new Date();
    todayDate.setHours(18, 0, 0, 0);

    const msg = formatWhatsAppInviteMessage({
      club: "Padel Club",
      date: todayDate,
      contactName: "Santi",
      openSlots: 1,
      shareUrl: "https://padelred.app/t/789",
    });

    expect(msg).toContain("hoy 18hs");
  });

  it("formats invite message correctly for tomorrow date", () => {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate.setHours(19, 30, 0, 0);

    const msg = formatWhatsAppInviteMessage({
      club: "Padel Club",
      date: tomorrowDate,
      contactName: "Lucas",
      openSlots: 1,
      shareUrl: "https://padelred.app/t/789",
    });

    expect(msg).toContain("mañana 19:30hs");
  });
});

describe("formatWhatsAppGroupInviteMessage", () => {
  it("formats WhatsApp group invite for 1 missing slot", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(19, 0, 0, 0);

    const msg = formatWhatsAppGroupInviteMessage({
      club: "Central Padel",
      date: futureDate,
      openSlots: 1,
      shareUrl: "https://padelred.app/t/group123",
    });

    expect(msg).toContain("⚠️ Falta 1 jugador para el turno de pádel en Central Padel");
    expect(msg).toContain("¿Quién se suma? Entren acá para anotarse: https://padelred.app/t/group123");
    expect(msg).not.toContain("!");
    expect(msg).not.toContain("¡");
  });

  it("formats WhatsApp group invite for multiple missing slots", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(21, 0, 0, 0);

    const msg = formatWhatsAppGroupInviteMessage({
      club: "Padel Park",
      date: futureDate,
      openSlots: 2,
      shareUrl: "https://padelred.app/t/group456",
    });

    expect(msg).toContain("⚠️ Faltan 2 jugadores para el turno de pádel en Padel Park");
    expect(msg).toContain("¿Quién se suma? Entren acá para anotarse: https://padelred.app/t/group456");
  });
});

describe("getWhatsAppInviteUrl and getWhatsAppGroupInviteUrl", () => {
  it("generates wa.me URL with encoded individual invite message", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(19, 0, 0, 0);

    const url = getWhatsAppInviteUrl({
      club: "Central Padel",
      date: futureDate,
      contactName: "Mateo",
      openSlots: 1,
      shareUrl: "https://padelred.app/t/123",
    });

    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("Hola Mateo"));
    expect(url).toContain(encodeURIComponent("Central Padel"));
  });

  it("generates wa.me URL with encoded group salvage invite message", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(20, 0, 0, 0);

    const url = getWhatsAppGroupInviteUrl({
      club: "Padel Park",
      date: futureDate,
      openSlots: 2,
      shareUrl: "https://padelred.app/t/group456",
    });

    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("⚠️ Faltan 2 jugadores"));
    expect(url).toContain(encodeURIComponent("Padel Park"));
  });
});

describe("getTurnSalvageShareMessage", () => {
  it("formats turn salvage share message for 1 missing slot", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(19, 0, 0, 0);

    const msg = getTurnSalvageShareMessage({
      club: "Central Padel",
      date: futureDate,
      openSlots: 1,
    });

    expect(msg).toContain("⚠️ Falta 1 jugador para el turno de pádel en Central Padel");
    expect(msg).toContain("Ayudanos a completarlo o sumate acá:");
    expect(msg).not.toContain("!");
    expect(msg).not.toContain("¡");
  });

  it("formats turn salvage share message for multiple missing slots", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(20, 15, 0, 0);

    const msg = getTurnSalvageShareMessage({
      club: "La Cancha Padel",
      date: futureDate,
      openSlots: 2,
    });

    expect(msg).toContain("⚠️ Faltan 2 jugadores para el turno de pádel en La Cancha Padel");
    expect(msg).toContain("20:15hs");
    expect(msg).toContain("Ayudanos a completarlo o sumate acá:");
  });
});

describe("getOpenSlotsBadgeText", () => {
  it("returns empty string when no slots are open", () => {
    expect(getOpenSlotsBadgeText(0)).toBe("");
    expect(getOpenSlotsBadgeText(-1)).toBe("");
  });

  it("returns 'Falta 1' when exactly 1 slot is open", () => {
    expect(getOpenSlotsBadgeText(1)).toBe("Falta 1");
  });

  it("returns 'Faltan X' when more than 1 slot is open", () => {
    expect(getOpenSlotsBadgeText(2)).toBe("Faltan 2");
    expect(getOpenSlotsBadgeText(3)).toBe("Faltan 3");
  });
});

describe("getTurnSalvageBannerText", () => {
  it("returns empty string when no slots are open", () => {
    expect(getTurnSalvageBannerText(0)).toBe("");
    expect(getTurnSalvageBannerText(-1)).toBe("");
  });

  it("formats callout banner text for 1 open slot", () => {
    const text = getTurnSalvageBannerText(1);
    expect(text).toBe("Falta 1 jugador para completar este turno. Sumate o compartilo con tu red para jugar.");
    expect(text).not.toContain("!");
    expect(text).not.toContain("¡");
  });

  it("formats callout banner text for multiple open slots", () => {
    const text = getTurnSalvageBannerText(2);
    expect(text).toBe("Faltan 2 jugadores para completar este turno. Sumate o compartilo con tu red para jugar.");
    expect(text).not.toContain("!");
    expect(text).not.toContain("¡");
  });
});

describe("getTurnRoleBadgeText", () => {
  it("returns 'Organizador' when isCreator is true", () => {
    expect(getTurnRoleBadgeText({ isCreator: true, isJoined: true })).toBe("Organizador");
    expect(getTurnRoleBadgeText({ isCreator: true, isSubstitute: false })).toBe("Organizador");
  });

  it("returns 'Suplente' when isSubstitute is true and not creator", () => {
    expect(getTurnRoleBadgeText({ isCreator: false, isSubstitute: true })).toBe("Suplente");
  });

  it("returns 'Inscripto' when isJoined is true and not creator or substitute", () => {
    expect(getTurnRoleBadgeText({ isCreator: false, isJoined: true })).toBe("Inscripto");
  });

  it("returns null when user has no role in turn", () => {
    expect(getTurnRoleBadgeText({ isCreator: false, isJoined: false, isSubstitute: false })).toBeNull();
  });
});

describe("getCooldownRemainingMinutes", () => {
  it("returns 0 when lastNotificationAt is null or undefined", () => {
    expect(getCooldownRemainingMinutes(null)).toBe(0);
    expect(getCooldownRemainingMinutes(undefined)).toBe(0);
  });

  it("returns remaining minutes rounded up when notification was sent within the last hour", () => {
    const nowMs = 1700000000000;
    // Notification sent 15 minutes ago -> 45 minutes remaining
    const lastNotified = new Date(nowMs - 15 * 60 * 1000);
    expect(getCooldownRemainingMinutes(lastNotified, nowMs)).toBe(45);

    // Notification sent 59 minutes and 10 seconds ago -> 1 minute remaining
    const lastNotified2 = new Date(nowMs - 59 * 60 * 1000 - 10 * 1000);
    expect(getCooldownRemainingMinutes(lastNotified2, nowMs)).toBe(1);
  });

  it("returns 0 when notification was sent 60+ minutes ago", () => {
    const nowMs = 1700000000000;
    const lastNotified = new Date(nowMs - 60 * 60 * 1000);
    expect(getCooldownRemainingMinutes(lastNotified, nowMs)).toBe(0);

    const oldNotified = new Date(nowMs - 2 * 60 * 60 * 1000);
    expect(getCooldownRemainingMinutes(oldNotified, nowMs)).toBe(0);
  });
});

describe("getTurnUrgencyBadgeText", () => {
  const nowMs = 1700000000000;

  it("returns null if turn is full", () => {
    const turnDate = new Date(nowMs + 30 * 60 * 1000); // 30 min away
    expect(getTurnUrgencyBadgeText(turnDate, true, nowMs)).toBeNull();
  });

  it("returns 'Urgente' when turn is less than 1 hour away and incomplete", () => {
    const turnDate = new Date(nowMs + 30 * 60 * 1000); // 30 min away
    expect(getTurnUrgencyBadgeText(turnDate, false, nowMs)).toBe("Urgente");
  });

  it("returns 'En Xh' when turn is between 1 and 3 hours away and incomplete", () => {
    const turnDate2h = new Date(nowMs + 2 * 60 * 60 * 1000); // 2 hours away
    expect(getTurnUrgencyBadgeText(turnDate2h, false, nowMs)).toBe("En 2h");
  });

  it("returns null when turn is in the past or more than 3 hours away", () => {
    const pastDate = new Date(nowMs - 10 * 60 * 1000); // 10 min in the past
    expect(getTurnUrgencyBadgeText(pastDate, false, nowMs)).toBeNull();

    const future4h = new Date(nowMs + 4 * 60 * 60 * 1000); // 4 hours away
    expect(getTurnUrgencyBadgeText(future4h, false, nowMs)).toBeNull();
  });
});

describe("getNextRadioValue", () => {
  const options = ["60", "90", "120"] as const;

  it("navigates forward with ArrowRight and ArrowDown with wrap-around", () => {
    expect(getNextRadioValue(options, "60", "ArrowRight")).toBe("90");
    expect(getNextRadioValue(options, "90", "ArrowDown")).toBe("120");
    expect(getNextRadioValue(options, "120", "ArrowRight")).toBe("60");
  });

  it("navigates backward with ArrowLeft and ArrowUp with wrap-around", () => {
    expect(getNextRadioValue(options, "120", "ArrowLeft")).toBe("90");
    expect(getNextRadioValue(options, "90", "ArrowUp")).toBe("60");
    expect(getNextRadioValue(options, "60", "ArrowLeft")).toBe("120");
  });

  it("returns null for unsupported keys", () => {
    expect(getNextRadioValue(options, "60", "Enter")).toBeNull();
    expect(getNextRadioValue(options, "60", "Tab")).toBeNull();
  });

  it("handles empty options or invalid current value safely", () => {
    expect(getNextRadioValue([], "60", "ArrowRight")).toBeNull();
    expect(getNextRadioValue(options, "invalid" as string, "ArrowRight")).toBe("60");
  });
});

describe("filterTurnsByTab", () => {
  const turns = [
    {
      id: "t1",
      creatorId: "u1",
      players: [{ userId: "u1" }, { userId: "u2" }],
      substitutes: [],
    },
    {
      id: "t2",
      creatorId: "u3",
      players: [{ userId: "u3" }, { userId: "u1" }],
      substitutes: [],
    },
    {
      id: "t3",
      creatorId: "u4",
      players: [{ userId: "u4" }, { userId: "u5" }],
      substitutes: [{ userId: "u1" }],
    },
    {
      id: "t4",
      creatorId: "u6",
      players: [{ userId: "u6" }, { userId: "u7" }],
      substitutes: [],
    },
  ];

  it("returns all turns when activeTab is 'todos'", () => {
    expect(filterTurnsByTab(turns, "todos", "u1")).toHaveLength(4);
    expect(filterTurnsByTab(turns, "todos", null)).toHaveLength(4);
  });

  it("returns empty array when activeTab is 'mis-turnos' and userId is null", () => {
    expect(filterTurnsByTab(turns, "mis-turnos", null)).toEqual([]);
  });

  it("filters turns where user is creator, player, or substitute when activeTab is 'mis-turnos'", () => {
    const myTurns = filterTurnsByTab(turns, "mis-turnos", "u1");
    expect(myTurns.map((t) => t.id)).toEqual(["t1", "t2", "t3"]);
  });

  it("excludes turns where user has no role when activeTab is 'mis-turnos'", () => {
    const myTurns = filterTurnsByTab(turns, "mis-turnos", "u2");
    expect(myTurns.map((t) => t.id)).toEqual(["t1"]);
  });
});

describe("formatSpanishNamesList", () => {
  it("returns empty string for empty array", () => {
    expect(formatSpanishNamesList([])).toBe("");
  });

  it("returns single name for 1 name", () => {
    expect(formatSpanishNamesList(["Mateo"])).toBe("Mateo");
  });

  it("formats two names with 'y'", () => {
    expect(formatSpanishNamesList(["Mateo", "Santi"])).toBe("Mateo y Santi");
  });

  it("formats three or more names with commas and 'y'", () => {
    expect(formatSpanishNamesList(["Mateo", "Santi", "Lucas"])).toBe("Mateo, Santi y Lucas");
    expect(formatSpanishNamesList(["A", "B", "C", "D"])).toBe("A, B, C y D");
  });
});

describe("formatContactPlayersSummary", () => {
  it("returns empty string for empty names", () => {
    expect(formatContactPlayersSummary([])).toBe("");
  });

  it("formats singular contact player summary", () => {
    expect(formatContactPlayersSummary(["Gonzalo"])).toBe("Juega tu contacto: Gonzalo");
  });

  it("formats plural contact players summary", () => {
    expect(formatContactPlayersSummary(["Gonzalo", "Martín"])).toBe("Juegan tus contactos: Gonzalo y Martín");
  });
});

describe("getTurnPublicSubtitle", () => {
  const compactDate = "sáb, 25 jul · 19:00hs";

  it("formats subtitle for unauthenticated viewer", () => {
    const sub = getTurnPublicSubtitle({
      viewerId: null,
      creatorName: "Facundo",
      compactDate,
    });
    expect(sub).toBe(`Te invita Facundo · ${compactDate}`);
  });

  it("formats subtitle for substitute viewer", () => {
    const sub = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isSubstitute: true,
      substituteIndex: 0,
      substitutesCount: 2,
    });
    expect(sub).toBe("Suplente #1 de 2");
  });

  it("formats subtitle for joined viewer in completed vs active turn", () => {
    const activeSub = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isJoined: true,
      isCompleted: false,
    });
    expect(activeSub).toBe(`Ya te sumaste · ${compactDate}`);

    const completedSub = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isJoined: true,
      isCompleted: true,
    });
    expect(completedSub).toBe("Turno finalizado");
  });

  it("formats subtitle for full turn for non-joined viewer", () => {
    const fullSub1 = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isFull: true,
      substitutesCount: 1,
    });
    expect(fullSub1).toBe("Turno completo · 1 suplente");

    const fullSub2 = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isFull: true,
      substitutesCount: 3,
    });
    expect(fullSub2).toBe("Turno completo · 3 suplentes");
  });

  it("formats default open turn subtitle for authenticated viewer", () => {
    const sub = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
    });
    expect(sub).toBe(`Sumate a este turno · ${compactDate}`);
  });
});

describe("isLateLeaveWarningRequired", () => {
  const baseTime = new Date("2026-09-05T12:00:00Z").getTime();

  it("returns true when turn is in 1.5 hours and user is not creator", () => {
    const turnDate = new Date("2026-09-05T13:30:00Z");
    expect(
      isLateLeaveWarningRequired({
        date: turnDate,
        isCreator: false,
        nowMs: baseTime,
      })
    ).toBe(true);
  });

  it("returns false when turn is in 3 hours", () => {
    const turnDate = new Date("2026-09-05T15:00:00Z");
    expect(
      isLateLeaveWarningRequired({
        date: turnDate,
        isCreator: false,
        nowMs: baseTime,
      })
    ).toBe(false);
  });

  it("returns false when user is turn creator", () => {
    const turnDate = new Date("2026-09-05T13:30:00Z");
    expect(
      isLateLeaveWarningRequired({
        date: turnDate,
        isCreator: true,
        nowMs: baseTime,
      })
    ).toBe(false);
  });

  it("returns false for past turn dates", () => {
    const turnDate = new Date("2026-09-05T11:00:00Z");
    expect(
      isLateLeaveWarningRequired({
        date: turnDate,
        isCreator: false,
        nowMs: baseTime,
      })
    ).toBe(false);
  });
});

describe("filterAndSortPlayerOptions", () => {
  const players = [
    { id: "p1", displayName: "Mateo", isContact: false },
    { id: "p2", displayName: "Agustín", isContact: true },
    { id: "p3", displayName: "Santiago", isContact: false },
    { id: "p4", displayName: "Lucas", isContact: true },
  ];

  it("filters out players already in existingPlayerIds", () => {
    const existing = ["p1", "p3"];
    const result = filterAndSortPlayerOptions(players, existing);
    expect(result.map((p) => p.id)).not.toContain("p1");
    expect(result.map((p) => p.id)).not.toContain("p3");
    expect(result.map((p) => p.id)).toEqual(["p2", "p4"]);
  });

  it("sorts contacts to top of results", () => {
    const existing: string[] = [];
    const result = filterAndSortPlayerOptions(players, existing);
    // p2 and p4 (contacts) should be at index 0 and 1
    expect(result[0].isContact).toBe(true);
    expect(result[1].isContact).toBe(true);
    expect(result[2].isContact).toBe(false);
    expect(result[3].isContact).toBe(false);
  });
});

describe("getAddPlayerSuccessToast and getAddPlayerAriaLabel", () => {
  it("formats success toast message in Argentine Spanish", () => {
    expect(getAddPlayerSuccessToast("Mateo")).toBe("Agregaste a Mateo al turno.");
  });

  it("formats ARIA label for adding player", () => {
    expect(getAddPlayerAriaLabel("Mateo")).toBe("Agregar a Mateo al turno");
  });

  it("formats getAddPlayerSearchStatusAriaLabel across search states", () => {
    expect(getAddPlayerSearchStatusAriaLabel({ isSearching: true })).toBe(
      "Buscando jugadores por nombre o email..."
    );
    expect(getAddPlayerSearchStatusAriaLabel({ query: "a" })).toBe(
      "Escribí al menos 2 caracteres para buscar jugadores."
    );
    expect(getAddPlayerSearchStatusAriaLabel({ query: "jo", count: 0 })).toBe(
      "No se encontraron jugadores con ese nombre o email."
    );
    expect(getAddPlayerSearchStatusAriaLabel({ query: "jo", count: 1 })).toBe(
      "Se encontraron 1 jugador."
    );
    expect(getAddPlayerSearchStatusAriaLabel({ query: "jo", count: 3 })).toBe(
      "Se encontraron 3 jugadores."
    );
  });

  it("formats prompt, empty result, and button ARIA labels for add player", () => {
    expect(getAddPlayerPromptText()).toBe("Escribí al menos 2 caracteres para buscar.");
    expect(getAddPlayerEmptyResultsText()).toBe("No se encontraron jugadores con ese nombre.");
    expect(getAddPlayerClearSearchAriaLabel()).toBe("Limpiar búsqueda de jugador");
    expect(getAddPlayerCancelSearchAriaLabel()).toBe("Cancelar búsqueda de jugador");
  });
});

describe("validateTurnFormData", () => {
  const nowMs = new Date("2026-09-10T12:00:00Z").getTime();

  it("returns error when club, date, or time is empty", () => {
    expect(
      validateTurnFormData({ club: "", date: "2026-09-10", time: "18:00" }, nowMs)
    ).toEqual({ valid: false, error: "Completá club, fecha y hora" });

    expect(
      validateTurnFormData({ club: "  ", date: "2026-09-10", time: "18:00" }, nowMs)
    ).toEqual({ valid: false, error: "Completá club, fecha y hora" });

    expect(
      validateTurnFormData({ club: "Club Padel", date: "", time: "18:00" }, nowMs)
    ).toEqual({ valid: false, error: "Completá club, fecha y hora" });

    expect(
      validateTurnFormData({ club: "Club Padel", date: "2026-09-10", time: "" }, nowMs)
    ).toEqual({ valid: false, error: "Completá club, fecha y hora" });
  });

  it("returns error when combined datetime is in the past", () => {
    const result = validateTurnFormData(
      { club: "Central Padel", date: "2026-09-10", time: "10:00" },
      nowMs
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("pasado");
  });

  it("returns valid true and combinedDate when datetime is in the future", () => {
    const result = validateTurnFormData(
      { club: "Central Padel", date: "2026-09-10", time: "19:00" },
      nowMs
    );
    expect(result.valid).toBe(true);
    expect(result.combinedDate).toBeInstanceOf(Date);
  });
});

describe("getNewTurnWhatsAppShareUrl", () => {
  it("formats WhatsApp share URL with natural share text and turn URL", () => {
    const date = new Date("2026-09-15T19:00:00Z");
    const url = getNewTurnWhatsAppShareUrl({
      club: "Central Padel",
      date,
      turnId: "t123",
      origin: "https://padelred.app",
    });

    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("Central Padel"));
    expect(url).toContain(encodeURIComponent("https://padelred.app/t/t123"));
  });
});

describe("formatTurnSalvageCalloutAriaLabel", () => {
  it("returns empty string when no slots are open", () => {
    expect(formatTurnSalvageCalloutAriaLabel({ club: "Central Padel", openSlots: 0 })).toBe("");
    expect(formatTurnSalvageCalloutAriaLabel({ club: "Central Padel", openSlots: -1 })).toBe("");
  });

  it("formats callout ARIA label for 1 open slot", () => {
    const label = formatTurnSalvageCalloutAriaLabel({ club: "Central Padel", openSlots: 1 });
    expect(label).toBe("Aviso de salvataje: Falta 1 jugador para completar este turno en Central Padel.");
  });

  it("formats callout ARIA label for multiple open slots", () => {
    const label = formatTurnSalvageCalloutAriaLabel({ club: "El Balcón", openSlots: 2 });
    expect(label).toBe("Aviso de salvataje: Faltan 2 jugadores para completar este turno en El Balcón.");
  });
});

describe("formatTurnProgressPercentage and formatTurnProgressAriaLabel", () => {
  it("calculates progress percentage correctly bounded between 0 and 100", () => {
    expect(formatTurnProgressPercentage(0, 4)).toBe(0);
    expect(formatTurnProgressPercentage(2, 4)).toBe(50);
    expect(formatTurnProgressPercentage(3, 4)).toBe(75);
    expect(formatTurnProgressPercentage(4, 4)).toBe(100);
    expect(formatTurnProgressPercentage(5, 4)).toBe(100);
    expect(formatTurnProgressPercentage(0, 0)).toBe(0);
  });

  it("formats enrollment progress bar ARIA label", () => {
    expect(formatTurnProgressAriaLabel(3, 4)).toBe(
      "Progreso de inscripción: 3 de 4 jugadores (75% completado)"
    );
    expect(formatTurnProgressAriaLabel(4, 4)).toBe(
      "Progreso de inscripción: 4 de 4 jugadores (100% completado)"
    );
  });
});

describe("Turn public details and organizer actions pure styling helpers batch", () => {
  it("returns correct CSS classes for turn public details container layouts and cards", () => {
    expect(getTurnPublicDetailsContainerClasses()).toBe("flex flex-col gap-6");
    expect(getTurnPublicDetailsHeaderContainerClasses()).toBe("flex flex-col gap-4");
    expect(getTurnPublicDetailsGridDividerClasses()).toBe("grid grid-cols-1 gap-px bg-border");
    expect(getTurnPublicDetailsTimeCardClasses()).toBe("bg-card p-4 flex flex-col gap-1");
    expect(getTurnPublicDetailsLocationCardClasses()).toBe("bg-card p-4 flex items-center gap-4 border-t border-border");
    expect(getTurnPublicDetailsLocationIconBadgeClasses()).toBe("flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary shrink-0");
    expect(getTurnPublicDetailsSlotsProgressCardClasses()).toBe("bg-card p-4 border-t border-border flex flex-col gap-2");
    expect(getTurnPublicDetailsCalendarContainerClasses()).toBe("p-4 border-t border-border bg-card");
    expect(getTurnPublicDetailsEnrolledSectionClasses()).toBe("space-y-4");
    expect(getTurnPublicDetailsEnrolledHeaderClasses()).toBe("flex items-center justify-between");
    expect(getTurnPublicDetailsSuggestedSectionClasses()).toBe("space-y-4");
    expect(getTurnPublicDetailsSuggestedHeaderClasses()).toBe("flex items-center justify-between");
  });

  it("returns correct CSS classes for organizer action region wrappers", () => {
    expect(getRemovePlayerRegionContainerClasses()).toBe("inline-flex items-center");
    expect(getRemovePlayerConfirmRegionClasses()).toBe("inline-flex items-center gap-1.5 focus-visible:outline-none");
    expect(getAssignSubstituteRegionContainerClasses()).toBe("inline-flex items-center");
  });
});

describe("turn filter pure styling helpers", () => {
  it("returns correct CSS classes for turn filter components", () => {
    expect(getTurnFilterContainerClasses()).toBe("flex flex-col gap-4");
    expect(getTurnFilterRadiogroupClasses()).toBe("grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl shadow-xs border border-border");
    expect(getTurnFilterHeaderContainerClasses()).toBe("flex items-center justify-between");
    expect(getTurnFilterHeaderTitleClasses()).toBe("text-sm font-bold text-foreground");
    expect(getTurnFilterBadgeClasses()).toBe("rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground");
    expect(getTurnFilterPrimaryButtonClasses()).toContain("w-full h-12 rounded-lg font-bold");
    expect(getTurnFilterOutlineButtonClasses()).toContain("w-full h-12 rounded-lg font-bold");
  });
});

describe("add-to-calendar pure styling helpers", () => {
  it("returns correct CSS classes for calendar trigger button when closed", () => {
    const classes = getCalendarTriggerButtonClasses(false);
    expect(classes).toContain("w-full h-10 font-bold");
    expect(classes).not.toContain("border-primary text-primary bg-muted");
  });

  it("returns correct CSS classes for calendar trigger button when open", () => {
    const classes = getCalendarTriggerButtonClasses(true);
    expect(classes).toContain("border-primary text-primary bg-muted");
  });

  it("returns correct CSS classes for calendar options container and buttons", () => {
    expect(getCalendarOptionsContainerClasses()).toBe("mt-2 p-3 bg-muted border border-border rounded-lg flex flex-col gap-2 transition-all duration-150 shadow-xs");
    expect(getCalendarOptionButtonClasses()).toBe("h-9 font-bold bg-card border border-border hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background");
  });
});

describe("leave turn full share button pure styling helper", () => {
  it("returns correct CSS classes for share button when turn was full", () => {
    expect(getLeaveTurnWasFullShareButtonClasses()).toBe("w-full h-10 rounded-lg text-xs font-bold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all");
  });
});

describe("turn card pure styling helpers", () => {
  it("returns correct CSS classes for turn card layout elements", () => {
    expect(getTurnCardActionsContainerClasses()).toBe("relative z-10 flex items-stretch gap-2");
    expect(getTurnCardHeaderContainerClasses()).toBe("flex items-center gap-3");
    expect(getTurnCardContentContainerClasses()).toBe("flex-1 overflow-hidden");
    expect(getTurnCardTitleContainerClasses()).toBe("flex items-center gap-2");
    expect(getTurnCardClubTitleClasses()).toBe("truncate text-sm font-semibold text-foreground");
    expect(getTurnCardMetaContainerClasses()).toBe("mt-1 flex items-center gap-3 text-xs text-muted-foreground");
    expect(getTurnCardMetaItemClasses()).toBe("flex items-center gap-1");
    expect(getTurnCardSubstitutesTextClasses()).toBe("text-muted-foreground/70");
    expect(getTurnCardContactDotClasses()).toBe("h-1.5 w-1.5 rounded-full bg-primary shrink-0");
    expect(getTurnCardStatusBadgeContainerClasses()).toBe("shrink-0");
    expect(getTurnCardSalvageWrapperClasses()).toBe("flex-1");
    expect(getTurnCardShareButtonClasses()).toBe("flex-1");
  });
});

describe("Turn form pure styling helpers", () => {
  it("formats getTurnFormContainerClasses, getTurnFormHeaderBackLinkClasses, getTurnFormHeaderTitleClasses, and getTurnFormHeaderDescriptionClasses", () => {
    expect(getTurnFormContainerClasses()).toBe("flex flex-col gap-6");
    expect(getTurnFormHeaderBackLinkClasses()).toContain("h-10 w-10");
    expect(getTurnFormHeaderBackLinkClasses()).toContain("active:scale-[0.98]");
    expect(getTurnFormHeaderTitleClasses()).toContain("text-xl font-bold");
    expect(getTurnFormHeaderDescriptionClasses()).toContain("text-sm text-muted-foreground");
  });

  it("formats getTurnFormCardClasses, getTurnFormCardHeaderClasses, getTurnFormCardHeaderTitleClasses, getTurnFormCardContentClasses, getTurnFormGroupClasses, and getTurnFormLabelClasses", () => {
    expect(getTurnFormCardClasses()).toContain("rounded-xl border border-border bg-card shadow-xs");
    expect(getTurnFormCardHeaderClasses()).toContain("p-4 border-b border-border");
    expect(getTurnFormCardHeaderTitleClasses()).toContain("text-sm font-bold text-foreground");
    expect(getTurnFormCardContentClasses()).toContain("p-6 flex flex-col gap-6");
    expect(getTurnFormGroupClasses()).toBe("flex flex-col gap-1.5");
    expect(getTurnFormLabelClasses()).toBe("text-sm font-semibold text-foreground");
  });

  it("formats getTurnFormDurationRadioClasses and getTurnFormPlayerRadioClasses across selected and unselected states", () => {
    const selectedDuration = getTurnFormDurationRadioClasses(true);
    expect(selectedDuration).toContain("bg-primary");
    expect(selectedDuration).toContain("text-primary-foreground");

    const unselectedDuration = getTurnFormDurationRadioClasses(false);
    expect(unselectedDuration).toContain("bg-card");
    expect(unselectedDuration).toContain("text-muted-foreground");

    const selectedPlayer = getTurnFormPlayerRadioClasses(true);
    expect(selectedPlayer).toContain("bg-primary");
    expect(selectedPlayer).toContain("justify-between");

    const unselectedPlayer = getTurnFormPlayerRadioClasses(false);
    expect(unselectedPlayer).toContain("bg-card");
    expect(unselectedPlayer).toContain("justify-between");
  });

  it("formats getTurnFormTextareaClasses and getTurnFormSubmitButtonClasses", () => {
    expect(getTurnFormTextareaClasses()).toBe("min-h-[100px] rounded-lg resize-none");
    expect(getTurnFormSubmitButtonClasses()).toContain("w-full h-12 rounded-lg font-bold");
    expect(getTurnFormSubmitButtonClasses()).toContain("active:scale-[0.98]");
  });
});

describe("AddPlayerButton pure styling helpers", () => {
  it("returns expected CSS classes for AddPlayerButton elements", () => {
    expect(getAddPlayerTriggerButtonClasses()).toContain("border-dashed");
    expect(getAddPlayerTriggerIconBadgeClasses()).toContain("text-primary");
    expect(getAddPlayerCardContainerClasses()).toContain("shadow-xs");
    expect(getAddPlayerSearchHeaderClasses()).toContain("border-b");
    expect(getAddPlayerSearchInputClasses()).toContain("pl-9");
    expect(getAddPlayerSearchClearButtonClasses()).toContain("absolute right-3");
    expect(getAddPlayerSearchCancelButtonClasses()).toContain("p-2");
    expect(getAddPlayerSearchResultItemClasses()).toContain("disabled:opacity-50");
  });
});

describe("getTurnPublicDetailsShareButtonAriaLabel", () => {
  it("returns specific aria label when open slots and club are provided", () => {
    expect(
      getTurnPublicDetailsShareButtonAriaLabel(2, "Club Balcón")
    ).toBe("Compartir invitación para salvar turno en Club Balcón (2 cupos libres)");
    expect(
      getTurnPublicDetailsShareButtonAriaLabel(1, "Padel Norte")
    ).toBe("Compartir invitación para salvar turno en Padel Norte (1 cupo libre)");
  });

  it("returns fallback aria label when open slots is 0 or club is omitted", () => {
    expect(getTurnPublicDetailsShareButtonAriaLabel(0, "Club Balcón")).toBe(
      "Compartir detalles del turno en Club Balcón"
    );
    expect(getTurnPublicDetailsShareButtonAriaLabel()).toBe("Compartir turno");
  });
});

describe("getTurnPublicDetailsErrorFallbackProps", () => {
  it("returns formatted props for 'los turnos' section", () => {
    const props = getTurnPublicDetailsErrorFallbackProps("los turnos");
    expect(props.regionAriaLabel).toBe("Error al cargar los turnos");
    expect(props.title).toBe("No pudimos cargar los turnos");
    expect(props.message).toContain("Ocurrió un problema al obtener los turnos");
    expect(props.retryAriaLabel).toBe("Reintentar cargar los turnos");
    expect(props.homeAriaLabel).toBe("Volver a la página principal");
    expect(props.homeDestinationLabel).toBe("inicio");
    expect(props.homeHref).toBe("/me");
  });

  it("returns formatted props for 'el turno' section", () => {
    const props = getTurnPublicDetailsErrorFallbackProps("el turno");
    expect(props.regionAriaLabel).toBe("Error al cargar el turno");
    expect(props.title).toBe("No pudimos cargar el turno");
    expect(props.message).toContain("Es posible que el turno haya sido eliminado");
    expect(props.retryAriaLabel).toBe("Reintentar cargar el turno");
    expect(props.homeAriaLabel).toBe("Volver a explorar turnos");
    expect(props.homeDestinationLabel).toBe("explorar turnos");
    expect(props.homeHref).toBe("/turnos");
  });
});

describe("getTurnPublicDetailsEmptySlotsProps", () => {
  it("formats empty slot properties correctly for single and multiple slots", () => {
    const singleProps = getTurnPublicDetailsEmptySlotsProps(1);
    expect(singleProps.text).toBe("Cupo disponible");
    expect(singleProps.ariaLabel).toBe("Cupo libre disponible para unirse");
    expect(singleProps.keyPrefix).toBe("empty-slot");

    const multiProps = getTurnPublicDetailsEmptySlotsProps(3);
    expect(multiProps.ariaLabel).toBe("3 cupos libres disponibles para unirse");
  });
});

describe("getIcsDownloadFilename", () => {
  it("formats iCal filename with turn ID", () => {
    expect(getIcsDownloadFilename("turn-123")).toBe("partido-padel-turn-123.ics");
  });
});

describe("getAddPlayerInputLabelText", () => {
  it("returns search input screen reader label text", () => {
    expect(getAddPlayerInputLabelText()).toBe("Buscar jugador por nombre o email");
  });
});

describe("TurnCard and WhatsApp invite button CSS class pure helpers", () => {
  it("formats getTurnCardDateContainerClasses and getTurnCardContactPlayersClasses", () => {
    expect(getTurnCardDateContainerClasses()).toContain("bg-muted");
    expect(getTurnCardDateContainerClasses()).toContain("min-w-[56px]");

    expect(getTurnCardContactPlayersClasses()).toContain("text-amber-600");
    expect(getTurnCardContactPlayersClasses()).toContain("font-semibold");
  });

  it("formats getTurnCardOpenSlotsBadgeClasses across 1 and multiple open slots", () => {
    const singleSlot = getTurnCardOpenSlotsBadgeClasses(1);
    expect(singleSlot).toContain("bg-amber-100");
    expect(singleSlot).toContain("font-bold");

    const multiSlot = getTurnCardOpenSlotsBadgeClasses(2);
    expect(multiSlot).toContain("bg-muted");
    expect(multiSlot).toContain("border-border");
  });

  it("formats getTurnCardQuickJoinButtonClasses", () => {
    const classes = getTurnCardQuickJoinButtonClasses();
    expect(classes).toContain("bg-primary");
    expect(classes).toContain("active:scale-[0.98]");
  });

  it("formats getWhatsAppInviteButtonClasses and getWhatsAppGroupInviteButtonClasses", () => {
    expect(getWhatsAppInviteButtonClasses()).toContain("bg-emerald-600");
    expect(getWhatsAppInviteButtonClasses()).toContain("shadow-xs");
    expect(getWhatsAppInviteIconClasses()).toBe("h-3.5 w-3.5 fill-current");

    const groupClasses = getWhatsAppGroupInviteButtonClasses("bg-amber-600 text-white", "custom-class");
    expect(groupClasses).toContain("bg-amber-600");
    expect(groupClasses).toContain("custom-class");
    expect(groupClasses).toContain("active:scale-[0.98]");
  });
});

describe("Compact date, edit button & container pure helpers batch", () => {
  it("formats formatTurnCompactDate across Date and string inputs", () => {
    const testDate = new Date("2026-09-20T19:00:00.000Z");
    const compactStr = formatTurnCompactDate(testDate);
    expect(compactStr).toContain("dom");
    expect(compactStr).toContain("20");
    expect(compactStr).toContain("·");

    expect(formatTurnCompactDate("invalid-date")).toBe("");
  });

  it("formats getTurnEditButtonText and getTurnEditButtonAriaLabel", () => {
    expect(getTurnEditButtonText()).toBe("Editar");
    expect(getTurnEditButtonAriaLabel("Central Padel")).toBe("Editar detalles del turno en Central Padel");
  });

  it("formats getTurnActionsEditButtonClasses, getTurnActionsSubstituteNoSlotsClasses, getTurnActionsCompletedButtonClasses, getTurnActionsAlreadyJoinedButtonClasses, and getTurnActionsContainerClasses", () => {
    expect(getTurnActionsEditButtonClasses()).toContain("flex-1 h-10 rounded-lg");
    expect(getTurnActionsSubstituteNoSlotsClasses()).toContain("w-full h-12 rounded-lg");
    expect(getTurnActionsCompletedButtonClasses()).toContain("w-full h-12 rounded-lg");
    expect(getTurnActionsAlreadyJoinedButtonClasses()).toContain("w-full h-12 rounded-lg");
    expect(getTurnActionsContainerClasses()).toContain("fixed bottom-0 left-0 right-0");
  });

  it("formats getTurnCancelledHeaderProps and getTurnSuggestedContactsHeaderProps", () => {
    const cancelledProps = getTurnCancelledHeaderProps();
    expect(cancelledProps.title).toBe("Turno cancelado");
    expect(cancelledProps.description).toBe("Este turno ha sido cancelado por el organizador.");
    expect(cancelledProps.buttonLabel).toBe("Ver otros turnos");

    const suggestedProps = getTurnSuggestedContactsHeaderProps();
    expect(suggestedProps.title).toBe("Sugeridos para invitar 🧠");
    expect(suggestedProps.subtitle).toBe("De tu red de contactos");
  });
});

describe("turn navigation and form option label pure helpers", () => {
  it("formats getTurnBackButtonAriaLabel and getTurnCreateButtonText", () => {
    expect(getTurnBackButtonAriaLabel()).toBe("Volver");
    expect(getTurnCreateButtonText()).toBe("Crear");
  });

  it("formats formatDurationOptionLabel across numeric and string inputs", () => {
    expect(formatDurationOptionLabel(60)).toBe("60 min");
    expect(formatDurationOptionLabel("90")).toBe("90 min");
    expect(formatDurationOptionLabel(120)).toBe("120 min");
  });

  it("formats formatPlayerOptionLabel across singular and plural player counts", () => {
    expect(formatPlayerOptionLabel(1)).toBe("1 jugador");
    expect(formatPlayerOptionLabel(4)).toBe("4 jugadores");
    expect(formatPlayerOptionLabel("6")).toBe("6 jugadores");
    expect(formatPlayerOptionLabel(8)).toBe("8 jugadores");
    expect(formatPlayerOptionLabel("10")).toBe("10 jugadores");
  });
});

describe("leave turn button text & share props pure helpers", () => {
  it("formats getLeaveTurnTriggerButtonText, getConfirmLeaveButtonText, and getLeaveTurnCancelButtonText", () => {
    expect(getLeaveTurnTriggerButtonText()).toBe("Bajarme del turno");
    expect(getConfirmLeaveButtonText(false)).toBe("Confirmar baja");
    expect(getConfirmLeaveButtonText(true)).toBe("Bajando...");
    expect(getConfirmLeaveButtonText()).toBe("Confirmar baja");
    expect(getLeaveTurnCancelButtonText()).toBe("Cancelar");
  });

  it("formats getWasFullShareTitle and getWasFullShareText", () => {
    expect(getWasFullShareTitle()).toBe("Sumate al Turno");
    expect(getWasFullShareText("Central Padel")).toBe("Se liberó un cupo en Central Padel");
  });
});

describe("variant and filter tab CSS class pure helpers", () => {
  it("formats getWhatsAppGroupInviteVariantClasses across amber, outline, and default variants", () => {
    expect(getWhatsAppGroupInviteVariantClasses("amber")).toContain("bg-amber-600");
    expect(getWhatsAppGroupInviteVariantClasses("outline")).toContain("border border-border");
    expect(getWhatsAppGroupInviteVariantClasses("default")).toContain("bg-emerald-600");
    expect(getWhatsAppGroupInviteVariantClasses()).toContain("bg-emerald-600");
  });

  it("formats getTurnFilterTabClasses across selected and idle states", () => {
    const selectedClasses = getTurnFilterTabClasses(true);
    expect(selectedClasses).toContain("bg-card");
    expect(selectedClasses).toContain("font-bold");

    const idleClasses = getTurnFilterTabClasses(false);
    expect(idleClasses).toContain("border-transparent");
    expect(idleClasses).toContain("text-muted-foreground");
  });
});

describe("TurnShareButton and detail view pure helpers batch", () => {
  it("formats getTurnShareTitle and getTurnShareButtonClasses", () => {
    expect(getTurnShareTitle()).toBe("Sumate al Turno");
    expect(getTurnShareButtonClasses("full")).toBe("w-full h-12 rounded-lg text-base font-bold");
    expect(getTurnShareButtonClasses("icon", "custom-class")).toBe("custom-class");
  });

  it("formats getTurnSalvageBannerBadgeText, getTurnTimeLabel, getTurnCoveredSlotsLabel, getTurnNotesTitle, getTurnOrganizerBadgeText, and getTurnYouBadgeText", () => {
    expect(getTurnSalvageBannerBadgeText()).toBe("Salvataje de turno");
    expect(getTurnTimeLabel()).toBe("Horario");
    expect(getTurnCoveredSlotsLabel()).toBe("Cupos cubiertos");
    expect(getTurnNotesTitle()).toBe("Notas del organizador");
    expect(getTurnOrganizerBadgeText()).toBe("Organizador");
    expect(getTurnYouBadgeText()).toBe("Vos");
  });

  it("formats getTurnCoveredSlotsText and getTurnOpenSlotsBadgeText across slot counts", () => {
    expect(getTurnCoveredSlotsText(3, 4)).toBe("3 de 4");
    expect(getTurnCoveredSlotsText(4, 4)).toBe("4 de 4");
    expect(getTurnOpenSlotsBadgeText(1)).toBe("1 cupo libre");
    expect(getTurnOpenSlotsBadgeText(2)).toBe("2 cupos libres");
  });
});

describe("turn form & detail pure helpers", () => {
  it("returns static turn form label and placeholder strings", () => {
    expect(getTurnFormDetailsHeaderTitle()).toBe("Detalles del partido");
    expect(getTurnFormClubLabel()).toBe("Club y cancha");
    expect(getTurnFormClubPlaceholder()).toBe("Ej: Padel City · Cancha 3");
    expect(getTurnFormDateLabel()).toBe("Fecha");
    expect(getTurnFormTimeLabel()).toBe("Hora");
    expect(getTurnFormDurationLabel()).toBe("Duración");
    expect(getTurnFormDurationTurnLabel()).toBe("Duración del turno");
    expect(getTurnFormPlayersLabel()).toBe("Cupos totales");
    expect(getTurnFormNotesLabel()).toBe("Notas adicionales");
  });

  it("returns mode-appropriate notes placeholder", () => {
    expect(getTurnFormNotesPlaceholder("create")).toBe(
      "Ej: Traer pelotas nuevas. Punto de encuentro en recepción."
    );
    expect(getTurnFormNotesPlaceholder("edit")).toBe("Ej: Traer pelotas nuevas...");
  });

  it("returns state-driven submit button text for create and edit modes", () => {
    expect(getTurnFormSubmitButtonText("create", false)).toBe("Crear turno y compartir link");
    expect(getTurnFormSubmitButtonText("create", true)).toBe("Creando...");
    expect(getTurnFormSubmitButtonText("edit", false)).toBe("Guardar cambios");
    expect(getTurnFormSubmitButtonText("edit", true)).toBe("Actualizando...");
  });

  it("formats turn detail accessibility ARIA labels", () => {
    expect(getTurnUrgencyBadgeAriaLabel("Quedan 2hs")).toBe("Urgencia: Quedan 2hs");
    expect(getTurnContactProfileLinkAriaLabel("Lucas")).toBe("Ver perfil público de Lucas");
    expect(getTurnContactCompatibilityAriaLabel("Lucas", "Alta", "Mismo nivel e historial reciente")).toBe(
      "Compatibilidad de Lucas con el turno: Alta. Mismo nivel e historial reciente"
    );
    expect(getTurnContactCompatibilityAriaLabel("Lucas", "Media", null)).toBe(
      "Compatibilidad de Lucas con el turno: Media."
    );
    expect(getTurnContactBadgeAriaLabel("Contacto frecuente")).toBe("Contacto frecuente");
  });
});

describe("TurnCard pure helpers batch", () => {
  it("formats getTodayBadgeText and getTomorrowBadgeText", () => {
    expect(getTodayBadgeText()).toBe("Hoy");
    expect(getTomorrowBadgeText()).toBe("Mañana");
  });

  it("formats getTurnCardShareTitle and getTurnCardSalvageLabel", () => {
    expect(getTurnCardShareTitle()).toBe("Sumate al Turno");
    expect(getTurnCardSalvageLabel()).toBe("Salvar turno");
  });

  it("formats getTurnCardQuickJoinText across idle, pending, and substitute states", () => {
    expect(getTurnCardQuickJoinText({})).toBe("Sumarme");
    expect(getTurnCardQuickJoinText({ isSubstitute: true })).toBe("Suplente");
    expect(getTurnCardQuickJoinText({ isPending: true })).toBe("Sumando...");
    expect(getTurnCardQuickJoinText({ isSubstitute: true, isPending: true })).toBe("Sumando...");
  });

  it("formats getTurnCardStatusBadgeText across roles and slot states", () => {
    expect(getTurnCardStatusBadgeText({ isCreator: true })).toBe("Organizador");
    expect(getTurnCardStatusBadgeText({ isSubstitute: true })).toBe("Suplente");
    expect(getTurnCardStatusBadgeText({ isJoined: true })).toBe("Inscripto");
    expect(getTurnCardStatusBadgeText({ isFull: true })).toBe("Completo");
    expect(getTurnCardStatusBadgeText({ openSlots: 1 })).toBe("Falta 1");
    expect(getTurnCardStatusBadgeText({ openSlots: 2 })).toBe("Faltan 2");
    expect(getTurnCardStatusBadgeText({ openSlots: 0 })).toBeNull();
  });

  it("formats getTurnCardContainerClasses across recommended and pending variants", () => {
    const defaultClasses = getTurnCardContainerClasses({});
    expect(defaultClasses).toContain("rounded-xl");
    expect(defaultClasses).not.toContain("border-primary");
    expect(defaultClasses).not.toContain("opacity-70");

    const recommendedClasses = getTurnCardContainerClasses({ isRecommended: true });
    expect(recommendedClasses).toContain("border-primary");

    const pendingClasses = getTurnCardContainerClasses({ isPending: true });
    expect(pendingClasses).toContain("opacity-70");
  });
});

describe("getLeaveSubstituteButtonText & getQuickJoinEmptySlotButtonText", () => {
  it("formats getLeaveSubstituteButtonText across pending, open slots, and default states", () => {
    expect(getLeaveSubstituteButtonText({ isPending: true })).toBe("Saliendo...");
    expect(getLeaveSubstituteButtonText({ isPending: true, hasOpenSlot: true })).toBe("Saliendo...");
    expect(getLeaveSubstituteButtonText({ isPending: false, hasOpenSlot: true })).toBe("No puedo — salir de suplentes");
    expect(getLeaveSubstituteButtonText({ isPending: false, hasOpenSlot: false })).toBe("Salir de suplentes");
    expect(getLeaveSubstituteButtonText()).toBe("Salir de suplentes");
  });

  it("formats getQuickJoinEmptySlotButtonText across pending and idle states", () => {
    expect(getQuickJoinEmptySlotButtonText(true)).toBe("Sumando...");
    expect(getQuickJoinEmptySlotButtonText(false)).toBe("Sumarme");
    expect(getQuickJoinEmptySlotButtonText()).toBe("Sumarme");
  });
});

describe("Turn actions button text pure helpers", () => {
  it("formats getCancelTurnButtonText and getCancelTurnConfirmButtonText", () => {
    expect(getCancelTurnButtonText()).toBe("Eliminar");
    expect(getCancelTurnConfirmButtonText(false)).toBe("Confirmar");
    expect(getCancelTurnConfirmButtonText(true)).toBe("Eliminando...");
    expect(getCancelTurnConfirmButtonText()).toBe("Confirmar");
  });

  it("formats getStartMatchButtonText across idle and pending states", () => {
    expect(getStartMatchButtonText(false)).toBe("Iniciar partido");
    expect(getStartMatchButtonText(true)).toBe("Iniciando...");
    expect(getStartMatchButtonText()).toBe("Iniciar partido");
  });

  it("formats getJoinTurnButtonText across idle and pending states", () => {
    expect(getJoinTurnButtonText(false)).toBe("Sumarme ahora");
    expect(getJoinTurnButtonText(true)).toBe("Sumando...");
    expect(getJoinTurnButtonText()).toBe("Sumarme ahora");
  });

  it("formats getJoinSubstituteButtonText across idle and pending states", () => {
    expect(getJoinSubstituteButtonText(false)).toBe("Sumarme como suplente");
    expect(getJoinSubstituteButtonText(true)).toBe("Sumando...");
    expect(getJoinSubstituteButtonText()).toBe("Sumarme como suplente");
  });

  it("formats getTakeOpenSlotButtonText across idle and pending states", () => {
    expect(getTakeOpenSlotButtonText(false)).toBe("Ocupar cupo");
    expect(getTakeOpenSlotButtonText(true)).toBe("Ocupando...");
    expect(getTakeOpenSlotButtonText()).toBe("Ocupar cupo");
  });

  it("formats getScheduleNextTurnButtonText across idle and pending states", () => {
    expect(getScheduleNextTurnButtonText(false)).toBe("Programar próximo turno");
    expect(getScheduleNextTurnButtonText(true)).toBe("Programando...");
    expect(getScheduleNextTurnButtonText()).toBe("Programar próximo turno");
  });

  it("formats getPlayCasualButtonText, getPlayCasualCancelButtonText, and getPlayCasualConfirmButtonText", () => {
    expect(getPlayCasualButtonText()).toBe("Jugar igual");
    expect(getPlayCasualCancelButtonText()).toBe("Cancelar");
    expect(getPlayCasualConfirmButtonText(false)).toBe("Confirmar");
    expect(getPlayCasualConfirmButtonText(true)).toBe("Marcando...");
    expect(getPlayCasualConfirmButtonText()).toBe("Confirmar");
  });
});

describe("Turn action UI button and container CSS class pure helpers", () => {
  it("formats leave turn button and card CSS class helpers", () => {
    expect(getLeaveTurnTriggerButtonClasses()).toContain("w-full h-10 rounded-lg");
    expect(getLeaveTurnTriggerButtonClasses()).toContain("text-destructive");
    expect(getLeaveTurnLateLeaveCardClasses()).toContain("border-destructive");
    expect(getLeaveTurnWasFullCardClasses()).toContain("border-border");
    expect(getLeaveTurnCancelButtonClasses()).toContain("flex-1 h-10 rounded-lg");
    expect(getLeaveTurnConfirmButtonClasses()).toContain("bg-destructive/10");
  });

  it("formats remove player and assign substitute CSS class helpers", () => {
    expect(getRemovePlayerTriggerButtonClasses()).toContain("hover:text-destructive");
    expect(getRemovePlayerConfirmButtonClasses()).toContain("bg-destructive");
    expect(getRemovePlayerDismissButtonClasses()).toContain("hover:text-foreground");
    expect(getAssignSubstituteButtonClasses()).toContain("bg-primary");
  });

  it("formats turn action form trigger and confirmation CSS class helpers", () => {
    expect(getCancelTurnTriggerButtonClasses()).toContain("text-destructive");
    expect(getCancelTurnConfirmContainerClasses()).toContain("flex-1 flex items-center");
    expect(getCancelTurnDismissButtonClasses()).toContain("px-2 rounded-lg");
    expect(getCancelTurnConfirmButtonClasses()).toContain("border-destructive/20");

    expect(getStartMatchButtonClasses()).toContain("bg-emerald-600");
    expect(getJoinTurnButtonClasses()).toContain("w-full h-12 rounded-lg");
    expect(getJoinSubstituteButtonClasses()).toContain("border-primary text-primary");
    expect(getLeaveSubstituteTriggerButtonClasses()).toContain("text-destructive");
    expect(getTakeOpenSlotButtonClasses()).toContain("bg-emerald-600");
    expect(getScheduleNextTurnButtonClasses()).toContain("w-full h-10 rounded-lg");

    expect(getPlayCasualTriggerButtonClasses()).toContain("w-full h-12 rounded-lg");
    expect(getPlayCasualConfirmContainerClasses()).toContain("flex flex-col gap-2");
    expect(getPlayCasualCancelButtonClasses()).toContain("flex-1 h-10 rounded-lg");
    expect(getPlayCasualConfirmButtonClasses()).toContain("bg-emerald-600");
    expect(getQuickJoinEmptySlotButtonClasses()).toContain("border-primary text-primary hover:bg-primary/10");
  });
});

describe("Turn pages and skeleton pure layout styling helpers batch", () => {
  it("formats getTurnsPageContainerClasses and getTurnsPageHeaderClasses", () => {
    expect(getTurnsPageContainerClasses()).toBe("flex flex-col gap-6");
    expect(getTurnsPageHeaderClasses()).toBe("flex items-center justify-between");
  });

  it("formats getTurnsListSkeletonContainerClasses, getTurnsListSkeletonTabGridClasses, getTurnsListSkeletonHeaderClasses, and getTurnsListSkeletonCardListClasses", () => {
    expect(getTurnsListSkeletonContainerClasses()).toBe("flex flex-col gap-3");
    expect(getTurnsListSkeletonTabGridClasses()).toBe("grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl");
    expect(getTurnsListSkeletonHeaderClasses()).toBe("flex items-center justify-between");
    expect(getTurnsListSkeletonCardListClasses()).toBe("flex flex-col gap-2");
  });

  it("formats getTurnosLoadingContainerClasses", () => {
    expect(getTurnosLoadingContainerClasses()).toBe("flex flex-col gap-6");
  });

  it("formats getTurnEditPageContainerClasses, getTurnEditSkeletonContainerClasses, getTurnEditSkeletonHeaderClasses, getTurnEditSkeletonCardClasses, getTurnEditSkeletonCardHeaderClasses, and getTurnEditSkeletonCardBodyClasses", () => {
    expect(getTurnEditPageContainerClasses()).toBe("flex flex-col gap-6 pb-20");
    expect(getTurnEditSkeletonContainerClasses()).toBe("flex flex-col gap-6");
    expect(getTurnEditSkeletonHeaderClasses()).toBe("flex items-center gap-4");
    expect(getTurnEditSkeletonCardClasses()).toBe("rounded-xl border border-border bg-card");
    expect(getTurnEditSkeletonCardHeaderClasses()).toBe("p-4 border-b border-border");
    expect(getTurnEditSkeletonCardBodyClasses()).toBe("p-6 flex flex-col gap-6");
  });

  it("formats getTurnPublicPageMainClasses", () => {
    expect(getTurnPublicPageMainClasses()).toBe(
      "mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-40"
    );
  });

  it("formats getTurnSkeletonContainerClasses, getTurnSkeletonHeaderClasses, getTurnSkeletonCardClasses, getTurnSkeletonCardHeaderClasses, getTurnSkeletonGridClasses, and getTurnSkeletonBottomBarClasses", () => {
    expect(getTurnSkeletonContainerClasses()).toBe("flex flex-col gap-6");
    expect(getTurnSkeletonHeaderClasses()).toBe("flex items-center gap-4");
    expect(getTurnSkeletonCardClasses()).toBe("rounded-xl border border-border bg-card overflow-hidden");
    expect(getTurnSkeletonCardHeaderClasses()).toBe("bg-muted border-b border-border px-4 py-3");
    expect(getTurnSkeletonGridClasses()).toBe("grid grid-cols-1 gap-px bg-border");
    expect(getTurnSkeletonBottomBarClasses()).toBe(
      "fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border z-50"
    );
  });
});

describe("Turn public details, actions and skeleton pure styling helpers", () => {
  it("formats cancelled button and empty slot pure styling helpers", () => {
    expect(getTurnPublicDetailsCancelledButtonClasses()).toBe("w-full h-12 rounded-lg text-base font-bold");
    expect(getTurnPublicDetailsEmptySlotIconBadgeClasses()).toBe(
      "h-10 w-10 rounded-lg bg-background border border-dashed border-border flex items-center justify-center"
    );
    expect(getTurnPublicDetailsEmptySlotContentClasses()).toBe(
      "flex-1 flex items-center justify-between min-w-0 gap-2"
    );
    expect(getTurnPublicDetailsEmptySlotTextClasses()).toBe(
      "text-xs font-semibold italic opacity-60 truncate"
    );
    expect(getTurnPublicDetailsEmptySlotShareButtonClasses()).toBe("h-8 w-8 rounded-lg shrink-0");
  });

  it("formats substitutes and chat section pure styling helpers", () => {
    expect(getTurnPublicDetailsSubstitutesSectionClasses()).toBe("space-y-4");
    expect(getTurnPublicDetailsSubstitutesHeaderClasses()).toBe("flex items-center justify-between");
    expect(getTurnPublicDetailsSubstitutesCountBadgeClasses()).toBe(
      "rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground border border-border"
    );
    expect(getTurnPublicDetailsSubstitutesListClasses()).toBe("grid gap-2");
    expect(getTurnPublicDetailsSubstituteIndexBadgeClasses()).toBe(
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground"
    );
    expect(getTurnPublicDetailsChatSectionClasses()).toBe("space-y-4 mb-6");
  });

  it("formats turn actions layout and button pure styling helpers", () => {
    expect(getTurnActionsInnerContainerClasses()).toBe("max-w-md mx-auto");
    expect(getTurnActionsStackClasses()).toBe("flex flex-col gap-3");
    expect(getTurnActionsButtonGroupClasses()).toBe("flex gap-2");
    expect(getTurnActionsFullWidthRowClasses()).toBe("flex gap-2 w-full");
    expect(getTurnActionsSignInFormClasses()).toContain("w-full h-12 rounded-lg text-base font-bold");
    expect(getTurnActionsSignInFormClasses()).toContain("focus-visible:ring-2");
    expect(getTurnActionsShareButtonSmallClasses()).toBe("h-10 w-10 rounded-lg shrink-0");
    expect(getTurnActionsShareButtonLargeClasses()).toBe("h-12 w-12 rounded-lg shrink-0");
  });

  it("formats turn skeleton layout, card and item pure styling helpers", () => {
    expect(getTurnSkeletonHeaderBackBadgeClasses()).toBe(
      "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"
    );
    expect(getTurnSkeletonHeaderTitleContainerClasses()).toBe("space-y-2");
    expect(getTurnSkeletonTimeCardClasses()).toBe("bg-card p-4 flex flex-col gap-1.5");
    expect(getTurnSkeletonLocationCardClasses()).toBe(
      "bg-card p-4 flex items-center gap-4 border-t border-border"
    );
    expect(getTurnSkeletonLocationIconBadgeClasses()).toBe(
      "flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0"
    );
    expect(getTurnSkeletonPlayersSectionClasses()).toBe("space-y-4");
    expect(getTurnSkeletonPlayersHeaderClasses()).toBe("flex items-center justify-between");
    expect(getTurnSkeletonPlayersListClasses()).toBe("grid gap-2");
    expect(getTurnSkeletonPlayerItemClasses()).toBe(
      "flex items-center gap-3 rounded-xl bg-card p-3 border border-border"
    );
    expect(getTurnSkeletonBottomBarInnerClasses()).toBe("max-w-md mx-auto");
  });
});

describe("Calendar UI pure helpers", () => {
  it("formats calendar button and header copy", () => {
    expect(getCalendarButtonText()).toBe("Agregar al calendario");
    expect(getCalendarButtonAriaLabel()).toBe("Agregar el partido a mi calendario");
    expect(getCalendarHeaderPromptText()).toBe("Elegí tu calendario:");
    expect(getGoogleButtonText()).toBe("Google");
    expect(getGoogleButtonAriaLabel()).toBe("Agregar a Google Calendar");
    expect(getIcsButtonText()).toBe("Apple / Outlook");
    expect(getIcsButtonAriaLabel()).toBe("Descargar archivo iCal");
  });

  it("formats calendar export toast messages in Argentine Spanish", () => {
    expect(getGoogleCalendarToast()).toBe("Abriendo Google Calendar...");
    expect(getIcsCalendarToast()).toBe("Archivo de calendario descargado.");
  });

  it("formats getCalendarHeaderPromptClasses and getCalendarOptionsGridClasses", () => {
    expect(getCalendarHeaderPromptClasses()).toBe("text-xs font-semibold text-muted-foreground text-center");
    expect(getCalendarOptionsGridClasses()).toBe("grid grid-cols-2 gap-2");
  });
});

describe("Play casual and card date pure styling helpers", () => {
  it("formats getPlayCasualConfirmNoticeText, getPlayCasualNoticeClasses, and getPlayCasualStrongClasses", () => {
    expect(getPlayCasualConfirmNoticeText()).toBe("¿Marcar como jugado?");
    expect(getPlayCasualNoticeClasses()).toBe("text-xs text-muted-foreground text-center");
    expect(getPlayCasualStrongClasses()).toBe("text-foreground");
  });

  it("formats getLeaveTurnConfirmContainerClasses, getLeaveTurnLateLeaveTitleClasses, getLeaveTurnLateLeaveDotClasses, getLeaveTurnLateLeaveDescriptionClasses, getLeaveTurnWasFullPromptClasses, and getLeaveTurnActionGroupClasses", () => {
    expect(getLeaveTurnConfirmContainerClasses()).toBe("flex flex-col gap-2");
    expect(getLeaveTurnLateLeaveTitleClasses()).toBe("text-xs font-bold text-destructive flex items-center gap-1.5");
    expect(getLeaveTurnLateLeaveDotClasses()).toBe("inline-block h-2 w-2 rounded-full bg-destructive");
    expect(getLeaveTurnLateLeaveDescriptionClasses()).toBe("text-xs text-muted-foreground");
    expect(getLeaveTurnWasFullPromptClasses()).toBe("text-xs text-muted-foreground text-center");
    expect(getLeaveTurnActionGroupClasses()).toBe("flex gap-2");
  });

  it("formats getOpenToNetworkDefaultResultHeaderClasses, getOpenToNetworkDefaultResultDescriptionClasses, getOpenToNetworkErrorClasses, and getOpenToNetworkHelperClasses", () => {
    expect(getOpenToNetworkDefaultResultHeaderClasses()).toBe("flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold");
    expect(getOpenToNetworkDefaultResultDescriptionClasses()).toBe("mt-1 text-xs text-muted-foreground");
    expect(getOpenToNetworkErrorClasses()).toBe("text-xs text-destructive font-semibold text-center");
    expect(getOpenToNetworkHelperClasses()).toBe("text-xs text-muted-foreground text-center font-medium");
  });

  it("formats getTurnCardDateMonthClasses and getTurnCardDateDayClasses", () => {
    expect(getTurnCardDateMonthClasses()).toBe("text-xs font-bold text-muted-foreground leading-none");
    expect(getTurnCardDateDayClasses()).toBe("text-xl font-bold text-foreground leading-none mt-1 tabular-nums");
  });
});

describe("Fallback error toast pure helpers", () => {
  it("formats getRemovePlayerErrorToast", () => {
    expect(getRemovePlayerErrorToast()).toBe("No se pudo sacar al jugador.");
    expect(getRemovePlayerErrorToast("Error personalizado")).toBe("Error personalizado");
  });

  it("formats getAssignSubstituteErrorToast", () => {
    expect(getAssignSubstituteErrorToast()).toBe("No se pudo asignar al suplente.");
    expect(getAssignSubstituteErrorToast("Error personalizado")).toBe("Error personalizado");
  });

  it("formats getAddPlayerErrorToast", () => {
    expect(getAddPlayerErrorToast()).toBe("No se pudo agregar al jugador.");
    expect(getAddPlayerErrorToast("Error personalizado")).toBe("Error personalizado");
  });

  it("formats getSendChatMessageErrorToast", () => {
    expect(getSendChatMessageErrorToast()).toBe("No se pudo enviar el mensaje.");
    expect(getSendChatMessageErrorToast("Error personalizado")).toBe("Error personalizado");
  });
});

describe("New turn action and late leave warning pure helpers", () => {
  it("formats getLateLeaveWarningTitle and getLateLeaveWarningDescription in Argentine Spanish", () => {
    expect(getLateLeaveWarningTitle()).toBe("Baja tardía detectada");
    expect(getLateLeaveWarningDescription()).toBe(
      "Falta menos de 2 horas para el turno. Si te bajás ahora, tu reputación de asistencia bajará un 5%."
    );
  });

  it("formats getWasFullSharePromptText", () => {
    expect(getWasFullSharePromptText()).toBe(
      "¿No podés venir? Compartí el link para que alguien ocupe tu lugar:"
    );
  });

  it("formats getPlayCasualConfirmText", () => {
    expect(getPlayCasualConfirmText()).toBe(
      "Se cerrará el turno sin registrar un partido ni resultados en el ranking."
    );
  });

  it("formats dismiss ARIA labels for cancel turn and play casual forms", () => {
    expect(getCancelTurnDismissAriaLabel()).toBe("Cancelar eliminación del turno");
    expect(getPlayCasualDismissAriaLabel()).toBe("Cancelar confirmación de marcar como jugado");
  });

  it("formats getQuickJoinEmptySlotAriaLabel and getQuickJoinEmptySlotText for idle and pending states", () => {
    expect(getQuickJoinEmptySlotAriaLabel(false)).toBe("Sumarse en este cupo disponible");
    expect(getQuickJoinEmptySlotAriaLabel(true)).toBe("Sumándome al turno...");

    expect(getQuickJoinEmptySlotText(false)).toBe("Sumarme");
    expect(getQuickJoinEmptySlotText(true)).toBe("Sumando...");
  });
});

describe("Turn Public Details pure helpers", () => {
  it("formats cancelled turn screen titles, descriptions, and button labels", () => {
    expect(getTurnCancelledTitle()).toBe("Turno cancelado");
    expect(getTurnCancelledDescription()).toBe("Este turno ha sido cancelado por el organizador.");
    expect(getTurnCancelledButtonLabel()).toBe("Ver otros turnos");
  });

  it("formats TurnPublicDetails UI styling classes pure helpers", () => {
    expect(getTurnPublicDetailsHeaderBackLinkClasses()).toContain("h-10 w-10");
    expect(getTurnPublicDetailsBannerContainerClasses()).toContain("border-amber-300");
    expect(getTurnPublicDetailsBannerShareButtonClasses()).toContain("h-9 w-9");
    expect(getTurnPublicDetailsInfoCardClasses()).toContain("rounded-xl border border-border bg-card");
    expect(getTurnPublicDetailsInfoCardHeaderClasses()).toContain("bg-muted border-b border-border");
    expect(getTurnPublicDetailsInfoCardNotesClasses()).toContain("p-4 bg-muted border-t border-border");
    expect(getTurnPublicDetailsPlayerItemClasses()).toContain("flex items-center gap-3 rounded-xl bg-card");
    expect(getTurnPublicDetailsEmptySlotClasses()).toContain("border-dashed");
    expect(getTurnPublicDetailsSuggestedContactItemClasses()).toContain("flex items-center gap-3 rounded-xl bg-card");
    expect(getTurnPublicDetailsSubstituteItemClasses()).toContain("flex items-center gap-3 rounded-xl bg-card");
  });

  it("formats getTurnShareData and getTurnShareText", () => {
    const d = new Date("2026-09-20T19:00:00.000Z");
    expect(getTurnShareData({ club: "Central Padel", date: d, openSlots: 0 })).toEqual({
      type: "turn",
      club: "Central Padel",
      date: d,
    });
    expect(getTurnShareData({ club: "Central Padel", date: d, openSlots: 2 })).toBeUndefined();

    expect(getTurnShareText({ club: "Central Padel", date: d, openSlots: 0 })).toBeUndefined();
    expect(getTurnShareText({ club: "Central Padel", date: d, openSlots: 1 })).toContain(
      "⚠️ Falta 1 jugador para el turno de pádel en Central Padel"
    );
  });

  it("formats page heading, info section, and ARIA region labels", () => {
    expect(getTurnDetailsHeading()).toBe("Detalle del Turno");
    expect(getTurnInfoSectionTitle()).toBe("Información del turno");
    expect(getTurnInfoRegionAriaLabel()).toBe("Información del turno de pádel");
    expect(getTurnBackAriaLabel()).toBe("Volver");
    expect(getTurnSkeletonAriaLabel()).toBe("Cargando detalles del turno de pádel...");
  });

  it("formats turn headings and loading skeleton ARIA labels", () => {
    expect(getTurnosHeadingTitle()).toBe("Turnos abiertos");
    expect(getTurnosHeadingDescription()).toBe("Unite a partidos de tu nivel.");
    expect(getNewTurnHeadingTitle()).toBe("Nuevo turno");
    expect(getNewTurnHeadingDescription()).toBe("Configurá cancha y cupos.");
    expect(getEditTurnHeadingTitle()).toBe("Editar turno");
    expect(getEditTurnHeadingDescription()).toBe("Modificá los detalles de tu turno.");

    expect(getTurnosLoadingAriaLabel()).toBe("Cargando lista de turnos abiertos de pádel...");
    expect(getNewTurnLoadingAriaLabel()).toBe("Cargando formulario de nuevo turno de pádel...");
    expect(getEditTurnLoadingAriaLabel()).toBe("Cargando formulario de edición de turno de pádel...");
  });

  it("formats turn status badge text and solid MDS CSS classes across completed, full, and open states", () => {
    expect(getTurnStatusBadgeText({ isCompleted: true })).toBe("Finalizado");
    expect(getTurnStatusBadgeText({ isFull: true })).toBe("Completo");
    expect(getTurnStatusBadgeText({})).toBe("Abierto");

    expect(getTurnStatusBadgeClasses({ isCompleted: true })).toContain("bg-muted");
    expect(getTurnStatusBadgeClasses({ isFull: true })).toContain("bg-amber-100");
    expect(getTurnStatusBadgeClasses({})).toContain("bg-emerald-100");
  });

  it("formats enrolled, suggested, substitutes, and chat section titles and ARIA labels", () => {
    expect(getTurnEnrolledSectionTitle()).toBe("Lista de jugadores");
    expect(getTurnEnrolledRegionAriaLabel()).toBe("Lista de jugadores inscriptos");
    expect(getEmptySlotText()).toBe("Cupo disponible");

    expect(getTurnSuggestedContactsTitle()).toBe("Sugeridos para invitar 🧠");
    expect(getTurnSuggestedContactsSubtitle()).toBe("De tu red de contactos");

    expect(getTurnSubstitutesSectionTitle()).toBe("Lista de suplentes");
    expect(getTurnSubstitutesRegionAriaLabel()).toBe("Lista de suplentes en espera");
    expect(getTurnSubstitutesCountText(1)).toBe("1 suplente");
    expect(getTurnSubstitutesCountText(3)).toBe("3 suplentes");

    expect(getTurnChatSectionTitle()).toBe("Chat del turno 💬");
    expect(getTurnChatRegionAriaLabel()).toBe("Chat de coordinación del turno");
  });

  it("formats contact connection text and ARIA labels", () => {
    expect(getTurnConnectionText("Mateo")).toBe("Contacto de Mateo");
    expect(getTurnConnectionAriaLabel("Mateo")).toBe("Contacto de Mateo");
  });
});

describe("TurnCard new pure helpers", () => {
  it("formats getTurnCardSubstitutesText in Argentine Spanish", () => {
    expect(getTurnCardSubstitutesText(0)).toBe("");
    expect(getTurnCardSubstitutesText(1)).toBe("(+1 supl)");
    expect(getTurnCardSubstitutesText(2)).toBe("(+2 suples)");
    expect(getTurnCardSubstitutesText(3)).toBe("(+3 suples)");
  });

  it("formats getTurnCardContactPlayersAriaLabel for 1 and multiple contacts", () => {
    expect(getTurnCardContactPlayersAriaLabel([])).toBe("");
    expect(getTurnCardContactPlayersAriaLabel(["Juan"])).toBe("Juega tu contacto: Juan");
    expect(getTurnCardContactPlayersAriaLabel(["Juan", "Pedro"])).toBe(
      "Juegan tus contactos: Juan y Pedro"
    );
  });

  it("formats getTurnCardDetailLinkAriaLabel in Argentine Spanish", () => {
    expect(getTurnCardDetailLinkAriaLabel("Central Padel")).toBe(
      "Ver detalles del turno de pádel en Central Padel"
    );
  });
});

describe("Turn Action Toast pure helpers", () => {
  it("formats cancel turn success and error toasts", () => {
    expect(getCancelTurnSuccessToast()).toBe("Cancelaste el turno.");
    expect(getCancelTurnErrorToast()).toBe("No se pudo cancelar el turno.");
    expect(getCancelTurnErrorToast("Error al cancelar")).toBe("Error al cancelar");
  });

  it("formats join turn success and error toasts", () => {
    expect(getJoinTurnSuccessToast()).toBe("Te sumaste al turno.");
    expect(getJoinTurnErrorToast()).toBe("No se pudo sumar al turno.");
    expect(getJoinTurnErrorToast("Cupo ocupado")).toBe("Cupo ocupado");
  });

  it("formats join substitute success toast", () => {
    expect(getJoinSubstituteSuccessToast()).toBe(
      "Te sumaste como suplente. Te avisaremos cuando se libere un cupo."
    );
  });

  it("formats leave substitute success and error toasts", () => {
    expect(getLeaveSubstituteSuccessToast()).toBe("Saliste de la lista de suplentes.");
    expect(getLeaveSubstituteErrorToast()).toBe("No se pudo salir de suplentes.");
    expect(getLeaveSubstituteErrorToast("Error de salida")).toBe("Error de salida");
  });

  it("formats take open slot success toast", () => {
    expect(getTakeOpenSlotSuccessToast()).toBe("Ocupaste el cupo.");
  });

  it("formats start match success and error toasts", () => {
    expect(getStartMatchSuccessToast()).toBe("Iniciaste el partido.");
    expect(getStartMatchErrorToast()).toBe("No se pudo iniciar el partido.");
    expect(getStartMatchErrorToast("Insuficientes jugadores")).toBe("Insuficientes jugadores");
  });

  it("formats schedule next turn success and error toasts", () => {
    expect(getScheduleNextTurnSuccessToast()).toBe("Programaste el próximo turno.");
    expect(getScheduleNextTurnErrorToast()).toBe("No se pudo programar el próximo turno.");
    expect(getScheduleNextTurnErrorToast("Error al crear")).toBe("Error al crear");
  });

  it("formats play casual success and error toasts", () => {
    expect(getPlayCasualSuccessToast()).toBe("Marcaste el turno como jugado.");
    expect(getPlayCasualErrorToast()).toBe("No se pudo marcar el turno como jugado.");
    expect(getPlayCasualErrorToast("No autorizado")).toBe("No autorizado");
  });
});

describe("Turn Form pure helpers", () => {
  it("formats getCreateTurnSuccessToast and getUpdateTurnSuccessToast in Argentine Spanish", () => {
    expect(getCreateTurnSuccessToast()).toBe("Creaste el turno. Compartilo por WhatsApp.");
    expect(getUpdateTurnSuccessToast()).toBe("Actualizaste el turno.");
  });

  it("formats getTurnFormRegionAriaLabel for create and edit modes", () => {
    expect(getTurnFormRegionAriaLabel("create")).toBe("Formulario para crear nuevo turno de pádel");
    expect(getTurnFormRegionAriaLabel("edit")).toBe("Formulario para editar turno de pádel");
  });

  it("formats getTurnFormSubmitButtonAriaLabel across create/edit modes and idle/pending states", () => {
    expect(getTurnFormSubmitButtonAriaLabel({ mode: "create", isPending: false })).toBe(
      "Crear turno y compartir link"
    );
    expect(getTurnFormSubmitButtonAriaLabel({ mode: "create", isPending: true })).toBe(
      "Creando turno..."
    );
    expect(getTurnFormSubmitButtonAriaLabel({ mode: "edit", isPending: false })).toBe(
      "Guardar cambios del turno"
    );
    expect(getTurnFormSubmitButtonAriaLabel({ mode: "edit", isPending: true })).toBe(
      "Guardando cambios del turno..."
    );
  });
});

describe("TurnActions Region and Copy Helpers", () => {
  it("formats getTurnActionsRegionAriaLabel across user authentication, role, and turn status states", () => {
    expect(
      getTurnActionsRegionAriaLabel({ club: "Central Padel", viewerId: undefined })
    ).toBe("Acciones del turno en Central Padel: Iniciar sesión o compartir enlace");

    expect(
      getTurnActionsRegionAriaLabel({ club: "Central Padel", viewerId: "u1", isCompleted: true })
    ).toBe("Acciones del turno en Central Padel: Turno finalizado");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isSubstitute: true,
        openSlots: 1,
      })
    ).toBe("Acciones del turno en Central Padel: Ocupar cupo disponible o salir de suplentes");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isSubstitute: true,
        openSlots: 0,
      })
    ).toBe("Acciones del turno en Central Padel: Lista de espera de suplentes");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isCreator: true,
      })
    ).toBe("Acciones de organización del turno en Central Padel");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isJoined: true,
      })
    ).toBe("Acciones del turno en Central Padel: Bajarme del turno o compartir");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isFull: true,
      })
    ).toBe("Acciones del turno en Central Padel: Turno completo, sumarme como suplente");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        openSlots: 2,
      })
    ).toBe("Acciones del turno en Central Padel: Sumarme ahora o compartir");
  });

  it("formats copy helper strings accurately", () => {
    expect(getSubstituteWaitlistMessage()).toBe(
      "Estás en la lista de espera. Te avisaremos cuando se libere un cupo."
    );
    expect(getSubstituteNoSlotsText()).toBe("No hay cupos libres todavía");
    expect(getTurnCompletedButtonLabel()).toBe("Turno finalizado");
    expect(getAlreadyJoinedButtonLabel()).toBe("Ya te sumaste");
    expect(getSignInPromptText("Central Padel")).toBe("Iniciá sesión para sumarte a Central Padel");
  });
});

describe("getContactBadgeText and getSuggestedContactSectionAriaLabel", () => {
  it("formats contact badge text in Argentine Spanish", () => {
    expect(getContactBadgeText(false)).toBe("Contacto");
    expect(getContactBadgeText(true)).toBe("Contacto frecuente");
  });

  it("formats suggested contacts section ARIA label", () => {
    expect(
      getSuggestedContactSectionAriaLabel({ count: 1, openSlots: 1 })
    ).toBe(
      "Contactos sugeridos de tu red de pádel para invitar por WhatsApp: 1 contacto sugerido para cubrir 1 cupo disponible."
    );

    expect(
      getSuggestedContactSectionAriaLabel({ count: 3, openSlots: 2 })
    ).toBe(
      "Contactos sugeridos de tu red de pádel para invitar por WhatsApp: 3 contactos sugeridos para cubrir 2 cupos disponibles."
    );
  });
});

describe("WhatsApp Invite pure helpers", () => {
  it("formats getWhatsAppInviteSuccessToast and getWhatsAppGroupInviteSuccessToast in Argentine Spanish", () => {
    expect(getWhatsAppInviteSuccessToast("Mateo")).toBe("Abriste WhatsApp para invitar a Mateo.");
    expect(getWhatsAppGroupInviteSuccessToast()).toBe("Abriste WhatsApp para enviar la invitación al grupo.");
  });

  it("formats getWhatsAppInviteAriaLabel and getWhatsAppGroupInviteAriaLabel", () => {
    expect(getWhatsAppInviteAriaLabel("Mateo", "Central Padel")).toBe(
      "Invitar a Mateo por WhatsApp para sumar al turno en Central Padel"
    );
    expect(getWhatsAppGroupInviteAriaLabel(1, "Central Padel")).toBe(
      "Invitar a grupo de WhatsApp para sumar 1 jugador al turno en Central Padel"
    );
    expect(getWhatsAppGroupInviteAriaLabel(2, "Central Padel")).toBe(
      "Invitar a grupo de WhatsApp para sumar 2 jugadores al turno en Central Padel"
    );
  });

  it("formats getWhatsAppInviteButtonText, getWhatsAppGroupInviteButtonText, and getFallbackWhatsAppShareUrl", () => {
    expect(getWhatsAppInviteButtonText()).toBe("Invitar");
    expect(getWhatsAppGroupInviteButtonText()).toBe("Grupo WhatsApp");
    expect(getFallbackWhatsAppShareUrl()).toBe("https://wa.me/");
  });
});

describe("OpenToNetworkButton pure styling helpers", () => {
  it("formats getOpenToNetworkIconResultClasses, getOpenToNetworkCompactResultClasses, and getOpenToNetworkDefaultResultClasses", () => {
    expect(getOpenToNetworkIconResultClasses()).toContain("bg-emerald-500");
    expect(getOpenToNetworkIconResultClasses("custom-icon")).toContain("custom-icon");

    expect(getOpenToNetworkCompactResultClasses()).toContain("bg-emerald-100");
    expect(getOpenToNetworkCompactResultClasses("custom-compact")).toContain("custom-compact");

    expect(getOpenToNetworkDefaultResultClasses()).toContain("border-border bg-muted");
    expect(getOpenToNetworkDefaultResultClasses("custom-default")).toContain("custom-default");
  });

  it("formats getOpenToNetworkContainerClasses across showText and isIconOnly flags", () => {
    expect(getOpenToNetworkContainerClasses(true, false)).toContain("gap-2");
    expect(getOpenToNetworkContainerClasses(false, false)).toContain("gap-0");
    expect(getOpenToNetworkContainerClasses(true, true)).toContain("gap-0");
  });

  it("formats getOpenToNetworkButtonClasses across icon, variant, cooldown, and custom className states", () => {
    const defaultBtn = getOpenToNetworkButtonClasses({});
    expect(defaultBtn).toContain("w-full");
    expect(defaultBtn).toContain("font-bold");

    const iconBtn = getOpenToNetworkButtonClasses({ isIconOnly: true });
    expect(iconBtn).not.toContain("w-full");

    const cooldownBtn = getOpenToNetworkButtonClasses({ isOnCooldown: true });
    expect(cooldownBtn).toContain("cursor-not-allowed");
    expect(cooldownBtn).not.toContain("font-bold");

    const customBtn = getOpenToNetworkButtonClasses({ className: "custom-class" });
    expect(customBtn).toContain("custom-class");
  });
});

describe("LeaveTurnButton and OpenToNetworkButton pure helpers", () => {
  it("formats leave turn toast messages and ARIA labels", () => {
    expect(getLeaveTurnSuccessToast()).toBe("Te bajaste del turno.");
    expect(getLeaveTurnErrorToast()).toBe("No se pudo bajar del turno.");
    expect(getLeaveTurnErrorToast("Error personalizado")).toBe("Error personalizado");
    expect(getLeaveTurnTriggerAriaLabel()).toBe("Bajarme del turno");
    expect(getLeaveTurnRegionAriaLabel()).toBe("Baja del turno");
    expect(getCancelLeaveTurnAriaLabel()).toBe("Cancelar baja del turno");
    expect(getConfirmLeaveTurnAriaLabel({})).toBe("Confirmar baja del turno");
    expect(getConfirmLeaveTurnAriaLabel({ isPending: true })).toBe("Procesando baja del turno...");
  });

  it("formats open to network toast messages, result text, and ARIA labels", () => {
    expect(getOpenToNetworkSuccessToast(0)).toBe("Se avisó a tu red.");
    expect(getOpenToNetworkSuccessToast(1)).toBe("Se notificó a 1 contacto de tu red.");
    expect(getOpenToNetworkSuccessToast(3)).toBe("Se notificó a 3 contactos de tu red.");
    expect(getOpenToNetworkErrorToast()).toBe("No se pudo notificar a tu red.");
    expect(getOpenToNetworkErrorToast("Fallo de red")).toBe("Fallo de red");
    expect(getOpenToNetworkRegionAriaLabel()).toBe("Notificación a red de contactos");
    expect(getOpenToNetworkResultText(0)).toBe("Red notificada");
    expect(getOpenToNetworkResultText(1)).toBe("Se notificó a 1 contacto");
    expect(getOpenToNetworkResultText(2)).toBe("Se notificó a 2 contactos");

    expect(getOpenToNetworkAriaLabel({})).toBe("Abrir a mi red");
    expect(getOpenToNetworkAriaLabel({ label: "Notificar red" })).toBe("Notificar red");
    expect(getOpenToNetworkAriaLabel({ isPending: true })).toBe("Notificando a tu red de pádel...");
    expect(getOpenToNetworkAriaLabel({ isOnCooldown: true, minutesRemaining: 1 })).toBe("Notificado, en cooldown por 1 minuto");
    expect(getOpenToNetworkAriaLabel({ isOnCooldown: true, minutesRemaining: 15 })).toBe("Notificado, en cooldown por 15 minutos");
  });

  it("formats open to network button text and result ARIA label", () => {
    expect(getOpenToNetworkButtonText({ isPending: true })).toBe("Enviando...");
    expect(getOpenToNetworkButtonText({ isOnCooldown: true, minutesRemaining: 10 })).toBe(
      "Red notificada (esperá 10 min)"
    );
    expect(getOpenToNetworkButtonText({ label: "Salvar turno" })).toBe("Salvar turno");

    expect(getOpenToNetworkResultAriaLabel(1)).toBe(
      "Notificación enviada: se notificó a 1 contacto de tu red."
    );
    expect(getOpenToNetworkResultAriaLabel(3)).toBe(
      "Notificación enviada: se notificó a 3 contactos de tu red."
    );
    expect(getOpenToNetworkResultAriaLabel(0)).toBe(
      "Notificación enviada: no se encontraron contactos para notificar."
    );
  });

  it("formats open to network cooldown text, helper text, and result subtitles", () => {
    expect(getOpenToNetworkCooldownText(15)).toBe("Red notificada (esperá 15 min)");
    expect(getOpenToNetworkHelperText(true, 15)).toBe("Ya se notificó a la red. Podés volver a enviar en 15 min.");
    expect(getOpenToNetworkHelperText(false)).toBe("Notifica a contactos de los últimos 12 meses");
    expect(getOpenToNetworkResultSubtitle(1)).toBe("Se notificó a 1 contacto");
    expect(getOpenToNetworkResultSubtitle(3)).toBe("Se notificó a 3 contactos");
    expect(getOpenToNetworkResultSubtitle(0)).toBe("Sin contactos");
    expect(getOpenToNetworkResultDescription()).toBe("Recibirán una push para sumarse.");
  });
});

describe("TurnActions ARIA label helpers", () => {
  it("getCancelTurnAriaLabel", () => {
    expect(getCancelTurnAriaLabel({})).toBe("Cancelar y eliminar este turno");
    expect(getCancelTurnAriaLabel({ isConfirming: true })).toBe(
      "Confirmar eliminación del turno"
    );
    expect(getCancelTurnAriaLabel({ isPending: true })).toBe(
      "Eliminando el turno..."
    );
  });

  it("getCancelTurnConfirmRegionAriaLabel", () => {
    expect(getCancelTurnConfirmRegionAriaLabel()).toBe(
      "Confirmación para cancelar y eliminar el turno"
    );
  });

  it("getStartMatchAriaLabel", () => {
    expect(getStartMatchAriaLabel({})).toBe("Iniciar partido ahora");
    expect(getStartMatchAriaLabel({ isPending: true })).toBe(
      "Iniciando partido..."
    );
  });

  it("getJoinTurnAriaLabel", () => {
    expect(getJoinTurnAriaLabel({})).toBe("Sumarme al turno");
    expect(getJoinTurnAriaLabel({ isPending: true })).toBe(
      "Sumándome al turno..."
    );
  });

  it("getJoinSubstituteAriaLabel", () => {
    expect(getJoinSubstituteAriaLabel({})).toBe("Sumarse como suplente");
    expect(getJoinSubstituteAriaLabel({ isPending: true })).toBe(
      "Sumándome como suplente..."
    );
  });

  it("getLeaveSubstituteAriaLabel", () => {
    expect(getLeaveSubstituteAriaLabel({})).toBe("Salir de la lista de suplentes");
    expect(getLeaveSubstituteAriaLabel({ isPending: true })).toBe(
      "Saliendo de la lista de suplentes..."
    );
  });

  it("getTakeOpenSlotAriaLabel", () => {
    expect(getTakeOpenSlotAriaLabel({})).toBe("Ocupar el cupo libre disponible");
    expect(getTakeOpenSlotAriaLabel({ isPending: true })).toBe(
      "Ocupando cupo disponible..."
    );
  });

  it("getScheduleNextTurnAriaLabel", () => {
    expect(getScheduleNextTurnAriaLabel({})).toBe(
      "Programar el próximo turno para la siguiente semana"
    );
    expect(getScheduleNextTurnAriaLabel({ isPending: true })).toBe(
      "Programando próximo turno..."
    );
  });

  it("getPlayCasualAriaLabel", () => {
    expect(getPlayCasualAriaLabel({})).toBe(
      "Marcar turno como jugado sin registrar partido"
    );
    expect(getPlayCasualAriaLabel({ isConfirming: true })).toBe(
      "Confirmar marcar como jugado"
    );
    expect(getPlayCasualAriaLabel({ isPending: true })).toBe(
      "Marcando turno como jugado..."
    );
  });

  it("getPlayCasualConfirmRegionAriaLabel", () => {
    expect(getPlayCasualConfirmRegionAriaLabel()).toBe(
      "Confirmación para marcar el turno como jugado sin registrar partido"
    );
  });
});

describe("TurnCard Accessibility Helpers", () => {
  it("formats getTurnCardAriaLabel across different user states and slot counts", () => {
    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 3,
        maxPlayers: 4,
        isCreator: true,
      })
    ).toBe("Tarjeta de turno en Central Padel: 3 de 4 inscriptos (Organizador).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 3,
        maxPlayers: 4,
        isSubstitute: true,
      })
    ).toBe("Tarjeta de turno en Central Padel: 3 de 4 inscriptos (Suplente).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 3,
        maxPlayers: 4,
        isJoined: true,
      })
    ).toBe("Tarjeta de turno en Central Padel: 3 de 4 inscriptos (Inscripto).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 4,
        maxPlayers: 4,
      })
    ).toBe("Tarjeta de turno en Central Padel: 4 de 4 inscriptos (Completo).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 3,
        maxPlayers: 4,
      })
    ).toBe("Tarjeta de turno en Central Padel: 3 de 4 inscriptos (Falta 1 jugador).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 2,
        maxPlayers: 4,
      })
    ).toBe("Tarjeta de turno en Central Padel: 2 de 4 inscriptos (Faltan 2 jugadores).");
  });

  it("formats getQuickJoinAriaLabel for primary and substitute slots in idle and pending states", () => {
    expect(
      getQuickJoinAriaLabel({ club: "Central Padel", isSubstitute: false, isPending: false })
    ).toBe("Sumarse al turno en Central Padel");

    expect(
      getQuickJoinAriaLabel({ club: "Central Padel", isSubstitute: true, isPending: false })
    ).toBe("Sumarse como suplente al turno en Central Padel");

    expect(
      getQuickJoinAriaLabel({ club: "Central Padel", isSubstitute: false, isPending: true })
    ).toBe("Sumándome al turno...");

    expect(
      getQuickJoinAriaLabel({ club: "Central Padel", isSubstitute: true, isPending: true })
    ).toBe("Sumándome como suplente...");
  });

  it("formats getTurnStatusBadgeAriaLabel across roles and open slot counts", () => {
    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 1, isCreator: true })
    ).toBe("Rol: Organizador del turno");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 0, isSubstitute: true })
    ).toBe("Rol: Suplente en lista de espera");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 0, isJoined: true })
    ).toBe("Estado: Inscripto en el turno");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 0 })
    ).toBe("Estado: Turno completo");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 1 })
    ).toBe("Cupos disponibles: Falta 1 jugador");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 2 })
    ).toBe("Cupos disponibles: Faltan 2 jugadores");
  });
});

describe("Turn Filter Helpers", () => {
  it("formats getTurnFilterAriaLabel for 'todos' vs 'mis-turnos' tabs and counts", () => {
    expect(getTurnFilterAriaLabel({ activeTab: "todos", count: 1 })).toBe(
      "Sección de turnos abiertos de pádel: mostrando 1 turno."
    );
    expect(getTurnFilterAriaLabel({ activeTab: "todos", count: 3 })).toBe(
      "Sección de turnos abiertos de pádel: mostrando 3 turnos."
    );
    expect(getTurnFilterAriaLabel({ activeTab: "mis-turnos", count: 2 })).toBe(
      "Sección de tus partidos programados de pádel: mostrando 2 turnos."
    );
  });

  it("formats formatTurnFilterBadgeText in Argentine Spanish", () => {
    expect(formatTurnFilterBadgeText(1)).toBe("1 disponible");
    expect(formatTurnFilterBadgeText(4)).toBe("4 disponibles");
  });

  it("formats getTurnFilterTabAriaLabel for filter tab selection buttons", () => {
    expect(getTurnFilterTabAriaLabel({ tab: "todos", count: 5 })).toBe(
      "Mostrar todos los turnos disponibles (5)"
    );
    expect(getTurnFilterTabAriaLabel({ tab: "mis-turnos", count: 2 })).toBe(
      "Mostrar mis turnos únicamente (2)"
    );
  });

  it("formats getTurnFilterHeadingTitle for 'todos' vs 'mis-turnos'", () => {
    expect(getTurnFilterHeadingTitle("todos")).toBe("Próximos turnos");
    expect(getTurnFilterHeadingTitle("mis-turnos")).toBe("Mis partidos programados");
  });

  it("formats getTurnFilterEmptyStateProps for 'todos' vs 'mis-turnos'", () => {
    const todosEmpty = getTurnFilterEmptyStateProps("todos");
    expect(todosEmpty.title).toBe("Sin turnos abiertos");
    expect(todosEmpty.description).toBe("No hay turnos disponibles. Sé el primero en crear uno.");
    expect(todosEmpty.createButtonLabel).toBe("Crear turno");

    const misTurnosEmpty = getTurnFilterEmptyStateProps("mis-turnos");
    expect(misTurnosEmpty.title).toBe("No estás anotado en ningún turno");
    expect(misTurnosEmpty.description).toBe(
      "Explorá los turnos abiertos para sumarte a un partido o creá tu propio turno."
    );
    expect(misTurnosEmpty.exploreButtonLabel).toBe("Explorar turnos abiertos");
    expect(misTurnosEmpty.createButtonLabel).toBe("Crear un turno");
    expect(misTurnosEmpty.exploreButtonAriaLabel).toBe("Explorar todos los turnos abiertos disponibles");
  });
});

describe("Organizer Action Helpers", () => {
  it("formats getRemovePlayerAriaLabel across default, confirming, and pending states", () => {
    expect(getRemovePlayerAriaLabel({ playerName: "Mateo" })).toBe("Sacar a Mateo del turno");
    expect(getRemovePlayerAriaLabel({ playerName: "Mateo", isConfirming: true })).toBe("Confirmar sacar a Mateo del turno");
    expect(getRemovePlayerAriaLabel({ playerName: "Mateo", isPending: true })).toBe("Sacando a Mateo...");
  });

  it("formats getRemovePlayerSuccessToast and getRemovePlayerConfirmText in Argentine Spanish", () => {
    expect(getRemovePlayerSuccessToast("Mateo")).toBe("Sacaste a Mateo del turno.");
    expect(getRemovePlayerConfirmText()).toBe("Sacar");
  });

  it("formats getAssignSubstituteAriaLabel across default and pending states", () => {
    expect(getAssignSubstituteAriaLabel({ substituteName: "Gonzalo" })).toBe("Asignar a Gonzalo como titular");
    expect(getAssignSubstituteAriaLabel({ substituteName: "Gonzalo", isPending: true })).toBe("Asignando a Gonzalo...");
  });

  it("formats getAssignSubstituteSuccessToast and getAssignSubstituteButtonText in Argentine Spanish", () => {
    expect(getAssignSubstituteSuccessToast("Gonzalo")).toBe("Promoviste a Gonzalo a titular.");
    expect(getAssignSubstituteButtonText(false)).toBe("Asignar");
    expect(getAssignSubstituteButtonText(true)).toBe("Asignando...");
  });

  it("formats AddPlayerButton UI copy pure helpers", () => {
    expect(getAddPlayerButtonTitle()).toBe("Agregar jugador");
    expect(getAddPlayerButtonSubtitle()).toBe("Para confirmaciones fuera de la app");
    expect(getAddPlayerSearchPlaceholder()).toBe("Buscar jugador...");
    expect(getAddPlayerSearchResultsRegionAriaLabel()).toBe("Resultados de búsqueda de jugadores");
    expect(getAddPlayerRegionAriaLabel()).toBe("Agregar jugador al turno");
  });
});

describe("formatSubstituteListAriaLabel", () => {
  it("formats substitute list item ARIA label in Argentine Spanish", () => {
    expect(formatSubstituteListAriaLabel(0, 2, "Mateo")).toBe("Suplente #1 de 2: Mateo");
    expect(formatSubstituteListAriaLabel(1, 2, "Gonzalo")).toBe("Suplente #2 de 2: Gonzalo");
  });
});

describe("buildTurnConnectionMap", () => {
  const edge = { playerAId: "u1", playerBId: "u2" };

  it("maps a participant to the name of an earlier-joined contact", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Ana" },
        { userId: "u2", joinedAt: new Date("2026-09-12T11:00:00Z"), name: "Beto" },
      ],
      [edge],
    );
    expect(map).toEqual({ u2: "Ana" });
  });

  // Regression test: the /t/[id] page crashed with
  // "joinedAt.getTime is not a function" because serialized cache payloads
  // deliver joinedAt as ISO strings, not Date instances.
  it("accepts ISO string joinedAt values without crashing", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: "2026-09-12T10:00:00Z", name: "Ana" },
        { userId: "u2", joinedAt: "2026-09-12T11:00:00Z", name: "Beto" },
      ],
      [edge],
    );
    expect(map).toEqual({ u2: "Ana" });
  });

  it("matches edges in both directions", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Ana" },
        { userId: "u2", joinedAt: new Date("2026-09-12T11:00:00Z"), name: "Beto" },
      ],
      [{ playerAId: "u2", playerBId: "u1" }],
    );
    expect(map).toEqual({ u2: "Ana" });
  });

  it("only connects a participant to someone who joined before them", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T12:00:00Z"), name: "Ana" },
        { userId: "u2", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Beto" },
      ],
      [edge],
    );
    expect(map).toEqual({ u1: "Beto" });
  });

  it("returns an empty map when no participant shares an edge", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Ana" },
        { userId: "u3", joinedAt: new Date("2026-09-12T11:00:00Z"), name: "Caro" },
      ],
      [edge],
    );
    expect(map).toEqual({});
  });

  it("prefers the earliest connected participant when several edges match", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Ana" },
        { userId: "u3", joinedAt: new Date("2026-09-12T10:30:00Z"), name: "Caro" },
        { userId: "u2", joinedAt: new Date("2026-09-12T11:00:00Z"), name: "Beto" },
      ],
      [edge, { playerAId: "u2", playerBId: "u3" }],
    );
    expect(map).toEqual({ u2: "Ana" });
  });
});

describe("formatCalendarUTC", () => {
  it("formats Date instance or valid ISO string into UTC YYYYMMDDTHHMMSSZ format", () => {
    const d = new Date("2026-09-20T18:30:00.000Z");
    expect(formatCalendarUTC(d)).toBe("20260920T183000Z");
    expect(formatCalendarUTC("2026-09-20T18:30:00.000Z")).toBe("20260920T183000Z");
  });

  it("returns empty string for invalid date values", () => {
    expect(formatCalendarUTC("invalid-date")).toBe("");
  });
});

describe("getGoogleCalendarUrl", () => {
  it("builds valid Google Calendar URL with encoded title, dates, details, and location", () => {
    const url = getGoogleCalendarUrl({
      turnId: "turn-123",
      club: "Central Padel",
      date: "2026-09-20T18:00:00.000Z",
      duration: 90,
      notes: "Traer tubo nuevo",
      origin: "https://padelred.app",
    });

    expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("text=");
    expect(url).toContain("Central+Padel");
    expect(url).toContain("dates=20260920T180000Z%2F20260920T193000Z");
    expect(url).toContain("location=Central+Padel");
    expect(url).toContain(encodeURIComponent("https://padelred.app/t/turn-123"));
    expect(url).toContain("Traer+tubo+nuevo");
  });

  it("returns empty string for invalid dates", () => {
    const url = getGoogleCalendarUrl({
      turnId: "turn-123",
      club: "Central Padel",
      date: "invalid-date",
      duration: 90,
    });
    expect(url).toBe("");
  });
});

describe("getIcsCalendarContent", () => {
  it("generates valid VCALENDAR lines with DTSTART, DTEND, SUMMARY, and LOCATION", () => {
    const now = new Date("2026-09-15T10:00:00.000Z");
    const ics = getIcsCalendarContent({
      turnId: "turn-456",
      club: "El Balcón",
      date: "2026-09-20T20:00:00.000Z",
      duration: 60,
      origin: "https://padelred.app",
      now,
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:turn-turn-456@padelred.app");
    expect(ics).toContain("DTSTAMP:20260915T100000Z");
    expect(ics).toContain("DTSTART:20260920T200000Z");
    expect(ics).toContain("DTEND:20260920T210000Z");
    expect(ics).toContain("SUMMARY:Pádel · El Balcón · 20hs");
    expect(ics).toContain("LOCATION:El Balcón");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("returns empty string for invalid date values", () => {
    const ics = getIcsCalendarContent({
      turnId: "turn-456",
      club: "El Balcón",
      date: "invalid-date",
      duration: 60,
    });
    expect(ics).toBe("");
  });
});

describe("getCalendarOptionsAriaLabel", () => {
  it("formats accessible ARIA label for calendar options region", () => {
    expect(getCalendarOptionsAriaLabel("Central Padel")).toBe(
      "Opciones para agregar el partido en Central Padel a tu calendario"
    );
  });
});
