import type { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import {
  getEmptyStateAriaLabel,
  getEmptyStateContainerClasses,
} from "./empty-state-utils";

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
  const ariaLabel = getEmptyStateAriaLabel(title, description);

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={getEmptyStateContainerClasses(className)}
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
