"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { formatErrorDetails } from "@/lib/error-utils";
import {
  getNetworkErrorActionGroupClasses,
  getNetworkErrorButtonClasses,
  getNetworkErrorDescriptionClasses,
  getNetworkErrorHomeButtonText,
  getNetworkErrorIconBadgeClasses,
  getNetworkErrorResetButtonText,
  getNetworkErrorTitleClasses,
} from "./graph-utils";

export default function NetworkError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Network error:", error);
  }, [error]);

  const details = formatErrorDetails(error, {
    section: "la red",
    fallbackMessage:
      "Ocurrió un problema al obtener el mapa de contactos. Podés reintentar o volver al inicio.",
  });

  return (
    <div
      role="region"
      aria-label={details.regionAriaLabel}
      className={details.containerClasses}
    >
      <div className={getNetworkErrorIconBadgeClasses()}>
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h1 className={getNetworkErrorTitleClasses()}>{details.title}</h1>
        <p className={getNetworkErrorDescriptionClasses()}>
          {details.message}
        </p>
      </div>
      <div className={getNetworkErrorActionGroupClasses()}>
        <Button
          onClick={reset}
          variant="default"
          size="sm"
          aria-label={details.retryAriaLabel}
          className={getNetworkErrorButtonClasses()}
        >
          <RotateCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {getNetworkErrorResetButtonText()}
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={getNetworkErrorButtonClasses()}
        >
          <Link
            href="/me"
            prefetch={true}
            aria-label={details.homeAriaLabel}
          >
            <Home className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {getNetworkErrorHomeButtonText()}
          </Link>
        </Button>
      </div>
    </div>
  );
}
