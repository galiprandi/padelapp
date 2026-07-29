import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Padel Red",
    short_name: "PadelRed",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    lang: "es",
    description:
      "Organiza turnos, registra partidos y escala en el ranking de pádel desde tu móvil.",
    categories: ["sports", "lifestyle", "social"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Nuevo turno",
        short_name: "Turno",
        description: "Crear un nuevo turno de pádel",
        url: "/turnos/nuevo?source=pwa",
        icons: [
          { src: "/icons/shortcut-turno.png", sizes: "96x96", type: "image/png" },
          { src: "/icons/shortcut-turno.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      {
        name: "Mi Dashboard",
        short_name: "Inicio",
        description: "Ver tu agenda y próximos partidos",
        url: "/me?source=pwa",
        icons: [
          { src: "/icons/shortcut-dashboard.png", sizes: "96x96", type: "image/png" },
          { src: "/icons/shortcut-dashboard.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      {
        name: "Ranking",
        short_name: "Ranking",
        description: "Ver el ranking de jugadores",
        url: "/ranking?source=pwa",
        icons: [
          { src: "/icons/shortcut-ranking.png", sizes: "96x96", type: "image/png" },
          { src: "/icons/shortcut-ranking.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
    ],
    share_target: {
      action: "/share-target",
      method: "GET",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  };
}
