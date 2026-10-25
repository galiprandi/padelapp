"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  formatErrorDetails,
  getErrorIconContainerClasses,
  getErrorHeadingTitleClasses,
  getErrorMessageDescriptionClasses,
  getErrorActionGroupClasses,
  getErrorActionButtonClasses,
  getErrorRetryButtonText,
  getErrorHomeButtonText,
} from "@/lib/error-utils";

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Catalog error:", error);
  }, [error]);

  const details = formatErrorDetails(error, {
    section: "el catálogo de componentes",
    fallbackMessage:
      "Ocurrió un problema al renderizar los componentes del sistema de diseño. Podés reintentar o volver al inicio.",
    customContainerClassName: "max-w-md mx-auto min-h-[60vh]",
  });

  return (
    <div
      role="region"
      aria-label={details.regionAriaLabel}
      className={details.containerClasses}
    >
      <div className={getErrorIconContainerClasses()}>
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h1 className={getErrorHeadingTitleClasses()}>{details.title}</h1>
        <p className={getErrorMessageDescriptionClasses()}>
          {details.message}
        </p>
      </div>
      <div className={getErrorActionGroupClasses()}>
        <Button
          onClick={reset}
          variant="default"
          size="sm"
          aria-label={details.retryAriaLabel}
          className={getErrorActionButtonClasses()}
        >
          <RotateCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {getErrorRetryButtonText()}
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
            {getErrorHomeButtonText()}
          </Link>
        </Button>
      </div>
    </div>
  );
}
