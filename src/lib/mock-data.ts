export interface LevelOption {
  value: string;
  label: string;
  description?: string;
}

export const levelOptions: LevelOption[] = [
  { value: "1", label: "Nivel 1 · Profesional", description: "Profesionales o jugadores de 1ra categoría." },
  { value: "2", label: "Nivel 2 · Alta Competición", description: "Jugadores de 2da categoría con nivel competitivo alto." },
  { value: "3", label: "Nivel 3 · Avanzado Plus", description: "3ra categoría. Juego rápido, dinámico y táctico." },
  { value: "4", label: "Nivel 4 · Avanzado", description: "4ta categoría. Golpes consistentes, control de paredes y juego aéreo." },
  { value: "5", label: "Nivel 5 · Intermedio Plus", description: "5ta categoría. Manejo regular de paredes y voleas consistentes." },
  { value: "6", label: "Nivel 6 · Intermedio", description: "6ta categoría. Peloteos estables, aprendiendo juego de pared." },
  { value: "7", label: "Nivel 7 · Principiante Plus", description: "7ma categoría. Algunos partidos jugados, golpes aún inconsistentes." },
  { value: "8", label: "Nivel 8 · Principiante", description: "8va categoría o iniciación. Empezando a jugar partidos." },
];
