import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  primaryLoading = false,
  secondaryButtonText,
  onSecondaryClick,
  secondaryIsLink = false,
  secondaryHref = "",
  secondaryVariant = "ghost",
}: MatchNavigationProps) {
  return (
    <div
      role="region"
      aria-label="Navegación de pasos del partido"
      className="flex flex-col gap-2"
    >
      <Button
        type="button"
        className="w-full h-12 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
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
          className={cn(
            "w-full h-10 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
            secondaryVariant === "ghost"
              ? "text-muted-foreground hover:text-foreground"
              : "",
          )}
        >
          <Link href={secondaryHref} prefetch={true}>
            {secondaryButtonText}
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant={secondaryVariant}
          className={cn(
            "w-full h-10 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
            secondaryVariant === "ghost"
              ? "text-muted-foreground hover:text-foreground"
              : "",
          )}
          onClick={onSecondaryClick}
        >
          {secondaryButtonText}
        </Button>
      )}
    </div>
  );
}
