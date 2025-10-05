# Especificación barra de navegación inferior

- Camino: componente móvil persistente (`BottomNav`).
- Estado: Implemented

## Objetivo
Ofrecer navegación principal en mobile para usuarios autenticados, enlazando a `/ranking`, `/match` y `/me` con interacción táctil clara y soporte PWA.

## Alcance y visibilidad
- Mostrar la barra en todas las vistas tras completar el perfil y mientras el usuario esté autenticado.
- Ocultar en onboarding, auth y cualquier pantalla modal a pantalla completa (definir en layout global cuando aplique).

## Requisitos funcionales
- Tres acciones principales: `Ranking`, `Partidos`, `Perfil`.
- Cada acción combina ícono + etiqueta corta; usar `next/link`.
- Determinar el activo comparando la ruta actual (incluye subrutas: `/ranking`, `/match`, `/me`).
- El activo aplica estado visual diferenciado y atributo `aria-current="page"`.
- Área táctil mínima de 44x44 px por ítem.
- Badge de notificaciones global opcional, mostrando ícono de campana (`Bell`) + contador de pendientes; anclar arriba a la derecha de la barra o del ítem que corresponda según UX final.

## Diseño y estilo
- Altura fija: 48 px; ancho completo.
- Fondo plano y oscuro (`bg-zinc-900` o equivalente), conservar borde superior sutil y padding inferior con `env(safe-area-inset-bottom)`.
- Íconos de `lucide-react` (`Trophy` para Ranking, `User` para Perfil); ícono personalizado de pelota de tenis para Partidos; fallback a emoji si falla la carga. Usar `text-primary` para el color base de los íconos.
- Solo íconos visibles (sin labels); mantener nombres accesibles mediante `aria-label` o contenido `sr-only`.
- Estado activo: ícono en alto contraste (`text-foreground`) y barra superior de 2 px en color de contraste; inactivos usan `text-muted-foreground` con cambio a `text-foreground` al focus/hover.
- Estética flat: evitar elevación o sombras volumétricas y mantener bordes rectos (sin `rounded`).

## Comportamiento
- Contenedor `position: fixed` en `bottom: 0` y `left: 0`, `right: 0`; z-index por encima del contenido principal.
- Ajustar desplazamiento con `visualViewport` para evitar solapamiento con teclado virtual: cuando el viewport reduce más de 150 px, trasladar la barra con `transform` para mantenerse visible sin cubrir inputs.
- Transiciones sutiles (<150 ms) en cambios de activo y aparición/desaparición del badge.
- Mantener enfoque visible al navegar con teclado (outline personalizado).

## Accesibilidad
- Asignar `role="navigation"` y `aria-label="Barra de navegación inferior"`.
- Cada enlace presenta texto visible; no se requiere anuncio adicional para lectores al estado activo (se confía en `aria-current`).
- Respetar contraste mínimo 4.5:1 entre texto/ícono y fondo en estados activo/inactivo.

## Responsive
- Optimizada para anchos de 320 a 768 px.
- En tablets, incrementar padding horizontal a 24 px y centrar el grupo de ítems; mantener íconos a 24 px.
- Desktop: mantener barra a modo mobile hasta definir layout alternativo.

## Dependencias
- `lucide-react` para iconografía.
- Paleta de colores definida en tema shadcn amarillo (`tailwind.config.ts`).

## Pruebas sugeridas
- Validar navegación táctil en simuladores iOS (Safari) y Android (Chrome).
- Confirmar actualización de `aria-current` al cambiar de ruta.
- Verificar safe area y ajuste con teclado en iPhone con notch y Android con teclado flotante.
- Comprobar render correcto del badge cuando hay notificaciones pendientes.

## Preguntas abiertas
- ¿El badge de campana se vincula a una vista específica (ej. `/notifications`)?
- ¿Se requiere configuración para ocultar la barra en pantallas de detalle fullscreen (ej. reproductor o scanner)?
