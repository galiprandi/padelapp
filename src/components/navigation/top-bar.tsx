import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TopBarProps {
  title?: string;
  backHref?: string;
  rightAction?: ReactNode;
  showLogo?: boolean;
  className?: string;
}

export function TopBar({
  title,
  backHref,
  rightAction,
  showLogo = false,
  className,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-4",
        className,
      )}
    >
      <div className="flex min-w-[80px] items-center">
        {backHref ? (
          <Link
            href={backHref}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Volver
          </Link>
        ) : showLogo ? (
          <Link href="/me" className="flex items-center gap-2">
            <img src="/icon.svg" alt="PadelApp" className="h-7 w-7" />
            <span className="text-sm font-bold text-foreground">PadelApp</span>
          </Link>
        ) : null}
      </div>

      {title && (
        <h1 className="truncate text-sm font-bold text-foreground">{title}</h1>
      )}

      <div className="flex min-w-[80px] items-center justify-end">
        {rightAction}
      </div>
    </header>
  );
}
