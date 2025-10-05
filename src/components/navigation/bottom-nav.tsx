"use client";

import type { ComponentType, SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Trophy, User } from "lucide-react";

import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  activeIcon?: ComponentType<SVGProps<SVGSVGElement>>;
}

const MatchGlyphIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 2048 2048"
    fill="none"
    stroke="currentColor"
    strokeWidth={120}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M1024 0q141 0 272 36t245 103t207 160t160 208t103 245t37 272q0 141-36 272t-103 245t-160 207t-208 160t-245 103t-272 37q-141 0-272-36t-245-103t-207-160t-160-208t-103-244t-37-273q0-141 36-272t103-245t160-207t208-160T751 37t273-37m0 128q-123 0-237 32t-214 90t-182 141t-140 181t-91 214t-32 238q0 65 9 128q122-2 219-49t174-123t131-174t95-203q24-66 54-130t68-125t81-116t98-103q-8-1-16-1t-17 0M165 1279q32 108 90 204t136 174t174 136t204 90q8-140 62-252t141-199t198-151t233-109q66-24 138-60t139-82t123-103t90-121q-30-120-90-225t-146-190t-190-145t-225-91q-65 34-121 90t-102 123t-83 139t-60 138q-45 122-109 233t-151 197t-199 141t-252 63m859 641q123 0 237-32t214-90t182-141t140-181t91-214t32-238v-16q0-8-1-17q-47 53-102 97t-116 82t-125 67t-131 55q-105 39-203 94t-174 132t-123 173t-49 220q63 9 128 9" />
  </svg>
);

const MatchGlyphSolidIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 2048 2048" fill="currentColor" aria-hidden {...props}>
    <path d="M1024 0q141 0 272 36t245 103t207 160t160 208t103 245t37 272q0 141-36 272t-103 245t-160 207t-208 160t-245 103t-272 37q-141 0-272-36t-245-103t-207-160t-160-208t-103-244t-37-273q0-141 36-272t103-245t160-207t208-160T751 37t273-37m0 128q-123 0-237 32t-214 90t-182 141t-140 181t-91 214t-32 238q0 65 9 128q122-2 219-49t174-123t131-174t95-203q24-66 54-130t68-125t81-116t98-103q-8-1-16-1t-17 0M165 1279q32 108 90 204t136 174t174 136t204 90q8-140 62-252t141-199t198-151t233-109q66-24 138-60t139-82t123-103t90-121q-30-120-90-225t-146-190t-190-145t-225-91q-65 34-121 90t-102 123t-83 139t-60 138q-45 122-109 233t-151 197t-199 141t-252 63m859 641q123 0 237-32t214-90t182-141t140-181t91-214t32-238v-16q0-8-1-17q-47 53-102 97t-116 82t-125 67t-131 55q-105 39-203 94t-174 132t-123 173t-49 220q63 9 128 9" />
  </svg>
);

const TrophySolidIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M6 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v1.5a4.5 4.5 0 0 1-3.8 4.437A6 6 0 0 1 13 15.74V17h2.5a1.5 1.5 0 0 1 0 3H8.5a1.5 1.5 0 0 1 0-3H11v-1.26a6 6 0 0 1-4.2-4.803A4.5 4.5 0 0 1 3 6.5V5a1 1 0 0 1 1-1h2Zm0 2H5v1.5A2.5 2.5 0 0 0 7.5 9h.119A4.5 4.5 0 0 1 6 5Zm12 0a4.5 4.5 0 0 1-1.619 4H16.5A2.5 2.5 0 0 0 19 6.5V5h-1Z" />
  </svg>
);

const UserSolidIcon: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    <path d="M4 19.25A7.25 7.25 0 0 1 11.25 12h1.5A7.25 7.25 0 0 1 20 19.25V21H4Z" />
  </svg>
);

const NAV_ITEMS: BottomNavItem[] = [
  { href: "/ranking", label: "Ranking", icon: Trophy, activeIcon: TrophySolidIcon },
  { href: "/match", label: "Partidos", icon: MatchGlyphIcon, activeIcon: MatchGlyphSolidIcon },
  { href: "/me", label: "Perfil", icon: User, activeIcon: UserSolidIcon },
];

export interface BottomNavProps {
  className?: string;
  notificationsCount?: number;
  notificationsHref?: string;
  position?: "fixed" | "static";
}

export function BottomNav({ className, notificationsCount = 0, notificationsHref, position = "fixed" }: BottomNavProps) {
  const pathname = usePathname();
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (position !== "fixed") {
      setKeyboardOffset(0);
      return undefined;
    }

    const viewport = window.visualViewport;

    if (!viewport) {
      return undefined;
    }

    const updateOffset = () => {
      const heightReduction = window.innerHeight - viewport.height;
      setKeyboardOffset(heightReduction > 150 ? heightReduction - 150 : 0);
    };

    updateOffset();

    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);

    return () => {
      viewport.removeEventListener("resize", updateOffset);
      viewport.removeEventListener("scroll", updateOffset);
    };
  }, [position]);

  const notificationsTarget = useMemo(() => {
    if (!notificationsHref) {
      return undefined;
    }
    return notificationsHref;
  }, [notificationsHref]);

  const displayBadge = notificationsCount > 0;

  return (
    <nav
      role="navigation"
      aria-label="Barra de navegación inferior"
      className={cn(
        position === "fixed"
          ? "fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[env(safe-area-inset-bottom,0px)]"
          : "mx-auto flex w-full justify-center",
        className,
      )}
      style={position === "fixed"
        ? { transform: keyboardOffset ? `translateY(-${keyboardOffset}px)` : undefined, transition: "transform 150ms ease" }
        : undefined}
    >
      <div className="relative flex h-12 w-full items-stretch justify-evenly border-t border-border/70 bg-zinc-900">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex flex-1 items-center justify-center transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
                "min-h-[48px]",
                isActive ? "text-primary" : "text-primary/70 hover:text-primary",
              )}
              aria-label={item.label}
            >
              <Icon className="h-6 w-6" aria-hidden />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}

        {displayBadge ? (
          <Link
            href={notificationsTarget ?? "#"}
            aria-label="Notificaciones"
            className="absolute -top-3 right-4 flex h-8 min-w-[32px] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground shadow transition-transform duration-150 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Bell className="mr-1 h-4 w-4" aria-hidden />
            <span>{notificationsCount}</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export default BottomNav;
