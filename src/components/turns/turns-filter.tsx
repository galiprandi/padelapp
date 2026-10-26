"use client";

import { useState } from "react";
import { CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { TurnCard } from "./turn-card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type PadelContact } from "@/lib/queries";
import {
  filterTurnsByTab,
  getNextRadioValue,
  getTurnFilterAriaLabel,
  formatTurnFilterBadgeText,
  getTurnFilterTabAriaLabel,
  getTurnFilterHeadingTitle,
  getTurnFilterEmptyStateProps,
  getTurnFilterTabClasses,
  getTurnFilterContainerClasses,
  getTurnFilterRadiogroupClasses,
  getTurnFilterHeaderContainerClasses,
  getTurnFilterHeaderTitleClasses,
  getTurnFilterBadgeClasses,
  getTurnFilterPrimaryButtonClasses,
  getTurnFilterOutlineButtonClasses,
} from "./turn-utils";

interface TurnListItem {
  id: string;
  club: string;
  date: string | Date;
  creatorId: string | null;
  players: Array<{ userId?: string; user?: { id: string; displayName: string; alias: string | null; image: string | null } }>;
  substitutes?: Array<{ userId: string }>;
  maxPlayers: number;
  status?: string;
  lastNetworkNotificationAt?: Date | string | null;
  [key: string]: unknown;
}

interface TurnsFilterProps {
  turns: TurnListItem[];
  userId: string | null;
  contacts?: PadelContact[];
}

export function TurnsFilter({ turns, userId, contacts }: TurnsFilterProps) {
  const [activeTab, setActiveTab] = useState<"todos" | "mis-turnos">("todos");

  // Helper values for determining relationships
  const filteredTurns = filterTurnsByTab(turns, activeTab, userId);

  const totalAllCount = turns.length;
  const totalMyCount = userId
    ? filterTurnsByTab(turns, "mis-turnos", userId).length
    : 0;

  const regionAriaLabel = getTurnFilterAriaLabel({
    activeTab,
    count: filteredTurns.length,
  });

  const headingTitle = getTurnFilterHeadingTitle(activeTab);
  const emptyProps = getTurnFilterEmptyStateProps(activeTab);

  return (
    <section role="region" aria-label={regionAriaLabel} className={getTurnFilterContainerClasses()}>
      {userId && (
        <div className="flex flex-col gap-1.5">
          <span id="turns-tabs-label" className="sr-only">
            Filtrar turnos
          </span>
          <div
            role="radiogroup"
            aria-labelledby="turns-tabs-label"
            className={getTurnFilterRadiogroupClasses()}
            onKeyDown={(e) => {
              const nextTab = getNextRadioValue(
                ["todos", "mis-turnos"] as const,
                activeTab,
                e.key
              );
              if (!nextTab) return;
              e.preventDefault();
              setActiveTab(nextTab);
              const buttons = Array.from(
                e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
              );
              const targetIdx = nextTab === "todos" ? 0 : 1;
              buttons[targetIdx]?.focus();
            }}
          >
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "todos"}
              tabIndex={activeTab === "todos" ? 0 : -1}
              onClick={() => setActiveTab("todos")}
              className={getTurnFilterTabClasses(activeTab === "todos")}
              aria-label={getTurnFilterTabAriaLabel({ tab: "todos", count: totalAllCount })}
            >
              Todos ({totalAllCount})
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "mis-turnos"}
              tabIndex={activeTab === "mis-turnos" ? 0 : -1}
              onClick={() => setActiveTab("mis-turnos")}
              className={getTurnFilterTabClasses(activeTab === "mis-turnos")}
              aria-label={getTurnFilterTabAriaLabel({ tab: "mis-turnos", count: totalMyCount })}
            >
              Mis turnos ({totalMyCount})
            </button>
          </div>
        </div>
      )}

      <div className={getTurnFilterHeaderContainerClasses()}>
        <h2 className={getTurnFilterHeaderTitleClasses()}>
          {headingTitle}
        </h2>
        <span className={getTurnFilterBadgeClasses()}>
          {formatTurnFilterBadgeText(filteredTurns.length)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filteredTurns.length > 0 ? (
          filteredTurns.map((turn) => {
            const isJoined = turn.players.some((p) => p.userId === userId);
            const isSubstitute = turn.substitutes?.some((s) => s.userId === userId);
            const isCreator = turn.creatorId === userId;
            return (
              <TurnCard
                key={turn.id}
                turn={turn}
                isJoined={isJoined}
                isSubstitute={isSubstitute}
                isCreator={isCreator}
                contacts={contacts}
              />
            );
          })
        ) : activeTab === "todos" ? (
          <EmptyState
            title={emptyProps.title}
            description={emptyProps.description}
            icon={CalendarOff}
            action={
              <Button
                asChild
                className={getTurnFilterPrimaryButtonClasses()}
              >
                <Link href="/turnos/nuevo" prefetch={true}>
                  {emptyProps.createButtonLabel}
                </Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            title={emptyProps.title}
            description={emptyProps.description}
            icon={CalendarOff}
            action={
              <div className="flex flex-col gap-2 w-full">
                {emptyProps.exploreButtonLabel && (
                  <Button
                    onClick={() => setActiveTab("todos")}
                    className={getTurnFilterPrimaryButtonClasses()}
                    aria-label={emptyProps.exploreButtonAriaLabel}
                  >
                    {emptyProps.exploreButtonLabel}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={getTurnFilterOutlineButtonClasses()}
                  asChild
                >
                  <Link href="/turnos/nuevo" prefetch={true}>
                    {emptyProps.createButtonLabel}
                  </Link>
                </Button>
              </div>
            }
          />
        )}
      </div>
    </section>
  );
}
