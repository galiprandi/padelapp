export interface CategoryDefinition {
  level: number;
  label: string;
  shortLabel: string;
  description: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    level: 1,
    label: "1ª Categoría",
    shortLabel: "1ª Cat.",
    description: "Nivel profesional o alta competencia. Máxima potencia, precisión y lectura táctica.",
  },
  {
    level: 2,
    label: "2ª Categoría",
    shortLabel: "2ª Cat.",
    description: "Nivel avanzado superior. Ritmo de juego muy alto, variantes ofensivas y gran movilidad.",
  },
  {
    level: 3,
    label: "3ª Categoría",
    shortLabel: "3ª Cat.",
    description: "Nivel avanzado. Dominio sólido de bandejas, víboras, bajadas de pared y control de globos.",
  },
  {
    level: 4,
    label: "4ª Categoría",
    shortLabel: "4ª Cat.",
    description: "Nivel intermedio alto. Regularidad constante, buen uso de paredes y voleas profundas.",
  },
  {
    level: 5,
    label: "5ª Categoría",
    shortLabel: "5ª Cat.",
    description: "Nivel intermedio. Control en rallies sostenidos, voleas seguras y buen posicionamiento.",
  },
  {
    level: 6,
    label: "6ª Categoría",
    shortLabel: "6ª Cat.",
    description: "Nivel aficionado regular. Manejo de saques, paredes básicas y transiciones a la red.",
  },
  {
    level: 7,
    label: "7ª Categoría",
    shortLabel: "7ª Cat.",
    description: "Nivel principiante avanzado. Intercambios continuos, saques consistentes y primeros rebotes.",
  },
  {
    level: 8,
    label: "8ª Categoría",
    shortLabel: "8ª Cat.",
    description: "Nivel iniciación. Primeros pasos en la cancha, aprendiendo reglas, saques y golpes básicos.",
  },
];

export function getCategoryDefinition(level?: number | null): CategoryDefinition {
  const targetLevel = level && level >= 1 && level <= 8 ? level : 6;
  return CATEGORIES.find((cat) => cat.level === targetLevel) ?? CATEGORIES[5];
}
