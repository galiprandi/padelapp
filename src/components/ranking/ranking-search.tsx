"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function RankingSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== (searchParams.get("q") ?? "")) {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }

        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="relative group animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
      <div className={cn(
        "absolute inset-0 bg-primary/5 blur-xl rounded-2xl transition-opacity duration-500",
        isPending ? "opacity-100" : "opacity-0"
      )} />
      <div className="relative">
        <Search className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300",
          isPending ? "text-primary animate-pulse" : "text-muted-foreground/40"
        )} />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar jugador por nombre o alias..."
          className="h-14 pl-11 pr-11 rounded-2xl bg-card/40 border-border/40 backdrop-blur-md focus:bg-card/60 transition-all font-black text-sm placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] placeholder:text-muted-foreground/30"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/20 text-muted-foreground/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
