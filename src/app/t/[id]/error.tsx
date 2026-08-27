"use client";

import { AlertCircle, RotateCw, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function TurnPublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Turn public error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">
          No pudimos cargar el turno
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Es posible que el turno haya sido eliminado o que haya un problema de conexión.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset} variant="default" size="sm" className="active:scale-[0.98] transition-all">
          <RotateCw className="mr-1 h-4 w-4" />
          Reintentar
        </Button>
        <Button asChild variant="outline" size="sm" className="active:scale-[0.98] transition-all">
          <Link href="/turnos" prefetch={true}>
            <Calendar className="mr-1 h-4 w-4" />
            Explorar turnos
          </Link>
        </Button>
      </div>
    </div>
  );
}
