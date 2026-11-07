"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  formatErrorDetails,
  getRootErrorContainerClasses,
  getErrorIconContainerClasses,
  getErrorAlertIconClasses,
  getErrorActionButtonIconClasses,
  getErrorTextGroupClasses,
  getErrorActionButtonClasses,
  getErrorRetryButtonText,
  getErrorHomeButtonText,
  getErrorHeadingTitleClasses,
  getErrorMessageDescriptionClasses,
  getErrorCardContentClasses,
  getErrorActionGroupClasses,
} from "@/lib/error-utils";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error boundary caught exception:", error);
  }, [error]);

  const details = formatErrorDetails(error, {
    fallbackMessage:
      "No pudimos cargar esta sección de la aplicación. Podés reintentar o volver al panel principal.",
  });

  return (
    <main
      role="region"
      aria-label={details.regionAriaLabel}
      className={getRootErrorContainerClasses()}
    >
      <div className={getErrorCardContentClasses()}>
        <div className={getErrorIconContainerClasses()}>
          <AlertCircle className={getErrorAlertIconClasses()} aria-hidden="true" />
        </div>
        <div className={getErrorTextGroupClasses()}>
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
            <RotateCw className={getErrorActionButtonIconClasses()} aria-hidden="true" />
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
              <Home className={getErrorActionButtonIconClasses()} aria-hidden="true" />
              {getErrorHomeButtonText()}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
