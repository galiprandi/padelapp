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
} from "./ranking-utils";

export function RankingInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      role="region"
      aria-label={getRankingRegionAriaLabel("rules")}
      className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-xs"
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
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
          className="border-t border-border p-4 space-y-4 bg-card text-sm"
        >
          {/* Fórmulas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{getRankingRulesSectionTitle("points")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Todos los jugadores inician con <strong>1000 puntos base</strong>. Tu puntaje se actualiza con cada partido confirmado bajo la siguiente fórmula:
            </p>
            <div className="rounded-lg bg-muted border border-border p-2.5 text-xs font-mono text-foreground space-y-1">
              <div>{getRankingFormulaText()}</div>
            </div>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-1">
              <li><strong className="text-foreground">Victorias:</strong> +15 puntos por cada partido ganado.</li>
              <li><strong className="text-foreground">Racha de victorias:</strong> +5 puntos adicionales por cada partido consecutivo ganado.</li>
              <li><strong className="text-foreground">Bonus de sets:</strong> +2 puntos por set ganado en partidos ganados; +1 punto por set ganado en partidos perdidos.</li>
            </ul>
          </div>

          {/* Penalizaciones de asistencia */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{getRankingRulesSectionTitle("penalties")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La asistencia y puntualidad son clave. No cumplir con el compromiso aplica penalizaciones directas a tu puntaje total:
            </p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-1">
              <li><strong className="text-foreground">Llegada Tarde (LATE):</strong> -10 puntos.</li>
              <li><strong className="text-foreground">Ausencia sin aviso (NO_SHOW):</strong> -25 puntos.</li>
            </ul>
          </div>

          {/* Inactividad */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{getRankingRulesSectionTitle("decay")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Para mantener el ranking activo, se aplica un decay (reducción) temporal a los jugadores inactivos:
            </p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 pl-1">
              <li><strong className="text-foreground">Más de 60 días sin jugar:</strong> El puntaje total se reduce a la mitad (×0.5).</li>
              <li><strong className="text-foreground">Más de 120 días sin jugar:</strong> El puntaje total se reduce a la cuarta parte (×0.25).</li>
            </ul>
          </div>

          {/* Criterios de Desempate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Scale className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{getRankingRulesSectionTitle("tiebreak")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Si dos o más jugadores tienen los mismos puntos, sus posiciones se definen aplicando en orden el siguiente criterio jerárquico:
            </p>
            <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1 pl-1">
              <li><strong className="text-foreground">Índice de Asistencia (Reputación):</strong> Quien tenga mayor porcentaje de asistencia/confirmación.</li>
              <li><strong className="text-foreground">Total de Victorias:</strong> Quien tenga más partidos ganados en total.</li>
              <li><strong className="text-foreground">Recencia:</strong> Quien haya jugado su partido más reciente en la fecha más cercana.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
