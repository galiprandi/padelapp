import type { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import {
  getEmptyStateAriaLabel,
  getEmptyStateContainerClasses,
  getEmptyStateIconBadgeClasses,
  getEmptyStateContentClasses,
  getEmptyStateTitleClasses,
  getEmptyStateDescriptionClasses,
  getEmptyStateActionWrapperClasses,
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
        <div className={getEmptyStateIconBadgeClasses()}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <div className={getEmptyStateContentClasses()}>
        <h3 className={getEmptyStateTitleClasses()}>{title}</h3>
        <p className={getEmptyStateDescriptionClasses()}>
          {description}
        </p>
      </div>
      {action ? (
        <div className={getEmptyStateActionWrapperClasses()}>{action}</div>
      ) : null}
    </div>
  );
}
