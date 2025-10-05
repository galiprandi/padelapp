import Image from "next/image";

import { cn } from "@/lib/utils";

export interface PlayerAvatarProps {
  name: string;
  image?: string;
  className?: string;
  size?: number;
}

export function getPlayerInitials(name: string): string {
  return name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PlayerAvatar({ name, image, className, size = 40 }: PlayerAvatarProps) {
  const initials = getPlayerInitials(name);
  const dimension = `${size}px`;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary",
        className,
      )}
      style={{ width: dimension, height: dimension }}
    >
      {image ? (
        <Image src={image} alt={name} width={size} height={size} className="h-full w-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
