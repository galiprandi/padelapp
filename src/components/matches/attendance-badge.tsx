import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AttendanceStatus = "ATTENDED" | "LATE" | "NO_SHOW";

interface AttendanceBadgeProps {
  status: AttendanceStatus | null;
  className?: string;
}

const CONFIG: Record<
  AttendanceStatus,
  { label: string; icon: typeof Check; className: string }
> = {
  ATTENDED: {
    label: "Presente",
    icon: Check,
    className:
      "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  },
  LATE: {
    label: "Tarde",
    icon: Clock,
    className:
      "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  },
  NO_SHOW: {
    label: "No asistió",
    icon: X,
    className:
      "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
  },
};

export function AttendanceBadge({ status, className }: AttendanceBadgeProps) {
  if (!status) return null;

  const config = CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      aria-label={`Asistencia: ${config.label}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold shadow-xs",
        config.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
