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
    className: "bg-emerald-500/10 text-emerald-600",
  },
  LATE: {
    label: "Tarde",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600",
  },
  NO_SHOW: {
    label: "Ausente",
    icon: X,
    className: "bg-red-500/10 text-red-600",
  },
};

export function AttendanceBadge({ status, className }: AttendanceBadgeProps) {
  if (!status) return null;

  const config = CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        config.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
