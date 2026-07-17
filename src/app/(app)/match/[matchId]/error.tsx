"use client";

import { AlertCircle, RotateCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function MatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Match error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">
          No se pudo cargar el partido
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Es posible que el partido no exista o que haya un problema de conexión.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} variant="default" size="sm">
          <RotateCw className="mr-1 h-4 w-4" />
          Reintentar
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/match">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Mis partidos
          </Link>
        </Button>
      </div>
    </div>
  );
}
