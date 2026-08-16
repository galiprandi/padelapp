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
          query || isPending ? "text-primary" : "text-muted-foreground",
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
        className="h-12 pl-11 pr-11 rounded-xl bg-card border-border placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background transition-colors shadow-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute inset-y-0 right-3.5 my-auto h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-[0.95] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {isPending && (
        <div className="absolute -bottom-px left-6 right-6 h-px bg-primary/30 overflow-hidden rounded-full">
          <div className="h-full bg-primary w-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
