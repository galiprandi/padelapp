# 🎨 PadelApp Design System

Este documento define la identidad visual y los patrones de diseño de PadelApp.

## 🫧 Estética "Bubble"
PadelApp utiliza una estética moderna, suave y "amigable" basada en curvas pronunciadas y profundidad sutil.

### Radios de Borde (Border Radius)
- **Base Components**: `rounded-xl` (12px) - Para botones, inputs y tarjetas de jugador.
- **Main Containers / Modals**: `rounded-3xl` (24px) - Para secciones principales, modales y bloques de agrupación (como `PairPreview`).
- **Icons / Avatars**: `rounded-full` - Para elementos circulares puros.

### Profundidad y Capas
- **Glassmorphism**: Uso de `backdrop-blur-sm` y `bg-muted/10` o `bg-card/80` para capas que se superponen.
- **Bordes**: `border-border/50` o `border-border/60` para separaciones sutiles sin sobrecargar la vista.

## 📝 Tipografía
- **Títulos de Sección**: `text-lg font-bold tracking-tight` para encabezados internos.
- **Subheaders**: `uppercase tracking-widest text-[10px] font-bold text-muted-foreground` para etiquetas pequeñas sobre contenedores.

## 📋 Componentes Estándar

### Empty States
Utilizar siempre el componente `EmptyState` en lugar de tarjetas manuales.
- **Padding**: `p-10`
- **Radio**: `rounded-3xl`
- **Icono**: Fondo `bg-primary/10` con sombra interna.

### Player Cards
- **Contenedores**: `rounded-xl` con fondo `bg-muted/30`.
- **Interacción**: `active:scale-[0.98]` (implícito en botones) y `hover:bg-muted/50`.

## 🎨 Paleta de Colores
Dominada por el **Amarillo Padel** (`primary`) sobre fondos neutros limpios.
- Primary: Amarillo vibrante para CTAs y elementos destacados.
- Muted: Grises suaves para fondos de contenedores.
