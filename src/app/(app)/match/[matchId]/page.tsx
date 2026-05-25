import { getMatchByIdAction } from '@/app/(app)/match/actions';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { MatchPlayersManager } from "@/components/matches/match-players-manager";
import { PlusCircle, FileText } from "lucide-react";
import Link from "next/link";

interface MatchPageProps {
  params: Promise<{
    matchId: string;
  }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { matchId } = await params;
  // Obtener datos del match pero no renderizar nada
  const result = await getMatchByIdAction(matchId);

  if (!result.match) {
    return (
      <PageHeader
        title="Partido no encontrado"
        description="El partido que estás buscando no se encuentra. Sin embargo, puedes crear uno nuevo."
        action={
          <Button
            asChild
            variant="default"
            className="w-full justify-center py-2 text-base"
          >
            <Link href="/match/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Partido
            </Link>
          </Button>
        }
      />
    );
  }
  const match = result.match;

  // Verificar si el partido está cerrado (tiene resultado o está confirmado)
  const isClosed = Boolean(match.score) || match.status === 'CONFIRMED';

  // Agrupar jugadores por equipo
  const teamsMap = new Map();
  match.players.forEach(player => {
    if (player.teamId) {
      if (!teamsMap.has(player.teamId)) {
        teamsMap.set(player.teamId, {
          id: player.teamId,
          label: player.team?.label || `Equipo ${player.teamId.slice(-4)}`,
          players: []
        });
      }
      const displayName = player.displayName || player.user?.displayName || `Jugador ${player.position + 1}`;
      teamsMap.get(player.teamId).players.push({
        id: player.id,
        userId: player.userId,
        name: displayName,
        image: player.user?.image,
        isConfirmed: player.resultConfirmed,
        category: player.user ? 5 : undefined, // Placeholder para categoría
        placeholderName: player.displayName || displayName,
      });
    }
  });

  const teams = Array.from(teamsMap.values());

  // Transform match data for MatchResultCompact component
  const matchResultData = {
    id: match.id,
    createdAt: match.createdAt,
    score: match.score,
    status: match.status,
    players: match.players.map(player => ({
      id: player.id,
      position: player.position,
      user: player.user ? {
        id: player.user.id,
        displayName: player.user.displayName,
        image: player.user.image
      } : null
    }))
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Partido ${getMatchTypeLabel(match.matchType)}`}
        description={
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={match.status === 'CONFIRMED' ? 'success' : 'default'} className="uppercase text-[10px] tracking-widest font-bold">
                {match.status === 'PENDING' ? 'Pendiente' : match.status === 'CONFIRMED' ? 'Confirmado' : 'En disputa'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Creado por {match.creator?.displayName || 'Usuario'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {match.club ? `${match.club}` : ''}{match.courtNumber ? ` - Cancha ${match.courtNumber}` : ''}
            </span>
          </div>
        }
        action={
          !isClosed ? (
            <Button
              asChild
              variant="default"
              className="w-full justify-center py-2 text-base rounded-xl shadow-sm shadow-primary/20"
            >
              <Link href={`/match/${match.id}/result`}>
                <FileText className="mr-2 h-5 w-5" />
                Ingresar Resultado
              </Link>
            </Button>
          ) : null
        }
      />

      {isClosed ? (
        <MatchResultCompact
          match={matchResultData}
          matchDate={match.createdAt}
          detailUrl={`/match/${match.id}`}
        />
      ) : (
        <MatchPlayersManager
          teams={teams.map((team) => ({
            id: team.id,
            label: team.label,
            players: team.players.map((player: {
              id: string;
              userId?: string | null;
              name: string;
              image?: string | null;
              isConfirmed?: boolean;
              placeholderName: string;
            }) => ({
              matchPlayerId: player.id,
              userId: player.userId,
              name: player.name,
              image: player.image,
              isConfirmed: player.isConfirmed,
              placeholderName: player.placeholderName,
            })),
          }))}
        />
      )}
    </div>
  );
}

const getMatchTypeLabel = (matchType: string) => {
  switch (matchType) {
    case "FRIENDLY":
      return "amistoso";
    case "LOCAL_TOURNAMENT":
      return "torneo";
    default:
      return matchType;
  }
};
