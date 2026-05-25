export const levelLabels: Record<number, string> = {
  1: "Profesional",
  2: "Alta Competición",
  3: "Avanzado Plus",
  4: "Avanzado",
  5: "Intermedio Plus",
  6: "Intermedio",
  7: "Principiante Plus",
  8: "Principiante",
};

export const levelOptions = Object.entries(levelLabels).map(([value, label]) => ({
  value,
  label: `Nivel ${value} · ${label}`,
}));
