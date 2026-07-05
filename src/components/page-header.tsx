import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, Cpu } from "lucide-react";

type TextAlign = 'left' | 'center' | 'right';
type TitleSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  align?: TextAlign;
  size?: TitleSize;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionClassName?: string;
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
    <header className={cn("space-y-4 w-full relative", alignClasses[align], className)}>
      {backHref && (
        <div className={cn("flex mb-4 animate-in fade-in slide-in-from-left-4 duration-500", align === 'center' && 'justify-center')}>
          <Link
            href={backHref}
            className="group flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-all active:scale-95"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:text-primary">
              <ChevronLeft className="h-4 w-4" />
            </div>
            BACK_CMD
          </Link>
        </div>
      )}

      <div className={cn("flex items-center gap-3", align === 'center' && 'justify-center')}>
        <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20 rounded md:hidden">
          <Cpu className="h-3 w-3 text-primary" />
          <span className="text-[8px] font-mono text-primary uppercase">HUD_v1</span>
        </div>
      </div>

      <div className={cn("flex items-center gap-3", align === 'center' && 'justify-center')}>
        {icon && <div className="text-primary">{icon}</div>}
        <h1 
          className={cn(
            "font-black text-white tracking-tighter italic uppercase animate-in fade-in slide-in-from-left-4 duration-700",
            titleSizes[size],
            titleClassName
          )}
        >
          {title}
        </h1>
      </div>
      
      {description && (
        <div className={cn(
          "text-white/50 font-mono text-[10px] uppercase tracking-widest max-w-3xl animate-in fade-in slide-in-from-left-4 duration-1000",
          align === 'left' ? 'text-left' : align === 'center' ? 'mx-auto text-center' : 'ml-auto text-right',
          descriptionClassName
        )}>
          {description}
        </div>
      )}
      
      {action && (
        <div className={cn(
          "pt-4",
          {
            'flex justify-center': align === 'center',
            'flex justify-end': align === 'right',
          },
          actionClassName
        )}>
          {action}
        </div>
      )}

      {/* Decorative HUD line */}
      <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-primary/40 to-transparent opacity-30" />
    </header>
  );
}
