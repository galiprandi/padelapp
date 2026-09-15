"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  getErrorTitle,
  getErrorMessage,
  getErrorRetryAriaLabel,
  getErrorHomeAriaLabel,
  getErrorRegionAriaLabel,
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

  const title = getErrorTitle();
  const description = getErrorMessage(
    error,
    "No pudimos cargar esta sección de la aplicación. Podés reintentar o volver al panel principal.",
  );

  return (
    <main
      role="region"
      aria-label={getErrorRegionAriaLabel()}
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10"
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            {description}
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            onClick={reset}
            variant="default"
            size="sm"
            aria-label={getErrorRetryAriaLabel()}
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
              aria-label={getErrorHomeAriaLabel()}
            >
              <Home className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Inicio
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
