"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveMatchResultAction } from "@/app/(app)/match/actions";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { MatchNavigation } from "@/components/matches/match-navigation";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { AttendanceMarker } from "@/components/matches/attendance-marker";
import { useToast } from "@/components/toast/use-toast";
import { getNextRadioIndex } from "@/lib/match-helpers";
import {
  parseInitialScores,
  buildScoreString,
  extractMatchTeams,
  calculateTeammateSide,
  getMatchResultAriaLabel,
  getSaveMatchResultSuccessToast,
  getSaveMatchResultErrorToast,
  getFinalScoreRegionAriaLabel,
  getSetScoresRegionAriaLabel,
  getPlayerSidesRegionAriaLabel,
  getPlayerSideGroupAriaLabel,
  getSetScoreButtonAriaLabel,
  getSetScoreGroupAriaLabel,
  getRegisterScorePrimaryButtonText,
  getCancelScoreSecondaryButtonText,
  getConfirmedMatchTitle,
  getBackToDetailButtonText,
  getSetHeaderTitle,
  getPlayerSidesHeadingTitle,
  getSideOptionButtonLabel,
  getSideOptionButtonClasses,
  getMatchResultContainerClasses,
  getMatchResultContentWrapperClasses,
  getMatchResultClosedCardClasses,
  getMatchResultClosedTrophyClasses,
  getMatchResultClosedScoreClasses,
  getMatchResultClosedDescriptionClasses,
  getMatchResultClosedButtonClasses,
  getMatchResultSetsListContainerClasses,
  getMatchResultSetSectionClasses,
  getMatchResultSetTitleClasses,
  getMatchResultSetTeamsListClasses,
  getMatchResultTeamCardClasses,
  getMatchResultTeamHeaderClasses,
  getMatchResultTeamInfoClasses,
  getMatchResultTeamAvatarsClasses,
  getMatchResultTeamAvatarClasses,
  getMatchResultTeamTextGroupClasses,
  getMatchResultTeamLabelClasses,
  getMatchResultTeamNamesClasses,
  getMatchResultTeamScoreBadgeClasses,
  getMatchResultScoreGridClasses,
  getMatchResultScoreOptionButtonClasses,
  getMatchResultSidesSectionClasses,
  getMatchResultSidesTitleClasses,
  getMatchResultSidesCardClasses,
  getMatchResultSidesTeamGroupClasses,
  getMatchResultSidesTeamLabelClasses,
  getMatchResultSidesPlayersListClasses,
  getMatchResultSidesPlayerRowClasses,
  getMatchResultSidesPlayerInfoClasses,
  getMatchResultSidesPlayerAvatarClasses,
  getMatchResultSidesPlayerNameClasses,
  getMatchResultSidesRadiogroupClasses,
  MatchPlayerInput,
} from "./match-result-utils";

interface MatchPlayer extends MatchPlayerInput {
  user?: {
    id: string;
    displayName: string | null;
    image: string | null;
  } | null;
  team?: {
    id: string;
    label: string;
  } | null;
}

interface MatchData {
  id: string;
  creatorId: string;
  status: string;
  sets: number;
  matchType: string;
  club: string | null;
  courtNumber: string | null;
  notes: string | null;
  score: string | null;
  date: string | Date;
  createdAt: string | Date;
  creator?: {
    id: string;
    displayName: string | null;
    image: string | null;
  } | null;
  players: MatchPlayer[];
}

interface MatchResultFormProps {
  match: MatchData;
  viewerId?: string;
}

export function MatchResultForm({ match, viewerId }: MatchResultFormProps) {
  const setsCount = Math.max(1, match.sets || 1);
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  // Initialize scores state using extracted helper
  const [scores, setScores] = useState<number[][]>(() =>
    parseInitialScores(match.score, setsCount),
  );

  // Initialize player sides
  const [playerSides, setPlayerSides] = useState<Record<string, "RIGHT" | "LEFT" | null>>(() => {
    const sidesInit: Record<string, "RIGHT" | "LEFT" | null> = {};
    match.players.forEach((p) => {
      sidesInit[p.id] = (p.side as "RIGHT" | "LEFT" | null) ?? null;
    });
    return sidesInit;
  });

  const isClosed = Boolean(match.score) || match.status === "CONFIRMED";
  const teams = extractMatchTeams(match.players);
  const team1Label = teams[0]?.label || "Pareja A";
  const team2Label = teams[1]?.label || "Pareja B";
  const regionAriaLabel = getMatchResultAriaLabel(team1Label, team2Label, isClosed, match.score);

  const handleSideChange = (playerId: string, side: "RIGHT" | "LEFT") => {
    setPlayerSides((prev) => {
      const next = { ...prev };
      const currentSide = next[playerId];
      const newSide = currentSide === side ? null : side;
      next[playerId] = newSide;

      // Find teammate in team and apply calculated complementary side
      const team = teams.find((t) => t.players.some((p) => p.id === playerId));
      if (team && team.players.length === 2) {
        const teammate = team.players.find((p) => p.id !== playerId);
        if (teammate) {
          next[teammate.id] = calculateTeammateSide(newSide);
        }
      }
      return next;
    });
  };

  const save = () => {
    const scoreStr = buildScoreString(scores, setsCount);

    const sidesPayload = Object.entries(playerSides)
      .filter(([, side]) => side !== null)
      .map(([playerId, side]) => ({ playerId, side: side! }));

    startTransition(async () => {
      const res = await saveMatchResultAction({
        matchId: match.id,
        score: scoreStr,
        sides: sidesPayload,
      });
      if (res.status === "ok") {
        showToast(getSaveMatchResultSuccessToast());
        router.push(`/match/${match.id}`);
        router.refresh();
      } else {
        showToast(getSaveMatchResultErrorToast(res.message), {
          duration: 4000,
        });
      }
    });
  };

  const isCreator = viewerId === match.creatorId;
  const oneHourAfterMatch = new Date(
    new Date(match.date).getTime() + 60 * 60 * 1000,
  );
  const canMarkAttendance =
    isCreator && new Date() > oneHourAfterMatch;

  const attendancePlayers = match.players
    .filter((p) => p.userId !== null)
    .map((p) => ({
      id: p.id,
      userId: p.userId!,
      name:
        p.displayName ||
        p.user?.displayName ||
        `Jugador ${p.position + 1}`,
      image: p.user?.image ?? undefined,
      currentStatus: (p.attendance as "ATTENDED" | "LATE" | "NO_SHOW" | null) ?? null,
    }));

  return (
    <div
      role="region"
      aria-label={regionAriaLabel}
      aria-busy={pending}
      className={getMatchResultContainerClasses()}
    >
      <div className={getMatchResultContentWrapperClasses()}>
        {isClosed ? (
          <section
            role="region"
            aria-label={getFinalScoreRegionAriaLabel(match.score || "")}
            className={getMatchResultClosedCardClasses()}
          >
            <Trophy className={getMatchResultClosedTrophyClasses()} />
            <h2 className={getMatchResultClosedScoreClasses()}>{match.score}</h2>
            <p className={getMatchResultClosedDescriptionClasses()}>
              {getConfirmedMatchTitle()}
            </p>
            <Button asChild className={getMatchResultClosedButtonClasses()}>
              <Link href={`/match/${match.id}`} prefetch={true}>{getBackToDetailButtonText()}</Link>
            </Button>
          </section>
        ) : (
          <Fragment>
            <div className={getMatchResultSetsListContainerClasses()}>
              {Array.from({ length: setsCount }, (_, setIndex) => (
                <section
                  key={setIndex}
                  role="region"
                  aria-label={getSetScoresRegionAriaLabel(setIndex)}
                  className={getMatchResultSetSectionClasses()}
                >
                  <h2 className={getMatchResultSetTitleClasses()}>
                    {getSetHeaderTitle(setIndex)}
                  </h2>

                  <div className={getMatchResultSetTeamsListClasses()}>
                    {teams.map((team, teamIndex) => (
                      <div
                        key={team.id}
                        className={getMatchResultTeamCardClasses()}
                      >
                        <div className={getMatchResultTeamHeaderClasses()}>
                          <div className={getMatchResultTeamInfoClasses()}>
                            <div className={getMatchResultTeamAvatarsClasses()}>
                              {team.players.map((p) => (
                                <PlayerAvatar
                                  key={p.id}
                                  name={p.name}
                                  image={p.image}
                                  className={getMatchResultTeamAvatarClasses()}
                                />
                              ))}
                            </div>
                            <div className={getMatchResultTeamTextGroupClasses()}>
                              <span className={getMatchResultTeamLabelClasses()}>
                                {team.label}
                              </span>
                              <span className={getMatchResultTeamNamesClasses()}>
                                {team.players.map((p) => p.name).join(" & ")}
                              </span>
                            </div>
                          </div>
                          <div className={getMatchResultTeamScoreBadgeClasses()}>
                            {scores[setIndex]?.[teamIndex] ?? 0}
                          </div>
                        </div>

                        <div
                          className={getMatchResultScoreGridClasses()}
                          role="radiogroup"
                          aria-labelledby={`team-${team.id}-set-${setIndex}-label`}
                          onKeyDown={(e) => {
                            if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) {
                              e.preventDefault();
                              const buttons = Array.from(
                                e.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]'),
                              );
                              if (buttons.length === 0) return;
                              const currentIndex = buttons.findIndex(
                                (btn) => btn === document.activeElement,
                              );
                              const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
                              const nextIdx = getNextRadioIndex(
                                safeCurrentIndex,
                                buttons.length,
                                e.key as "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp",
                              );
                              buttons[nextIdx]?.focus();
                            }
                          }}
                        >
                          <span id={`team-${team.id}-set-${setIndex}-label`} className="sr-only">
                            {getSetScoreGroupAriaLabel(team.label, setIndex)}
                          </span>
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
                            const isSelected =
                              (scores[setIndex]?.[teamIndex] ?? 0) === num;
                            return (
                              <button
                                key={num}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                tabIndex={isSelected ? 0 : -1}
                                aria-label={getSetScoreButtonAriaLabel(num, team.label)}
                                onClick={() => {
                                  setScores((prev) => {
                                    const newScores = prev.map((s) => [...s]);
                                    if (!newScores[setIndex])
                                      newScores[setIndex] = [0, 0];
                                    newScores[setIndex][teamIndex] = num;
                                    return newScores;
                                  });
                                }}
                                className={getMatchResultScoreOptionButtonClasses(isSelected)}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Side selection section */}
            <section
              role="region"
              aria-label={getPlayerSidesRegionAriaLabel()}
              className={getMatchResultSidesSectionClasses()}
            >
              <h2 className={getMatchResultSidesTitleClasses()}>
                {getPlayerSidesHeadingTitle()}
              </h2>
              <div className={getMatchResultSidesCardClasses()}>
                {teams.map((team) => (
                  <div key={team.id} className={getMatchResultSidesTeamGroupClasses()}>
                    <span className={getMatchResultSidesTeamLabelClasses()}>
                      {team.label}
                    </span>
                    <div className={getMatchResultSidesPlayersListClasses()}>
                      {team.players.map((p) => (
                        <div key={p.id} className={getMatchResultSidesPlayerRowClasses()}>
                          <div className={getMatchResultSidesPlayerInfoClasses()}>
                            <PlayerAvatar name={p.name} image={p.image} className={getMatchResultSidesPlayerAvatarClasses()} />
                            <span className={getMatchResultSidesPlayerNameClasses()}>{p.name}</span>
                          </div>
                          <div
                            className={getMatchResultSidesRadiogroupClasses()}
                            role="radiogroup"
                            aria-label={getPlayerSideGroupAriaLabel(p.name)}
                            onKeyDown={(e) => {
                              if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) {
                                e.preventDefault();
                                const buttons = Array.from(
                                  e.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]'),
                                );
                                if (buttons.length === 0) return;
                                const currentIndex = buttons.findIndex((btn) => btn === document.activeElement);
                                const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
                                const nextIdx = getNextRadioIndex(
                                  safeCurrentIndex,
                                  buttons.length,
                                  e.key as "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp",
                                );
                                buttons[nextIdx]?.focus();
                              }
                            }}
                          >
                            <button
                              type="button"
                              role="radio"
                              aria-checked={playerSides[p.id] === "RIGHT"}
                              tabIndex={playerSides[p.id] === "RIGHT" || (!playerSides[p.id]) ? 0 : -1}
                              onClick={() => handleSideChange(p.id, "RIGHT")}
                              className={getSideOptionButtonClasses(playerSides[p.id] === "RIGHT")}
                            >
                              {getSideOptionButtonLabel("RIGHT")}
                            </button>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={playerSides[p.id] === "LEFT"}
                              tabIndex={playerSides[p.id] === "LEFT" ? 0 : -1}
                              onClick={() => handleSideChange(p.id, "LEFT")}
                              className={getSideOptionButtonClasses(playerSides[p.id] === "LEFT")}
                            >
                              {getSideOptionButtonLabel("LEFT")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <MatchNavigation
              primaryButtonText={getRegisterScorePrimaryButtonText(pending)}
              onPrimaryClick={save}
              primaryDisabled={pending || isClosed}
              primaryLoading={pending}
              secondaryButtonText={getCancelScoreSecondaryButtonText()}
              onSecondaryClick={() => router.push(`/match/${match.id}`)}
            />
          </Fragment>
        )}
      </div>

      {canMarkAttendance && (
        <AttendanceMarker
          matchId={match.id}
          players={attendancePlayers}
          viewerId={viewerId}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}
