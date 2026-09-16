import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  isSafeAvatarImage,
  getPlayerAvatarAriaLabel,
} from "./player-card-utils";

export interface PlayerAvatarProps {
  name: string;
  image?: string;
  className?: string;
  size?: number;
  "aria-hidden"?: boolean | "true" | "false";
}

export function getPlayerInitials(name: string): string {
  // Strip out non-alphanumeric characters to avoid security warning flow-throughs
  const sanitized = name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
  return sanitized
    .split(" ")
    .map((segment) => segment[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PlayerAvatar({
  name,
  image,
  className,
  size = 40,
  "aria-hidden": ariaHidden,
}: PlayerAvatarProps) {
  const initials = getPlayerInitials(name);
  const dimension = `${size}px`;

  const hasSafeImage = isSafeAvatarImage(image);
  const avatarAriaLabel = getPlayerAvatarAriaLabel(name, hasSafeImage);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-primary border border-border shadow-xs overflow-hidden",
        className,
      )}
      style={{ width: dimension, height: dimension }}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : avatarAriaLabel}
    >
      {hasSafeImage && image ? (
        <Image
          src={image}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full rounded-lg object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
