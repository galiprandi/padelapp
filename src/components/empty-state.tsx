import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

/**
 * Neutral empty-state block with optional CTA and Icon.
 * Refined to V9+ standards with high-impact typography and tactile feel.
 */
export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-6 rounded-[2.5rem] border border-border/40 bg-card/40 px-8 py-16 text-center backdrop-blur-md shadow-lg shadow-primary/5 animate-in fade-in zoom-in-95 duration-700",
        className,
      )}
    >
      {Icon && (
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 shadow-inner border border-primary/20 transition-transform hover:rotate-3">
          <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-50" />
          <Icon className="relative h-10 w-10 text-primary animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-xl font-black tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-100">
          {title}
        </h3>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground/60 max-w-[280px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200">
          {description}
        </p>
      </div>
      {action ? (
        <div className="pt-4 w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          {action}
        </div>
      ) : null}
    </div>
  );
}
