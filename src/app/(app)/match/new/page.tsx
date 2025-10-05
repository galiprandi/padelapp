"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import appSettings from "@/config/app-settings.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShareButton } from "@/components/share/share-button";
import { createMatchAction, type CreateMatchInput, type CreateMatchResponse, type SlotPayload } from "../actions";
import { Share2, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";

const MATCH_TYPE_OPTIONS = [
  { value: "FRIENDLY", label: "Amistoso" },
  { value: "LOCAL_TOURNAMENT", label: "Torneo local" },
] as const;

const MIN_SETS = 1;
const MAX_SETS = 5;

const PLACEHOLDER_SLOTS: Array<{ team: TeamKey; index: 0 | 1; name: string }> = [
  { team: "A", index: 1, name: "Jugador 2" },
  { team: "B", index: 0, name: "Jugador 3" },
  { team: "B", index: 1, name: "Jugador 4" },
];

type MatchTypeValue = CreateMatchInput["matchType"];
type TeamKey = "A" | "B";
type PlayerOption = {
  id: string;
  displayName: string;
  email: string;
  image: string | null;
};

type SlotValue =
  | { kind: "user"; player: PlayerOption }
  | { kind: "placeholder"; displayName: string };

type TeamState = Record<TeamKey, [SlotValue | null, SlotValue | null]>;

type ActiveSlot = { team: TeamKey; index: 0 | 1 };

type StepIndex = 0 | 1 | 2;

interface ManageSlotModalProps {
  open: boolean;
  slot: SlotValue | null;
  placeholderName: string;
  onSave: (name: string) => void;
  onShare: (name: string) => void;
  onClose: () => void;
}

function ManageSlotModal({ open, slot, placeholderName, onSave, onShare, onClose }: ManageSlotModalProps) {
  const [name, setName] = useState(placeholderName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const initialName =
        slot?.kind === "user"
          ? slot.player.displayName
          : slot?.kind === "placeholder"
            ? slot.displayName
            : placeholderName;
      setName(initialName);
      setError(null);
    }
  }, [open, slot, placeholderName]);

  if (!open) {
    return null;
  }

  function handleAccept() {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Ingresá un nombre");
      return;
    }
    setError(null);
    onSave(trimmed);
  }

  function handleShare() {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Ingresá un nombre antes de compartir");
      return;
    }
    onShare(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-foreground">Gestionar jugador</h2>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              id="slot-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Diego Morales"
            />
            <Button type="button" size="icon" variant="ghost" aria-label="Compartir enlace" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleAccept}>
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}

function createPlaceholderSlot(name: string): SlotValue {
  return {
    kind: "placeholder",
    displayName: name,
  };
}

function buildInitialState(): TeamState {
  const state: TeamState = {
    A: [null, null],
    B: [null, null],
  };

  PLACEHOLDER_SLOTS.forEach(({ team, index, name }) => {
    state[team][index] = createPlaceholderSlot(name);
  });

  return state;
}

function positionFromTeam(team: TeamKey, index: 0 | 1): number {
  return team === "A" ? index : index + 2;
}

function describeSlot(team: TeamKey, index: 0 | 1): string {
  const teamName = team === "A" ? "Pareja A" : "Pareja B";
  return `${teamName} · Jugador ${index + 1}`;
}

function avatarFallback(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

export default function RegisterMatchPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [matchType, setMatchType] = useState<MatchTypeValue>("FRIENDLY");
  const [sets, setSets] = useState<string>("3");
  const [countsForRanking, setCountsForRanking] = useState<boolean>(true);
  const [club, setClub] = useState("");
  const [courtNumber, setCourtNumber] = useState("");
  const [teamState, setTeamState] = useState<TeamState>(() => buildInitialState());
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>({ team: "A", index: 1 });
  const [manageModal, setManageModal] = useState<{ open: boolean; team: TeamKey; index: 0 | 1 }>({
    open: false,
    team: "A",
    index: 1,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreateMatchResponse | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  const userId = session?.user?.id;
  const userDisplayName = session?.user?.displayName ?? session?.user?.name ?? "Jugador";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image ?? null;

  useEffect(() => {
    if (!userId) {
      return;
    }

    const option: PlayerOption = {
      id: userId,
      displayName: userDisplayName,
      email: userEmail,
      image: userImage,
    };

    setTeamState((previous) => {
      const next: TeamState = {
        A: [...previous.A] as [SlotValue | null, SlotValue | null],
        B: [...previous.B] as [SlotValue | null, SlotValue | null],
      };

      // Remove the user from any other slot.
      (["A", "B"] as const).forEach((team) => {
        ([0, 1] as const).forEach((index) => {
          if (team === "A" && index === 0) {
            return;
          }

          const slot = next[team][index];
          if (slot?.kind === "user" && slot.player.id === option.id) {
            const placeholderName =
              PLACEHOLDER_SLOTS.find((candidate) => candidate.team === team && candidate.index === index)?.name ??
              `Jugador ${positionFromTeam(team, index) + 1}`;
            next[team][index] = createPlaceholderSlot(placeholderName);
          }
        });
      });

      next.A[0] = { kind: "user", player: option };

      // Ensure placeholders remain for empty slots.
      PLACEHOLDER_SLOTS.forEach(({ team, index, name }) => {
        if (!next[team][index]) {
          next[team][index] = createPlaceholderSlot(name);
        }
      });

      return next;
    });
  }, [userId, userDisplayName, userEmail, userImage]);

  const setsValue = Number.parseInt(sets, 10);
  const setsValid = !Number.isNaN(setsValue) && setsValue >= MIN_SETS && setsValue <= MAX_SETS;

  function updateSlot(team: TeamKey, index: 0 | 1, value: SlotValue | null) {
    setTeamState((previous) => {
      const next: TeamState = {
        A: [...previous.A] as [SlotValue | null, SlotValue | null],
        B: [...previous.B] as [SlotValue | null, SlotValue | null],
      };
      next[team][index] = value;
      return next;
    });
  }

  function handlePlaceholder(displayName: string) {
    updateSlot(manageModal.team, manageModal.index, {
      kind: "placeholder",
      displayName,
    });
    setManageModal((previous) => ({ ...previous, open: false }));
  }

  function goToNextStep() {
    setFormError(null);

    if (currentStep === 0) {
      const allFilled = (["A", "B"] as const).every((team) =>
        ([0, 1] as const).every((index) => Boolean(teamState[team][index])),
      );
      if (!allFilled) {
        setFormError("Completá los cuatro jugadores antes de continuar.");
        return;
      }
    }

    if (currentStep === 1 && !setsValid) {
      setFormError(`Ingresá una cantidad de sets entre ${MIN_SETS} y ${MAX_SETS}.`);
      return;
    }

    setCurrentStep((prev) => (prev + 1 > 2 ? prev : ((prev + 1) as StepIndex)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToPreviousStep() {
    setFormError(null);
    setCurrentStep((prev) => (prev - 1 < 0 ? prev : ((prev - 1) as StepIndex)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCreateMatch() {
    if (!setsValid) {
      setFormError(`Ingresá una cantidad de sets entre ${MIN_SETS} y ${MAX_SETS}.`);
      setCurrentStep(1);
      return;
    }

    const slotsPayload: SlotPayload[] = [];

    (["A", "B"] as const).forEach((team) => {
      ([0, 1] as const).forEach((index) => {
        const slot = teamState[team][index];
        if (!slot) {
          return;
        }

        const position = positionFromTeam(team, index);
        if (slot.kind === "user") {
          slotsPayload.push({ kind: "user", position, team, userId: slot.player.id });
        } else {
          slotsPayload.push({
            kind: "placeholder",
            position,
            team,
            displayName: slot.displayName,
          });
        }
      });
    });

    setFormError(null);
    startSubmit(async () => {
      const payload: CreateMatchInput = {
        sets: setsValue,
        matchType,
        countsForRanking,
        format: "DOUBLES",
        teamLabels: {
          A: "Pareja A",
          B: "Pareja B",
        },
        club: club.trim().length > 0 ? club.trim() : null,
        courtNumber: courtNumber.trim().length > 0 ? courtNumber.trim() : null,
        score: null,
        notes: null,
        slots: slotsPayload,
      };

      const response = await createMatchAction(payload);

      if (response.status === "ok") {
        setSuccess(response);
      } else {
        setFormError(response.message ?? "No pudimos crear el partido.");
      }
    });
  }

  function handleCloseManageModal() {
    setManageModal((previous) => ({ ...previous, open: false }));
  }

  function handleSaveSlotName(nameToSave: string) {
    const trimmed = nameToSave.trim();
    if (trimmed.length === 0) {
      handleCloseManageModal();
      return;
    }

    if (manageModal.team === "A" && manageModal.index === 0) {
      handleCloseManageModal();
      return;
    }

    handlePlaceholder(trimmed);
  }

  async function handleShareIntent(nameToShare: string) {
    const trimmed = nameToShare.trim();
    if (trimmed.length === 0) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: appSettings.share.inviteTitle,
          text: `Sumate al partido como ${trimmed}`,
          url: appSettings.baseUrl,
        });
        return;
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("navigator.share failed", error);
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(appSettings.share.clipboardCopy).catch(() => undefined);
    }
  }

  const modalSlot = manageModal.open ? teamState[manageModal.team][manageModal.index] : null;

  if (success?.status === "ok") {
    return (
      <div className="flex min-h-[calc(100dvh-140px)] flex-col justify-center gap-8 px-5">
        <div className="space-y-6">
          <PageHeader
            title="Partido creado"
            description="Compartí el enlace para que los demás confirmen asistencia."
            className="text-center"
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Link principal</p>
            <div className="rounded-lg border border-border/70 bg-background p-3">
              <p className="break-words text-sm text-foreground">{success.shareUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ShareButton
                  url={success.shareUrl ?? ""}
                  size="sm"
                  variant="secondary"
                  copyMessage="Link principal copiado"
                  successMessage="Link compartido"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Compartir</span>
                  </span>
                </ShareButton>
                <Button type="button" size="sm" variant="secondary" asChild>
                  <Link href={`https://wa.me/?text=${encodeURIComponent(success.shareUrl ?? "")}`} target="_blank">
                    Compartir por WhatsApp
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {success.slots && success.slots.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Links por cupo</p>
              <div className="space-y-2">
                {success.slots.map((slot) => (
                  <div
                    key={slot.playerId}
                    className="space-y-1 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3 text-sm"
                  >
                    <p className="font-medium text-foreground">{slot.teamLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {describeSlot(slot.team, (slot.position % 2) as 0 | 1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {slot.occupied
                        ? slot.displayName ?? "Ocupado"
                        : slot.displayName ?? "Pendiente de confirmar"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <ShareButton
                        url={slot.link}
                        size="sm"
                        variant="secondary"
                        copyMessage="Link copiado"
                        successMessage="Invitación compartida"
                      />
                      <Button type="button" size="sm" variant="secondary" asChild>
                        <Link
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `¡Sumate al partido desde este enlace: ${slot.link}`,
                          )}`}
                          target="_blank"
                        >
                          Enviar por WhatsApp
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Button asChild variant="outline">
            <Link href={`/match/${success.matchId}`}>Ver partido</Link>
          </Button>
        </div>
      </div>
    );
  }

  function renderSlot(team: TeamKey, index: 0 | 1) {
    const slot = teamState[team][index];
    const isPrimary = team === "A" && index === 0;
    const isActive = activeSlot.team === team && activeSlot.index === index;
    const position = positionFromTeam(team, index);
    const placeholderName = `Jugador ${position + 1}`;

    const displayName =
      slot?.kind === "user"
        ? slot.player.displayName
        : slot?.kind === "placeholder"
          ? slot.displayName
          : isPrimary
            ? userDisplayName
            : placeholderName;

    return (
      <div
        key={`${team}-${index}`}
        role="button"
        tabIndex={0}
        onClick={() => setActiveSlot({ team, index })}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            setActiveSlot({ team, index });
          }
        }}
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 ${isActive ? "border-primary bg-primary/10" : "border-border bg-muted/40"
          }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary">
          {slot?.kind === "user" && slot.player.image ? (
            <Image
              alt={slot.player.displayName}
              src={slot.player.image}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : slot?.kind === "user" ? (
            avatarFallback(slot.player.displayName)
          ) : (
            position + 1
          )}
        </div>
        <p className="flex-1 truncate text-sm font-semibold text-foreground">{displayName}</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              slot?.kind === "placeholder"
                ? "Gestionar nombre del cupo"
                : slot?.kind === "user"
                  ? "Cambiar jugador"
                  : isPrimary
                    ? "Seleccionar jugador principal"
                    : "Asignar jugador"
            }
            onClick={(event) => {
              event.stopPropagation();
              setActiveSlot({ team, index });
              setManageModal({ open: true, team, index });
            }}
          >
            <UsersRound className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  function renderStepContent() {
    const baseClass = "flex min-h-[calc(100dvh-160px)] flex-col justify-between gap-8";

    if (currentStep === 0) {
      return (
        <section className={baseClass}>
          <div className="space-y-6">
            <PageHeader
              title="Seleccioná los jugadores"
              className="mb-6"
            />

            <div className="grid gap-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">Pareja A</p>
                {([0, 1] as const).map((index) => renderSlot("A", index))}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">Pareja B</p>
                {([0, 1] as const).map((index) => renderSlot("B", index))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Tocá el botón de acción en cada jugador para definir el nombre y preparar el enlace de invitación.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button type="button" className="w-full" onClick={goToNextStep}>
              Siguiente
            </Button>
            <Button asChild type="button" variant="ghost" className="w-full">
              <Link href="/match">Cancelar</Link>
            </Button>
          </div>
        </section>
      );
    }

    if (currentStep === 1) {
      return (
        <section className={baseClass}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tipo de partido</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="match-type">Tipo</Label>
                <select
                  id="match-type"
                  className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm"
                  value={matchType}
                  onChange={(event) => setMatchType(event.target.value as MatchTypeValue)}
                >
                  {MATCH_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sets">Cantidad de sets</Label>
                <Input
                  id="sets"
                  inputMode="numeric"
                  type="number"
                  min={MIN_SETS}
                  max={MAX_SETS}
                  value={sets}
                  onChange={(event) => setSets(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="counts-ranking">Ranking</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="counts-ranking"
                    checked={countsForRanking}
                    onCheckedChange={(checked) => setCountsForRanking(checked)}
                  />
                  <span className="text-sm text-foreground">Acumula ranking</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si está activo, el resultado impactará en tu posición del ranking.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button type="button" className="w-full" onClick={goToNextStep} disabled={!setsValid}>
              Continuar
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={goToPreviousStep}>
              Atrás
            </Button>
          </div>
        </section>
      );
    }

    return (
      <section className={baseClass}>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Sumá detalles opcionales</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="club">Club (opcional)</Label>
              <Input
                id="club"
                placeholder="Ej: Padel City"
                value={club}
                onChange={(event) => setClub(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="court">Número de cancha (opcional)</Label>
              <Input
                id="court"
                placeholder="Ej: 3"
                value={courtNumber}
                onChange={(event) => setCourtNumber(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="button" className="w-full" onClick={handleCreateMatch} disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear partido"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={goToPreviousStep}>
            Atrás
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pb-12">
      {renderStepContent()}

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <ManageSlotModal
        open={manageModal.open}
        slot={modalSlot}
        placeholderName={`Jugador ${positionFromTeam(manageModal.team, manageModal.index) + 1}`}
        onSave={handleSaveSlotName}
        onShare={handleShareIntent}
        onClose={handleCloseManageModal}
      />
    </div>
  );
}
