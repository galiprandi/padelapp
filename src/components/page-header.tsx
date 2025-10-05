import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TextAlign = 'left' | 'center' | 'right';
type TitleSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface PageHeaderProps {
  /** Main title of the page */
  title: string;
  /** Optional subtitle or description */
  description?: string | ReactNode;
  /** Optional call-to-action component (e.g., Button) */
  action?: ReactNode;
  /** Optional icon before the title */
  icon?: ReactNode;
  /** Text alignment */
  align?: TextAlign;
  /** Size of the title */
  size?: TitleSize;
  /** Additional class names */
  className?: string;
  /** Additional class names for the title */
  titleClassName?: string;
  /** Additional class names for the description */
  descriptionClassName?: string;
  /** Additional class names for the action container */
  actionClassName?: string;
}

const alignClasses: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const titleSizes: Record<TitleSize, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
  '2xl': 'text-5xl',
};

/**
 * Flexible page header component with title, description, and optional CTA.
 * Supports different alignments, sizes, and includes responsive design.
 * 
 * @example
 * ```tsx
 * <PageHeader 
 *   title="Nuevo Partido"
 *   description="Invita jugadores y configura el partido"
 *   action={<Button>Crear Partido</Button>}
 *   align="left"
 *   size="lg"
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  action,
  icon,
  align = 'left',
  size = 'md',
  className,
  titleClassName,
  descriptionClassName,
  actionClassName,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3 w-full", alignClasses[align], className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <h1 
          className={cn(
            "font-bold text-foreground tracking-tight",
            titleSizes[size],
            titleClassName
          )}
        >
          {title}
        </h1>
      </div>
      
      {description && (
        <p className={cn(
          "text-muted-foreground max-w-3xl text-left", // Aseguramos alineación izquierda
          {
            'text-sm': typeof description === 'string',
          },
          descriptionClassName
        )}>
          {description}
        </p>
      )}
      
      {action && (
        <div className={cn(
          "pt-1",
          {
            'flex justify-center': align === 'center',
            'flex justify-end': align === 'right',
          },
          actionClassName
        )}>
          {action}
        </div>
      )}
    </header>
  );
}
