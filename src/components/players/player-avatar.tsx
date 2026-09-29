import Image from "next/image";

import {
  isSafeAvatarImage,
  getPlayerAvatarAriaLabel,
  getPlayerAvatarClasses,
  getPlayerAvatarDimensionStyle,
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
  const style = getPlayerAvatarDimensionStyle(size);

  const hasSafeImage = isSafeAvatarImage(image);
  const avatarAriaLabel = getPlayerAvatarAriaLabel(name, hasSafeImage);

  return (
    <div
      className={getPlayerAvatarClasses(className)}
      style={style}
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
