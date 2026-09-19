"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { formatErrorDetails } from "@/lib/error-utils";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Profile error:", error);
  }, [error]);

  const details = formatErrorDetails(error, {
    section: "el perfil",
    fallbackMessage:
      "Ocurrió un problema al obtener el perfil de este jugador. Podés reintentar o volver al inicio.",
  });

  return (
    <div
      role="region"
      aria-label={details.regionAriaLabel}
      className={details.containerClasses}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">{details.title}</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          {details.message}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={reset}
          variant="default"
          size="sm"
          aria-label={details.retryAriaLabel}
          className="active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        >
          <RotateCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Reintentar
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        >
          <Link
            href="/me"
            prefetch={true}
            aria-label={details.homeAriaLabel}
          >
            <Home className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
