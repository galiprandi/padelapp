"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  formatErrorDetails,
  getAppErrorContainerClasses,
  getErrorIconContainerClasses,
  getErrorAlertIconClasses,
  getErrorActionButtonIconClasses,
  getErrorTextGroupClasses,
  getErrorActionButtonClasses,
  getErrorRetryButtonText,
  getErrorHomeButtonText,
  getErrorHeadingTitleClasses,
  getErrorMessageDescriptionClasses,
  getErrorActionGroupClasses,
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
  );
}
