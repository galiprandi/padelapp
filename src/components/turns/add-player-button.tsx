"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Search, Loader2, X, Check } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { addPlayerAction } from "@/app/(app)/turnos/actions";
import { useToast } from "@/components/toast/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  filterAndSortPlayerOptions,
  getAddPlayerSuccessToast,
  getAddPlayerErrorToast,
  getAddPlayerAriaLabel,
  getAddPlayerSearchStatusAriaLabel,
  getAddPlayerPromptText,
  getAddPlayerEmptyResultsText,
  getAddPlayerClearSearchAriaLabel,
  getAddPlayerCancelSearchAriaLabel,
  getAddPlayerButtonTitle,
  getAddPlayerButtonSubtitle,
  getAddPlayerSearchPlaceholder,
  getAddPlayerSearchResultsRegionAriaLabel,
  getAddPlayerRegionAriaLabel,
  getAddPlayerInputLabelText,
  getAddPlayerTriggerButtonClasses,
  getAddPlayerTriggerIconBadgeClasses,
  getAddPlayerCardContainerClasses,
  getAddPlayerSearchHeaderClasses,
  getAddPlayerSearchInputClasses,
  getAddPlayerSearchClearButtonClasses,
  getAddPlayerSearchCancelButtonClasses,
  getAddPlayerSearchResultItemClasses,
  getAddPlayerTriggerIconClasses,
  getAddPlayerTriggerTextContainerClasses,
  getAddPlayerTriggerTitleClasses,
  getAddPlayerTriggerSubtitleClasses,
  getAddPlayerSearchInputWrapperClasses,
  getAddPlayerSearchIconClasses,
  getAddPlayerSearchSpinnerClasses,
  getAddPlayerSearchClearIconClasses,
  getAddPlayerSearchCancelIconClasses,
  getAddPlayerSearchResultsContainerClasses,
  getAddPlayerSearchResultsListClasses,
  getAddPlayerSearchResultInfoClasses,
  getAddPlayerSearchResultNameClasses,
  getAddPlayerSearchResultEmailClasses,
  getAddPlayerSearchResultSpinnerClasses,
  getAddPlayerSearchResultCheckIconClasses,
  getAddPlayerEmptyResultsNoticeClasses,
  getAddPlayerPromptNoticeClasses,
  type PlayerOption,
} from "@/components/turns/turn-utils";

interface AddPlayerButtonProps {
  turnId: string;
  existingPlayerIds: string[];
}

export function AddPlayerButton({
  turnId,
  existingPlayerIds,
}: AddPlayerButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when expanded
  useEffect(() => {
    if (expanded) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  // Debounced search
  useEffect(() => {
    let active = true;
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setIsSearching(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/players?q=${encodeURIComponent(trimmed)}`,
        );
        const data = await res.json();
        if (active && data.players) {
          const filtered = filterAndSortPlayerOptions(data.players, existingPlayerIds);
          setResults(filtered);
        }
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setIsSearching(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [query, existingPlayerIds]);

  async function handleAdd(player: PlayerOption) {
    setAddingId(player.id);
    const result = await addPlayerAction(turnId, player.id);
    if (result.status === "ok") {
      showToast(getAddPlayerSuccessToast(player.displayName));
      setExpanded(false);
      setQuery("");
      setResults([]);
      router.refresh();
    } else {
      showToast(getAddPlayerErrorToast(result.message));
    }
    setAddingId(null);
  }

  const searchStatusAriaLabel = getAddPlayerSearchStatusAriaLabel({
    isSearching,
    count: results.length,
    query,
  });

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={getAddPlayerTriggerButtonClasses()}
        aria-label={getAddPlayerRegionAriaLabel()}
      >
        <div className={getAddPlayerTriggerIconBadgeClasses()}>
          <UserPlus className={getAddPlayerTriggerIconClasses()} />
        </div>
        <div className={getAddPlayerTriggerTextContainerClasses()}>
          <p className={getAddPlayerTriggerTitleClasses()}>{getAddPlayerButtonTitle()}</p>
          <p className={getAddPlayerTriggerSubtitleClasses()}>
            {getAddPlayerButtonSubtitle()}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label={getAddPlayerRegionAriaLabel()}
      className={getAddPlayerCardContainerClasses()}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setExpanded(false);
          setQuery("");
          setResults([]);
        }
      }}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {searchStatusAriaLabel}
      </p>

      {/* Search header */}
      <div className={getAddPlayerSearchHeaderClasses()}>
        <div className={getAddPlayerSearchInputWrapperClasses()}>
          <Search className={getAddPlayerSearchIconClasses()} />
          <label htmlFor="player-search-input" className="sr-only">
            {getAddPlayerInputLabelText()}
          </label>
          <input
            id="player-search-input"
            ref={inputRef}
            type="text"
            value={query}
            aria-busy={isSearching}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getAddPlayerSearchPlaceholder()}
            autoCapitalize="words"
            className={getAddPlayerSearchInputClasses()}
          />
          {isSearching && (
            <Loader2 className={getAddPlayerSearchSpinnerClasses()} />
          )}
          {query && !isSearching && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              aria-label={getAddPlayerClearSearchAriaLabel()}
              className={getAddPlayerSearchClearButtonClasses()}
            >
              <X className={getAddPlayerSearchClearIconClasses()} />
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setExpanded(false);
            setQuery("");
            setResults([]);
          }}
          className={getAddPlayerSearchCancelButtonClasses()}
          aria-label={getAddPlayerCancelSearchAriaLabel()}
        >
          <X className={getAddPlayerSearchCancelIconClasses()} />
        </button>
      </div>

      {/* Results */}
      {query.trim().length >= 2 && (
        <div className={getAddPlayerSearchResultsContainerClasses()} role="region" aria-label={getAddPlayerSearchResultsRegionAriaLabel()}>
          {results.length > 0 ? (
            <div className={getAddPlayerSearchResultsListClasses()}>
              {results.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleAdd(player)}
                  disabled={addingId !== null}
                  aria-busy={addingId === player.id}
                  className={getAddPlayerSearchResultItemClasses()}
                  aria-label={getAddPlayerAriaLabel(player.displayName)}
                >
                  <PlayerAvatar
                    name={player.displayName}
                    image={player.image ?? undefined}
                    size={32}
                    aria-hidden="true"
                  />
                  <div className={getAddPlayerSearchResultInfoClasses()}>
                    <p className={getAddPlayerSearchResultNameClasses()}>
                      {player.displayName}
                      {player.isContact && (
                        <Badge variant="primary">
                          Contacto
                        </Badge>
                      )}
                    </p>
                    {player.email && (
                      <p className={getAddPlayerSearchResultEmailClasses()}>
                        {player.email}
                      </p>
                    )}
                  </div>
                  {addingId === player.id ? (
                    <Loader2 className={getAddPlayerSearchResultSpinnerClasses()} />
                  ) : (
                    <Check className={getAddPlayerSearchResultCheckIconClasses()} />
                  )}
                </button>
              ))}
            </div>
          ) : (
            !isSearching && (
              <p className={getAddPlayerEmptyResultsNoticeClasses()}>
                {getAddPlayerEmptyResultsText()}
              </p>
            )
          )}
        </div>
      )}

      {query.trim().length < 2 && (
        <p className={getAddPlayerPromptNoticeClasses()}>
          {getAddPlayerPromptText()}
        </p>
      )}
    </div>
  );
}
