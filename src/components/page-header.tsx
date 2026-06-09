import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

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
  /** Optional href for a back button */
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
        <div className={cn("flex items-center mb-1", align === 'center' && 'justify-center')}>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 rounded-xl px-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground active:scale-95 transition-all -ml-2"
          >
            <Link href={backHref}>
              <ChevronLeft className="mr-1 h-3.5 w-3.5" />
              Volver
            </Link>
          </Button>
        </div>
      )}
      <div className={cn("flex items-center gap-3", align === 'center' && 'justify-center')}>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <h1 
          className={cn(
            "font-black text-foreground tracking-tight",
            titleSizes[size],
            titleClassName
          )}
        >
          {title}
        </h1>
      </div>
      
      {description && (
        <div className={cn(
          "text-muted-foreground max-w-3xl",
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
