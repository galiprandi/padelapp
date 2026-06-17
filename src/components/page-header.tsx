import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
  /** Optional back link href */
  backHref?: string;
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
  backHref,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3 w-full", alignClasses[align], className)}>
      {backHref && (
        <div className={cn("flex mb-4 animate-in fade-in slide-in-from-left-4 duration-500", align === 'center' && 'justify-center')}>
          <Link
            href={backHref}
            className="group flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-primary transition-all active:scale-95"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/20 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            Volver
          </Link>
        </div>
      )}
      <div className={cn("flex items-center gap-3", align === 'center' && 'justify-center')}>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <h1 
          className={cn(
            "font-black text-foreground tracking-tight animate-in fade-in slide-in-from-left-4 duration-700",
            titleSizes[size],
            titleClassName
          )}
        >
          {title}
        </h1>
      </div>
      
      {description && (
        <div className={cn(
          "text-muted-foreground/80 max-w-3xl animate-in fade-in slide-in-from-left-4 duration-1000",
          align === 'left' ? 'text-left' : align === 'center' ? 'mx-auto text-center' : 'ml-auto text-right',
          {
            'text-sm font-medium leading-relaxed': typeof description === 'string',
          },
          descriptionClassName
        )}>
          {description}
        </div>
      )}
      
      {action && (
        <div className={cn(
          "pt-2",
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
