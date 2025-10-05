import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Neutral empty-state block with optional CTA.
 * Use it when a section has no data but we still want to reinforce the next step.
 */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-center",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
