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
 * Use it when a section has no data but we still want to reinforce the next step.
 */
export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 rounded-3xl border border-solid border-border/40 bg-card/50 px-10 py-16 text-center backdrop-blur-sm shadow-sm",
        className,
      )}
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 shadow-inner border border-primary/10">
          <Icon className="h-7 w-7 text-primary/80" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-[260px] mx-auto">{description}</p>
      </div>
      {action ? <div className="pt-2 w-full flex justify-center">{action}</div> : null}
    </div>
  );
}
