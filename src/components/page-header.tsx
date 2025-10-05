import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Standard page header with title, description, and optional CTA.
 * Keeps consistent spacing across mobile-first views.
 */
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 text-center", className)}>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
