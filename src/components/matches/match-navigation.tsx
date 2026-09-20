import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  getMatchNavigationAriaLabel,
  getPrimaryButtonAriaLabel,
  getSecondaryButtonAriaLabel,
  getSecondaryButtonClasses,
} from "./match-navigation-utils";

interface MatchNavigationProps {
  /** Texto del botón principal (Siguiente/Continuar/Crear) */
  primaryButtonText: string;
  /** Acción del botón principal */
  onPrimaryClick: () => void;
  /** Si el botón principal debe estar deshabilitado */
  primaryDisabled?: boolean;
  /** Si el botón principal está en estado de carga */
  primaryLoading?: boolean;
  /** Texto del botón secundario (Cancelar/Atrás) */
  secondaryButtonText: string;
  /** Acción del botón secundario */
  onSecondaryClick: () => void;
  /** Si el botón secundario debe ser un enlace */
  secondaryIsLink?: boolean;
  /** URL del enlace secundario (si aplica) */
  secondaryHref?: string;
  /** Variante del botón secundario */
  secondaryVariant?: "ghost" | "outline";
}

/**
 * Componente de navegación reutilizable para pasos de formularios.
 * Ocupa todo el espacio disponible debajo del contenido con botones de acción.
 */
export function MatchNavigation({
  primaryButtonText,
  onPrimaryClick,
  primaryDisabled = false,
  primaryLoading = false,
  secondaryButtonText,
  onSecondaryClick,
  secondaryIsLink = false,
  secondaryHref = "",
  secondaryVariant = "ghost",
}: MatchNavigationProps) {
  const regionAriaLabel = getMatchNavigationAriaLabel();
  const primaryAriaLabel = getPrimaryButtonAriaLabel(
    primaryButtonText,
    primaryLoading,
  );
  const secondaryAriaLabel = getSecondaryButtonAriaLabel(secondaryButtonText);
  const secondaryClasses = getSecondaryButtonClasses(secondaryVariant);

  return (
    <div
      role="region"
      aria-label={regionAriaLabel}
      className="flex flex-col gap-2"
    >
      <Button
        type="button"
        aria-label={primaryAriaLabel}
        className="w-full h-12 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-xs"
        onClick={onPrimaryClick}
        disabled={primaryDisabled || primaryLoading}
        aria-busy={primaryLoading}
      >
        {primaryLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {primaryButtonText}
      </Button>

      {secondaryIsLink && secondaryHref ? (
        <Button
          asChild
          type="button"
          variant={secondaryVariant}
          aria-label={secondaryAriaLabel}
          className={secondaryClasses}
        >
          <Link href={secondaryHref} prefetch={true}>
            {secondaryButtonText}
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant={secondaryVariant}
          aria-label={secondaryAriaLabel}
          className={secondaryClasses}
          onClick={onSecondaryClick}
        >
          {secondaryButtonText}
        </Button>
      )}
    </div>
  );
}
