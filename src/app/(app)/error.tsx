"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

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

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">
          Algo salió mal
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          No pudimos cargar esta página. Intentá de nuevo o volvé al inicio.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} variant="default" size="sm">
          <RotateCw className="mr-1 h-4 w-4" />
          Reintentar
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/me">
            <Home className="mr-1 h-4 w-4" />
            Inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
