"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  formatErrorDetails,
  getAppErrorContainerClasses,
  getErrorIconContainerClasses,
  getErrorActionButtonClasses,
} from "@/lib/error-utils";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  const details = formatErrorDetails(error, {
    section: "esta sección",
    fallbackMessage:
      "No pudimos cargar esta página. Intentá de nuevo o volvé al inicio.",
  });

  return (
    <div
      role="region"
      aria-label={details.regionAriaLabel}
      className={getAppErrorContainerClasses()}
    >
      <div className={getErrorIconContainerClasses()}>
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
          className={getErrorActionButtonClasses()}
        >
          <RotateCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Reintentar
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={getErrorActionButtonClasses()}
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
