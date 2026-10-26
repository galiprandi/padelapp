"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp, Trophy, Calendar, AlertTriangle, Scale } from "lucide-react";
import {
  getRankingRulesAriaLabel,
  getRankingRegionAriaLabel,
  getRankingRulesHeaderTitle,
  getRankingRulesHeaderSubtitle,
  getRankingRulesSectionTitle,
  getRankingFormulaText,
  getRankingInfoContainerClasses,
  getRankingInfoHeaderButtonClasses,
  getRankingRulesContentClasses,
  getRankingRulesFormulaBoxClasses,
  getRankingRulesBasePointsDescription,
  getRankingRulesPointsBulletTexts,
  getRankingRulesPenaltiesDescription,
  getRankingRulesPenaltiesBulletTexts,
  getRankingRulesDecayDescription,
  getRankingRulesDecayBulletTexts,
  getRankingRulesTiebreakDescription,
  getRankingRulesTiebreakOrderedTexts,
} from "./ranking-utils";

export function RankingInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const pointsBullets = getRankingRulesPointsBulletTexts();
  const penaltiesBullets = getRankingRulesPenaltiesBulletTexts();
  const decayBullets = getRankingRulesDecayBulletTexts();
  const tiebreakOrdered = getRankingRulesTiebreakOrderedTexts();

  return (
    <div
      role="region"
      aria-label={getRankingRegionAriaLabel("rules")}
      className={getRankingInfoContainerClasses()}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={getRankingInfoHeaderButtonClasses()}
        aria-expanded={isOpen}
        aria-label={getRankingRulesAriaLabel(isOpen)}
        aria-controls="ranking-rules-content"
      >
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-primary" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-bold text-foreground">{getRankingRulesHeaderTitle()}</h3>
            <p className="text-xs text-muted-foreground">{getRankingRulesHeaderSubtitle()}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          id="ranking-rules-content"
          role="region"
          aria-label={getRankingRegionAriaLabel("rules-detail")}
          className={getRankingRulesContentClasses()}
        >
          {/* Fórmulas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{getRankingRulesSectionTitle("points")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {getRankingRulesBasePointsDescription()}
            </p>
            <div className={getRankingRulesFormulaBoxClasses()}>
              <div>{getRankingFormulaText()}</div>
            </div>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-1">
              <li><strong className="text-foreground">Victorias:</strong> {pointsBullets.wins}</li>
              <li><strong className="text-foreground">Racha de victorias:</strong> {pointsBullets.streak}</li>
              <li><strong className="text-foreground">Bonus de sets:</strong> {pointsBullets.sets}</li>
            </ul>
          </div>

          {/* Penalizaciones de asistencia */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{getRankingRulesSectionTitle("penalties")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {getRankingRulesPenaltiesDescription()}
            </p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-1">
              <li><strong className="text-foreground">Llegada Tarde (LATE):</strong> {penaltiesBullets.late}</li>
              <li><strong className="text-foreground">Ausencia sin aviso (NO_SHOW):</strong> {penaltiesBullets.noShow}</li>
            </ul>
          </div>

          {/* Inactividad */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{getRankingRulesSectionTitle("decay")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {getRankingRulesDecayDescription()}
            </p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-1">
              <li><strong className="text-foreground">Más de 60 días sin jugar:</strong> {decayBullets.sixtyDays}</li>
              <li><strong className="text-foreground">Más de 120 días sin jugar:</strong> {decayBullets.hundredTwentyDays}</li>
            </ul>
          </div>

          {/* Criterios de Desempate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Scale className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{getRankingRulesSectionTitle("tiebreak")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {getRankingRulesTiebreakDescription()}
            </p>
            <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 pl-1">
              <li><strong className="text-foreground">Índice de Asistencia (Reputación):</strong> {tiebreakOrdered.attendance}</li>
              <li><strong className="text-foreground">Total de Victorias:</strong> {tiebreakOrdered.wins}</li>
              <li><strong className="text-foreground">Recencia:</strong> {tiebreakOrdered.recency}</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
