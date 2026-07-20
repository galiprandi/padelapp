"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp, Trophy, Calendar, AlertTriangle, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

export function RankingInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Reglas y Fórmulas del Ranking</h3>
            <p className="text-xs text-muted-foreground">¿Cómo se calculan los puntos y posiciones?</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border p-4 space-y-4 bg-card text-sm">
          {/* Fórmulas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Trophy className="h-4 w-4 text-primary" />
              <span>Cálculo de Puntos</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Todos los jugadores inician con <strong>1000 puntos base</strong>. Tu puntaje se actualiza con cada partido confirmado bajo la siguiente fórmula:
            </p>
            <div className="rounded-lg bg-muted p-2.5 text-xs font-mono text-foreground space-y-1">
              <div>Puntos = 1000 + (Victorias × 15) + (Racha × 5) + (Bonus de Sets) - Penalizaciones</div>
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
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span>Penalizaciones por Asistencia</span>
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
              <Calendar className="h-4 w-4 text-primary" />
              <span>Decay por Inactividad</span>
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
              <Scale className="h-4 w-4 text-primary" />
              <span>Criterios de Desempate</span>
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
