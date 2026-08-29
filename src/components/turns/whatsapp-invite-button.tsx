"use client";

import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { formatWhatsAppInviteMessage, formatWhatsAppGroupInviteMessage } from "@/components/turns/turn-utils";
import { useToast } from "@/components/toast/use-toast";

interface WhatsAppInviteButtonProps {
  club: string;
  date: Date | string;
  contactName: string;
  openSlots: number;
  shareUrl: string;
}

export function WhatsAppInviteButton({
  club,
  date,
  contactName,
  openSlots,
  shareUrl,
}: WhatsAppInviteButtonProps) {
  const { showToast } = useToast();

  const whatsappUrl = useMemo(() => {
    const message = formatWhatsAppInviteMessage({
      club,
      date,
      contactName,
      openSlots,
      shareUrl,
    });

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [date, contactName, club, openSlots, shareUrl]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!whatsappUrl) {
      e.preventDefault();
      return;
    }
    showToast(`Abriste WhatsApp para invitar a ${contactName}.`);
  };

  return (
    <a
      href={whatsappUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition-all hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] gap-1.5 shrink-0"
      aria-label={`Invitar a ${contactName} por WhatsApp para sumar al turno en ${club}`}
      onClick={handleClick}
    >
      <MessageSquare className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      <span>Invitar</span>
    </a>
  );
}

interface WhatsAppGroupInviteButtonProps {
  club: string;
  date: Date | string;
  openSlots: number;
  shareUrl: string;
  variant?: "default" | "outline" | "amber";
  className?: string;
}

export function WhatsAppGroupInviteButton({
  club,
  date,
  openSlots,
  shareUrl,
  variant = "default",
  className,
}: WhatsAppGroupInviteButtonProps) {
  const { showToast } = useToast();

  const whatsappUrl = useMemo(() => {
    const message = formatWhatsAppGroupInviteMessage({
      club,
      date,
      openSlots,
      shareUrl,
    });

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [date, club, openSlots, shareUrl]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!whatsappUrl) {
      e.preventDefault();
      return;
    }
    showToast("Abriste WhatsApp para enviar la invitación al grupo.");
  };

  const variantStyles =
    variant === "amber"
      ? "bg-amber-600 text-white hover:bg-amber-700 border-transparent"
      : variant === "outline"
        ? "border border-border text-foreground bg-card hover:bg-muted shadow-xs"
        : "bg-emerald-600 text-white hover:bg-emerald-700 border-transparent";

  const slotsText =
    openSlots === 1 ? "1 jugador" : `${openSlots} jugadores`;

  return (
    <a
      href={whatsappUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] gap-1.5 shrink-0 ${variantStyles} ${className ?? ""}`}
      aria-label={`Invitar a grupo de WhatsApp para sumar ${slotsText} al turno en ${club}`}
      onClick={handleClick}
    >
      <MessageSquare className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      <span>Grupo WhatsApp</span>
    </a>
  );
}
