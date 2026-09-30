"use client";

import { AlertCircle, RotateCw, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { formatErrorDetails } from "@/lib/error-utils";

export default function NewMatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("New match form error:", error);
  }, [error]);

  const details = formatErrorDetails(error, {
    section: "el formulario de nuevo partido",
    fallbackMessage:
      "Ocurrió un problema al preparar la creación de un nuevo partido. Podés reintentar o volver a tus partidos.",
    homeDestinationLabel: "ver partidos",
    customContainerClassName: "max-w-md mx-auto min-h-[60vh]",
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
          <Link href="/match" prefetch={true} aria-label={details.homeAriaLabel}>
            <CalendarDays className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Ver partidos
          </Link>
        </Button>
      </div>
    </div>
  );
}
