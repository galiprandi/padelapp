import { Fragment } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { getLevelBadgeLabel } from "@/lib/utils";
import {
  getPlayerCardAriaLabel,
  formatPlayerSubtitle,
  handlePlayerCardKeyDown,
  getPlayerCardContainerClasses,
  getPairRegionAriaLabel,
  getRankingBadgeAriaLabel,
  getPlayerRankingBadgeClasses,
  getPlayerCompactRankingBadgeClasses,
  getPlayerPreviewManageIconContainerClasses,
  getPairPreviewContainerClasses,
  getPairBadgeClasses,
  getPairPreviewBodyClasses,
  getPairPreviewLineClasses,
  getPairPreviewConnectorClasses,
  getPairInlineContainerClasses,
  getPairInlineContentClasses,
  getPairInlinePlayerItemClasses,
  getPairInlineDividerClasses,
  getPairInlineAvatarClasses,
} from "./player-card-utils";

export interface PlayerPreviewProps {
  id: string;
  name: string;
  role?: string;
  image?: string;
  isConfirmed?: boolean;
  ranking?: number;
  category?: number;
  onManageClick?: () => void;
  manageAriaLabel?: string;
  onClick?: () => void;
}

export function PlayerPreview({
  name,
  role,
  image,
  isConfirmed,
  category,
  onManageClick,
  manageAriaLabel,
  onClick,
}: PlayerPreviewProps) {
  const isInteractive = !!(onClick || onManageClick);
  const mainAction = onManageClick || onClick;
  const subtitle = formatPlayerSubtitle(role, category);
  const ariaLabel = getPlayerCardAriaLabel({
    name,
    isInteractive,
    onManageClick,
    isConfirmed,
    customLabel: manageAriaLabel,
  });

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={mainAction}
      onKeyDown={(e) => handlePlayerCardKeyDown(e, isInteractive, mainAction)}
      aria-label={ariaLabel}
      className={getPlayerCardContainerClasses(isInteractive)}
    >
      <PlayerAvatar name={name} image={image} className="rounded-lg" />

      <div className="flex-1 truncate">
        <p className="truncate text-sm font-bold text-foreground">{name}</p>
        {subtitle ? (
          <p className="truncate text-xs font-medium text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        ) : null}
      </div>

      {onManageClick ? (
        <div
          className={getPlayerPreviewManageIconContainerClasses()}
          aria-hidden="true"
        >
          {isConfirmed ? (
            <UserCheck className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </div>
      ) : null}
    </div>
  );
}

export function PlayerWithRanking({
  name,
  role,
  image,
  ranking,
  category,
  onClick,
}: PlayerPreviewProps) {
  const isInteractive = !!onClick;
  const subtitle = formatPlayerSubtitle(role, category);
  const ariaLabel = getPlayerCardAriaLabel({
    name,
    isInteractive,
  });

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => handlePlayerCardKeyDown(e, isInteractive, onClick)}
      aria-label={ariaLabel}
      className={getPlayerCardContainerClasses(isInteractive)}
    >
      <PlayerAvatar name={name} image={image} className="rounded-lg" />

      <div className="flex-1 truncate">
        <p className="truncate text-sm font-bold text-foreground">{name}</p>
        {subtitle ? (
          <p className="truncate text-xs font-medium text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        ) : null}
      </div>

      {typeof ranking === "number" ? (
        <span
          className={getPlayerRankingBadgeClasses()}
          aria-label={getRankingBadgeAriaLabel(ranking)}
        >
          #{ranking}
        </span>
      ) : null}
    </div>
  );
}

export function PlayerCompact({
  name,
  image,
  ranking,
  onClick,
}: PlayerPreviewProps) {
  const isInteractive = !!onClick;
  const ariaLabel = getPlayerCardAriaLabel({
    name,
    isInteractive,
  });

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => handlePlayerCardKeyDown(e, isInteractive, onClick)}
      aria-label={ariaLabel}
      className={getPlayerCardContainerClasses(isInteractive)}
    >
      <PlayerAvatar
        name={name}
        image={image}
        size={32}
        className="rounded-lg"
      />

      <p className="flex-1 truncate text-sm font-bold text-foreground">
        {name}
      </p>

      {typeof ranking === "number" ? (
        <span
          className={getPlayerCompactRankingBadgeClasses()}
          aria-label={getRankingBadgeAriaLabel(ranking)}
        >
          #{ranking}
        </span>
      ) : null}
    </div>
  );
}

export function PairPreview({
  players,
  label,
}: {
  players: PlayerPreviewProps[];
  label: string;
}) {
  const hasConnector = players.length > 1;
  const regionAriaLabel = getPairRegionAriaLabel(label);

  return (
    <div
      role="region"
      aria-label={regionAriaLabel}
      className={getPairPreviewContainerClasses()}
    >
      <span className={getPairBadgeClasses()}>
        {label}
      </span>
      <div className={getPairPreviewBodyClasses()}>
        {hasConnector ? (
          <div
            className={getPairPreviewLineClasses()}
            aria-hidden="true"
          />
        ) : null}
        {players.map((player) => (
          <div key={`pair-${label}-${player.id}`} className="relative">
            {hasConnector ? (
              <span
                className={getPairPreviewConnectorClasses()}
                aria-hidden="true"
              />
            ) : null}
            <PlayerPreview {...player} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PairInline({
  players,
  label,
}: {
  players: PlayerPreviewProps[];
  label: string;
}) {
  const regionAriaLabel = getPairRegionAriaLabel(label);

  return (
    <div
      role="region"
      aria-label={regionAriaLabel}
      className={getPairInlineContainerClasses()}
    >
      <span className={getPairBadgeClasses()}>
        {label}
      </span>

      <div className={getPairInlineContentClasses()}>
        {players.map((player, index) => {
          return (
            <Fragment key={`pair-inline-${label}-${player.id}`}>
              <div className={getPairInlinePlayerItemClasses()}>
                <PlayerAvatar
                  name={player.name}
                  image={player.image}
                  className={getPairInlineAvatarClasses()}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {player.name}
                  </p>
                  {typeof player.category === "number" ? (
                    <p className="truncate text-xs font-medium text-muted-foreground mt-0.5">
                      {getLevelBadgeLabel(player.category)}
                    </p>
                  ) : null}
                </div>
              </div>
              {index < players.length - 1 ? (
                <div className={getPairInlineDividerClasses()} aria-hidden="true" />
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
