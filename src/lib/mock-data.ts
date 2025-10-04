export const mockTurns = [
  {
    id: "abc123",
    club: "Padel City",
    level: 4,
    date: "Sáb 18 Ene",
    time: "18:00",
    slots: { taken: 6, total: 8 },
  },
  {
    id: "def456",
    club: "La Nave",
    level: 5,
    date: "Dom 19 Ene",
    time: "10:30",
    slots: { taken: 3, total: 4 },
  },
];

export const mockMatches = [
  {
    id: "match-01",
    score: "6-4, 3-6, [10-7]",
    winners: "Juan & Lucas",
    losers: "María & Sofía",
  },
  {
    id: "match-02",
    score: "6-2, 6-3",
    winners: "Paula & Nico",
    losers: "Agus & Javi",
  },
];

export const mockRanking = [
  { position: 1, name: "Juan Pérez", level: 4, points: 1280, trend: "+2" },
  { position: 2, name: "María López", level: 4, points: 1205, trend: "+1" },
  { position: 3, name: "Lucas Fernández", level: 5, points: 1188, trend: "-1" },
];

export const mockReputation = {
  score: 96,
  message: "¡Excelente! Ninguna ausencia en tus últimos 8 turnos.",
};

export const levelOptions = [
  { value: "1", label: "Nivel 1 · Profesional" },
  { value: "2", label: "Nivel 2 · Alta Competición" },
  { value: "3", label: "Nivel 3 · Avanzado Plus" },
  { value: "4", label: "Nivel 4 · Avanzado" },
  { value: "5", label: "Nivel 5 · Intermedio Plus" },
  { value: "6", label: "Nivel 6 · Intermedio" },
  { value: "7", label: "Nivel 7 · Principiante Plus" },
  { value: "8", label: "Nivel 8 · Principiante" },
];
