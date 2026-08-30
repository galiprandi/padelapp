"use client";

import { AlertCircle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function InstallGuideError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Install guide error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-4 max-w-md mx-auto min-h-[60vh]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">
          No pudimos cargar la guía de instalación
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Ocurrió un problema al obtener los pasos de instalación de la app. Podés reintentar o volver al inicio.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} variant="default" size="sm" className="active:scale-[0.98] transition-all">
          <RotateCw className="mr-1.5 h-4 w-4" />
          Reintentar
        </Button>
        <Button asChild variant="outline" size="sm" className="active:scale-[0.98] transition-all">
          <Link href="/me" prefetch={true}>
            <Home className="mr-1.5 h-4 w-4" />
            Ir al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
