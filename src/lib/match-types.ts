export type MatchTypeValue = "FRIENDLY" | "LOCAL_TOURNAMENT";

export type PlayerOption = {
  id: string;
  displayName: string;
  email: string;
  image: string | null;
};

export type SlotValue =
  | { kind: "user"; player: PlayerOption }
  | { kind: "placeholder"; displayName: string };

export type TeamState = Record<TeamKey, [SlotValue | null, SlotValue | null]>;

export type TeamKey = "A" | "B";

export type ActiveSlot = { team: TeamKey; index: 0 | 1 };

export type StepIndex = 0 | 1 | 2;
