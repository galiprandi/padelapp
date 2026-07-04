"use client";

import { useTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Clock, MapPin, Users, Trophy, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { levelOptions } from "@/lib/mock-data";
import { joinTurnAction } from "@/app/(app)/turnos/actions";

interface MatchDayHeroProps {
  item: {
    id: string;
    type: "turn" | "match";
    date: Date;
    data: any;
  };
  viewerId: string;
}

export function MatchDayHero({ item, viewerId }: MatchDayHeroProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const { type, data, date } = item;

  useEffect(() => {
    setMounted(true);
  }, []);

  const timeStr = date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isMatch = type === "match";
  // The structure of data depends on type. MatchResultCompactMatch for match, Turn for turn.
  // We need to carefully access properties that might differ.
  const club = isMatch ? (data as any).club : (data as any).club;
  const creatorId = (data as any).creatorId;
  const isJoined = (data.players as any[]).some((p) => (p.userId === viewerId || p.user?.id === viewerId));
  const isCreator = creatorId === viewerId;

  const levelLabel = !isMatch && (data as any).suggestedLevel
    ? levelOptions.find(l => l.value === (data as any).suggestedLevel?.toString())?.label ?? (data as any).suggestedLevel.toString()
    : "Partido";

  const handleQuickJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const res = await joinTurnAction(data.id);
      if (res.status === "ok") {
        router.refresh();
      }
    });
  };

  return (
    <div className="relative group animate-in fade-in zoom-in-95 duration-1000">
      {/* Ambient Lighting */}
      <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />

      <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-card/40 backdrop-blur-2xl shadow-2xl shadow-primary/10 p-8">
        {/* Top Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
          {isMatch ? <Trophy className="h-32 w-32 text-primary" /> : <Zap className="h-32 w-32 text-primary" />}
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
              <Zap className="h-3 w-3 fill-current animate-bounce" />
              ¡Hoy jugás!
            </div>
            <div className="flex items-center gap-2 text-primary font-black">
              <Clock className="h-4 w-4" />
              <span className="text-xl tracking-tight min-w-[70px]">
                {mounted ? timeStr : "--:--"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter leading-none">{club || "Club por definir"}</h2>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              {isMatch ? "Partido Confirmado" : "Turno Abierto"} • {(data as any).duration || 90} min
            </p>
          </div>

          <div className="flex items-center gap-8 py-4 border-y border-border/10">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground/60">
                <Users className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Equipo</span>
              </div>
              <div className="flex -space-x-2">
                {(data.players as any[]).slice(0, 4).map((p, i) => {
                  const name = p.user?.alias ?? p.user?.displayName ?? "P";
                  return (
                    <PlayerAvatar
                      key={i}
                      name={name}
                      image={p.user?.image ?? undefined}
                      size={32}
                      className="border-2 border-background ring-1 ring-primary/10"
                    />
                  );
                })}
                {!isMatch && (data as any).maxPlayers && (data.players as any[]).length < (data as any).maxPlayers && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-dashed border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                    +{(data as any).maxPlayers - (data.players as any[]).length}
                  </div>
                )}
              </div>
            </div>

            {!isMatch && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Nivel</span>
                </div>
                <p className="font-black text-primary tracking-tight">{levelLabel}</p>
              </div>
            )}

            {isMatch && (data as any).courtNumber && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cancha</span>
                </div>
                <p className="font-black tracking-tight">{(data as any).courtNumber}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {isMatch ? (
              <Button asChild size="lg" className="h-16 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98]">
                <Link href={`/match/${data.id}`}>
                  Ver Partido
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : isJoined ? (
              <Button asChild size="lg" variant="secondary" className="h-16 rounded-[1.5rem] font-black text-lg active:scale-[0.98]">
                <Link href={`/t/${data.id}`}>
                  Detalles del Turno
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-16 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98]"
                onClick={handleQuickJoin}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5 fill-current" />
                    Unirse Ahora
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
