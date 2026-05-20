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
        "flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">{description}</p>
      </div>
      {action ? <div className="pt-2 w-full flex justify-center">{action}</div> : null}
    </div>
  );
}
