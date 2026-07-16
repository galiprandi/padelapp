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

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <Icon className="h-8 w-8 text-muted-foreground mb-3" aria-hidden="true" />
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
