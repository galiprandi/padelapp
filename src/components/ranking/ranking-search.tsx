"use client";

import { useEffect, useState, useTransition, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function RankingSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const handleClear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setQuery("");
    inputRef.current?.focus();

    const params = new URLSearchParams(searchParams);
    params.delete("q");
    startTransition(() => {
      router.push(`/ranking?${params.toString()}`, { scroll: false });
    });
  }, [router, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      startTransition(() => {
        router.push(`/ranking?${params.toString()}`, { scroll: false });
      });
    }, 300);

    timeoutRef.current = timer;
    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className={cn(
          "h-4 w-4 transition-colors",
          query ? "text-primary" : "text-muted-foreground/40",
          isPending && "animate-pulse"
        )} />
      </div>
      <Input
        ref={inputRef}
        type="search"
        placeholder="Buscar jugador o alias..."
        aria-label="Buscar jugadores por nombre o alias"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleClear();
          }
        }}
        autoComplete="off"
        className="h-12 pl-11 pr-11 rounded-xl bg-card border-border placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary/20 transition-colors shadow-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute inset-y-0 right-4 flex items-center text-muted-foreground/40 hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {isPending && (
        <div className="absolute -bottom-px left-6 right-6 h-px bg-primary/20 overflow-hidden rounded-full">
          <div className="h-full bg-primary w-1/3 animate-[loading_1s_infinite_linear]" />
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
