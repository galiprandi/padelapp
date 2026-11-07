"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  formatErrorDetails,
  getErrorIconContainerClasses,
  getErrorAlertIconClasses,
  getErrorActionButtonIconClasses,
  getErrorTextGroupClasses,
  getErrorHeadingTitleClasses,
  getErrorMessageDescriptionClasses,
  getErrorActionGroupClasses,
  getErrorActionButtonClasses,
  getErrorRetryButtonText,
  getErrorHomeButtonText,
} from "@/lib/error-utils";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Login page error:", error);
  }, [error]);

  const details = formatErrorDetails(error, {
    section: "el inicio de sesión",
    fallbackMessage:
      "Ocurrió un problema al preparar la pantalla de acceso. Podés reintentar o volver al inicio.",
    customContainerClassName: "max-w-md mx-auto",
  });

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div
        role="region"
        aria-label={details.regionAriaLabel}
        className={details.containerClasses}
      >
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
              href="/"
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
