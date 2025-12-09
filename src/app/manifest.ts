import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "🎾 PadelApp",
    short_name: "🎾 PadelApp",
    start_url: "/",
    display: "standalone",
    background_color: "#fef9c3",
    theme_color: "#facc15",
    lang: "es",
    description:
      "Organiza turnos, registra partidos y escala en el ranking de pádel desde tu móvil.",
    icons: [
      {
        src: "/icons/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/logo.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
