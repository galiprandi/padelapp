"use client";

import { useEffect, useState, useTransition, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getRankingSearchStatusAriaLabel,
  getRankingRegionAriaLabel,
  getRankingSearchInputAriaLabel,
  getRankingSearchClearAriaLabel,
  getRankingSearchPlaceholder,
  getRankingSearchContainerClasses,
  getRankingSearchInputClasses,
  getRankingSearchClearButtonClasses,
} from "./ranking-utils";

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
    <div
      role="search"
      aria-label={getRankingRegionAriaLabel("search")}
      className={getRankingSearchContainerClasses()}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {getRankingSearchStatusAriaLabel(isPending, query)}
      </div>

      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className={cn(
          "h-4 w-4 transition-colors",
          query || isPending ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
      <Input
        ref={inputRef}
        type="search"
        placeholder={getRankingSearchPlaceholder()}
        aria-label={getRankingSearchInputAriaLabel()}
        aria-busy={isPending}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleClear();
          }
        }}
        autoComplete="off"
        className={getRankingSearchInputClasses()}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={getRankingSearchClearAriaLabel()}
          className={getRankingSearchClearButtonClasses()}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {isPending && (
        <div className="absolute -bottom-px left-6 right-6 h-0.5 bg-primary overflow-hidden rounded-full transition-colors" />
      )}
    </div>
  );
}
