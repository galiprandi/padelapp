import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type TextAlign = "left" | "center" | "right";
type TitleSize = "sm" | "md" | "lg" | "xl" | "2xl";

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
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const titleSizes: Record<TitleSize, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
  "2xl": "text-4xl",
};

export function PageHeader({
  title,
  description,
  action,
  icon,
  align = "left",
  size = "md",
  className,
  titleClassName,
  descriptionClassName,
  actionClassName,
  backHref,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-2 w-full", alignClasses[align], className)}>
      {backHref && (
        <div
          className={cn("flex mb-3", align === "center" && "justify-center")}
        >
          <Link
            href={backHref}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      )}
      <div
        className={cn(
          "flex items-center gap-2",
          align === "center" && "justify-center",
        )}
      >
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <h1
          className={cn(
            "font-bold text-foreground tracking-tight",
            titleSizes[size],
            titleClassName,
          )}
        >
          {title}
        </h1>
      </div>

      {description && (
        <div
          className={cn(
            "text-sm text-muted-foreground max-w-3xl",
            align === "left"
              ? "text-left"
              : align === "center"
                ? "mx-auto text-center"
                : "ml-auto text-right",
            descriptionClassName,
          )}
        >
          {description}
        </div>
      )}

      {action && (
        <div
          className={cn(
            "pt-2",
            {
              "flex justify-center": align === "center",
              "flex justify-end": align === "right",
            },
            actionClassName,
          )}
        >
          {action}
        </div>
      )}
    </header>
  );
}
