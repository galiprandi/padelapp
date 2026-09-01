import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center shadow-xs",
        className,
      )}
    >
      {Icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border shadow-xs">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
          {description}
        </p>
      </div>
      {action ? (
        <div className="mt-4 w-full flex justify-center">{action}</div>
      ) : null}
    </div>
  );
}
