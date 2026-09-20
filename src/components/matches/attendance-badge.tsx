import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type AttendanceStatus,
  getAttendanceBadgeAriaLabel,
  getAttendanceBadgeClasses,
  getAttendanceBadgeLabel,
} from "./attendance-utils";

interface AttendanceBadgeProps {
  status: AttendanceStatus | null;
  className?: string;
}

const ATTENDANCE_ICONS: Record<AttendanceStatus, typeof Check> = {
  ATTENDED: Check,
  LATE: Clock,
  NO_SHOW: X,
};

export function AttendanceBadge({ status, className }: AttendanceBadgeProps) {
  if (!status) return null;

  const label = getAttendanceBadgeLabel(status);
  const badgeClasses = getAttendanceBadgeClasses(status);
  const ariaLabel = getAttendanceBadgeAriaLabel(status);
  const Icon = ATTENDANCE_ICONS[status];

  if (!label || !Icon) return null;

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold shadow-xs",
        badgeClasses,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}
