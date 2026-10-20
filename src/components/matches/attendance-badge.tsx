import { Check, Clock, X } from "lucide-react";
import {
  type AttendanceStatus,
  getAttendanceBadgeAriaLabel,
  getAttendanceBadgeContainerClasses,
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
  const containerClasses = getAttendanceBadgeContainerClasses(status, className);
  const ariaLabel = getAttendanceBadgeAriaLabel(status);
  const Icon = ATTENDANCE_ICONS[status];

  if (!label || !Icon) return null;

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={containerClasses}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}
