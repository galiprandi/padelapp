"use client";

import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import {
  getWhatsAppInviteUrl,
  getWhatsAppGroupInviteUrl,
  getWhatsAppInviteSuccessToast,
  getWhatsAppGroupInviteSuccessToast,
  getWhatsAppInviteAriaLabel,
  getWhatsAppGroupInviteAriaLabel,
  getWhatsAppInviteButtonText,
  getWhatsAppGroupInviteButtonText,
  getFallbackWhatsAppShareUrl,
  getWhatsAppGroupInviteVariantClasses,
  getWhatsAppInviteButtonClasses,
  getWhatsAppGroupInviteButtonClasses,
} from "@/components/turns/turn-utils";
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
    return getWhatsAppInviteUrl({
      club,
      date,
      contactName,
      openSlots,
      shareUrl,
    });
  }, [date, contactName, club, openSlots, shareUrl]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!whatsappUrl) {
      e.preventDefault();
      return;
    }
    showToast(getWhatsAppInviteSuccessToast(contactName));
  };

  return (
    <a
      href={whatsappUrl || getFallbackWhatsAppShareUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={getWhatsAppInviteButtonClasses()}
      aria-label={getWhatsAppInviteAriaLabel(contactName, club)}
      onClick={handleClick}
    >
      <MessageSquare className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      <span>{getWhatsAppInviteButtonText()}</span>
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
    return getWhatsAppGroupInviteUrl({
      club,
      date,
      openSlots,
      shareUrl,
    });
  }, [date, club, openSlots, shareUrl]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!whatsappUrl) {
      e.preventDefault();
      return;
    }
    showToast(getWhatsAppGroupInviteSuccessToast());
  };

  const variantStyles = getWhatsAppGroupInviteVariantClasses(variant);

  return (
    <a
      href={whatsappUrl || getFallbackWhatsAppShareUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={getWhatsAppGroupInviteButtonClasses(variantStyles, className)}
      aria-label={getWhatsAppGroupInviteAriaLabel(openSlots, club)}
      onClick={handleClick}
    >
      <MessageSquare className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      <span>{getWhatsAppGroupInviteButtonText()}</span>
    </a>
  );
}
