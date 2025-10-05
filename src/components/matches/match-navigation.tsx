import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MatchNavigationProps {
  /** Texto del botón principal (Siguiente/Continuar/Crear) */
  primaryButtonText: string;
  /** Acción del botón principal */
  onPrimaryClick: () => void;
  /** Si el botón principal debe estar deshabilitado */
  primaryDisabled?: boolean;
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
 *
 * @example
 * ```tsx
 * <MatchNavigation
 *   primaryButtonText="Crear partido"
 *   onPrimaryClick={handleCreate}
 *   primaryDisabled={isSubmitting}
 *   secondaryButtonText="Cancelar"
 *   onSecondaryClick={handleCancel}
 *   secondaryIsLink={true}
 *   secondaryHref="/match"
 * />
 * ```
 */
export function MatchNavigation({
  primaryButtonText,
  onPrimaryClick,
  primaryDisabled = false,
  secondaryButtonText,
  onSecondaryClick,
  secondaryIsLink = false,
  secondaryHref = "",
  secondaryVariant = "ghost",
}: MatchNavigationProps) {
  const SecondaryButton = () => (
    <Button
      type="button"
      variant={secondaryVariant}
      className="w-full"
      onClick={onSecondaryClick}
    >
      {secondaryButtonText}
    </Button>
  );

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="w-full"
        onClick={onPrimaryClick}
        disabled={primaryDisabled}
      >
        {primaryButtonText}
      </Button>

      {secondaryIsLink && secondaryHref ? (
        <Button asChild type="button" variant={secondaryVariant} className="w-full">
          <Link href={secondaryHref}>{secondaryButtonText}</Link>
        </Button>
      ) : (
        <SecondaryButton />
      )}
    </div>
  );
}
