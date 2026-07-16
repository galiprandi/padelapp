# DESIGN.md – PadelApp

Design policy for **PadelApp**. This document is the single source of truth for UI decisions. All new components and pages must adhere to these maxims.

---

## 1. Design Maxims

### 1.1 Clarity over decoration
Every element must serve a functional purpose. If a visual effect doesn't help the user understand or act, remove it.

**Do:**
```tsx
<h1 className="text-xl font-bold text-foreground">Ranking</h1>
<p className="text-sm text-muted-foreground">Posiciones según resultados confirmados.</p>
```

**Don't:**
```tsx
<PageHeader
  title="Ranking"
  description="Posiciones según resultados confirmados."
  descriptionClassName="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50"
/>
```

### 1.2 Standard Tailwind sizes only
Use Tailwind's built-in spacing, radius, and typography scales. No arbitrary values like `rounded-[2.5rem]`, `h-16`, `blur-[120px]`, or `tracking-[0.2em]`.

**Do:**
```tsx
className="rounded-xl border border-border bg-card p-4"
```

**Don't:**
```tsx
className="rounded-[2.5rem] border border-primary/20 bg-primary/5 p-10 shadow-2xl shadow-primary/10 backdrop-blur-2xl"
```

### 1.3 No ambient lighting or glassmorphism
No `blur-[Npx]` decorative gradients, no `backdrop-blur-*`, no radial lighting divs. Backgrounds are solid or use `bg-card` / `bg-muted`. Avoid semi-transparent background utilities like `bg-muted/30` or `bg-card/50` for primary content containers.

**Do:**
```tsx
<section className="flex flex-col gap-6 bg-muted">
```

**Don't:**
```tsx
<section className="relative">
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary/10 blur-[120px] -z-10" />
  ...
</section>
```

### 1.4 No complex animations
No `animate-in`, `fade-in`, `slide-in-from-bottom-*`, `duration-1000`, or staggered delays. CSS transitions for color/background changes are fine.

**Do:**
```tsx
className="transition-colors hover:bg-muted"
```

**Don't:**
```tsx
className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both"
```

### 1.5 No tactile scale effects
No `active:scale-[0.98]`, `active:scale-90`, or `scale-110` on interactive elements. Use color and border changes for state feedback.

**Do:**
```tsx
className="bg-primary border-primary text-primary-foreground"
```

**Don't:**
```tsx
className="bg-primary border-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-[1.02] active:scale-[0.98]"
```

### 1.6 No PageHeader component
Use plain `<h1>` and `<p>` tags for page headers. Keep titles at `text-xl font-bold` and descriptions at `text-sm text-muted-foreground`.

**Do:**
```tsx
<div>
  <h1 className="text-xl font-bold text-foreground">Nuevo Partido</h1>
  <p className="text-sm text-muted-foreground">Armá tu partido seleccionando las parejas.</p>
</div>
```

**Don't:**
```tsx
<PageHeader title="Nuevo Partido" description="..." size="md" />
```

### 1.7 No heavy shadows
No `shadow-2xl`, `shadow-xl`, or colored shadows like `shadow-primary/20`. Use `shadow-sm` or no shadow at all.

**Do:**
```tsx
className="border border-border bg-card"
```

**Don't:**
```tsx
className="border border-border bg-card shadow-2xl shadow-primary/10"
```

### 1.8 No micro-typography
No `font-black`, no `uppercase`, no `tracking-wider` or `tracking-tight` labels/headings. Use `text-sm font-semibold` for labels, `text-xs text-muted-foreground` for secondary text. Use standard tracking for all text.

**Do:**
```tsx
<Label className="text-sm font-semibold">Club (opcional)</Label>
<span className="text-xs text-muted-foreground">Cupo pendiente</span>
```

**Don't:**
```tsx
<Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Club (opcional)</Label>
```

### 1.9 No oversized buttons
Primary buttons: `h-12`. Secondary buttons: `h-10`. No `h-14`, `h-16`, or custom heights. Standard `rounded-lg` for buttons.

**Do:**
```tsx
<Button className="w-full h-12">Crear partido</Button>
<Button variant="ghost" className="w-full h-10">Cancelar</Button>
```

**Don't:**
```tsx
<Button className="w-full h-16 rounded-[2rem] font-black shadow-2xl shadow-primary/30 text-base active:scale-[0.98]">Crear partido</Button>
```

### 1.10 No decorative background icons
No watermark icons with `opacity-5` or `group-hover:opacity-10`. Icons must be functional and visible.

**Do:**
```tsx
<div className="rounded-xl border border-border bg-card p-4">
  <h2 className="text-sm font-bold">Set 1</h2>
</div>
```

**Don't:**
```tsx
<div className="rounded-[3.5rem] bg-card/40 border border-border/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
  <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10">
    <PlusCircle className="h-48 w-48 text-primary" />
  </div>
  ...
</div>
```

---

## 2. Component Standards

### 2.1 Cards and containers
- Use `rounded-xl border border-border bg-card` for all card-like containers.
- Padding: `p-4` for compact cards, `p-6` for section containers.
- No `backdrop-blur`, no `bg-card/40`, `bg-card/60` or `bg-muted/20` — use solid `bg-card` or `bg-muted`.

### 2.2 Lists and items
- List items: `rounded-xl border border-border bg-card px-4 py-3`.
- Active/selected state: `border-primary bg-primary/5`.
- Gap between items: `gap-2` for tight lists, `gap-3` for cards.

### 2.3 Avatars
- Standard size: `h-10 w-10 rounded-lg`.
- No ring effects, no scale on active state.
- Use `bg-muted` for placeholder avatars.

### 2.4 Badges and status pills
- Use `rounded-md px-2 py-0.5 text-xs font-semibold`.
- Status colors: `bg-primary/10 text-primary` (primary), `bg-muted text-muted-foreground` (neutral), `bg-amber-500/10 text-amber-500` (warning).

### 2.5 Form inputs
- Use shadcn/ui defaults: `h-10 rounded-lg border border-input bg-background`.
- Labels: `text-sm font-semibold`.
- Helper text: `text-xs text-muted-foreground`.

### 2.6 Navigation buttons (MatchNavigation)
- Primary: `w-full h-12` with default Button styling.
- Secondary: `w-full h-10` with `variant="ghost"`.
- Gap: `gap-2` between buttons.

### 2.7 Score selectors
- Grid of buttons: `h-12 rounded-lg border text-lg font-bold`.
- Selected: `bg-primary border-primary text-primary-foreground`.
- Unselected: `bg-card border-border text-muted-foreground hover:bg-muted`.
- Score display: `h-10 w-10 rounded-lg text-xl font-bold`.

### 2.8 Empty states
- Centered content with icon, heading, and description.
- `rounded-xl border border-border bg-card` container.
- Icon: `h-8 w-8 text-muted-foreground mb-3`.
- Heading: `text-sm font-bold`.
- Description: `text-xs text-muted-foreground`.

### 2.9 Recent Form
- Use `bg-emerald-500` for wins (W) and `bg-rose-500` for losses (L).
- Must include Spanish `aria-label` for accessibility (e.g., 'Forma reciente: G, P, G').

---

## 3. Page Structure

### 3.1 Standard page layout
```tsx
<div className="flex flex-col gap-6">
  <div>
    <h1 className="text-xl font-bold text-foreground">Page Title</h1>
    <p className="text-sm text-muted-foreground">Page description.</p>
  </div>
  {/* Content sections */}
</div>
```

### 3.2 Section headers
```tsx
<h2 className="text-sm font-bold text-foreground">Section Name</h2>
```

### 3.3 Spacing
- Page-level gap: `gap-6` between major sections.
- Section-level gap: `gap-3` to `gap-4` between items within a section.
- No `gap-12`, `gap-16`, or `space-y-12`.

### 3.4 Multi-step flows
- Container: `flex min-h-[calc(100dvh-160px)] flex-col justify-between gap-6`.
- Each step uses the standard page layout.
- Navigation buttons pinned at the bottom via `MatchNavigation`.

---

## 4. Color Usage

### 4.1 Primary color (yellow)
- Used for: primary buttons, selected states, active borders, links.
- Never used for: decorative backgrounds, ambient lighting, watermark icons.

### 4.2 Semantic colors
- **Success/confirmed**: `bg-primary/10 text-primary` or `bg-emerald-500/10 text-emerald-500`.
- **Warning/disputed**: `bg-amber-500/10 text-amber-500`.
- **Neutral/pending**: `bg-muted text-muted-foreground`.

### 4.3 Backgrounds
- Page background: default app background.
- Cards: `bg-card`.
- Muted areas: `bg-muted` or `bg-muted/50`.
- No `bg-primary/5`, `bg-primary/10` for large decorative areas.

---

## 5. What was removed (anti-patterns reference)

The following patterns were explicitly removed from the codebase and must not be reintroduced:

| Pattern | Why it was removed |
|---|---|
| `PageHeader` component | Added complexity without value; plain tags are clearer |
| `blur-[100px]` / `blur-[120px]` ambient lighting | Visual noise, no functional purpose |
| `backdrop-blur-2xl` / `backdrop-blur-md` | Glassmorphism hurt readability and performance |
| `animate-in fade-in slide-in-from-bottom-*` | Complex animations distracted from content |
| `duration-1000` with `delay-*` staggered | Artificial delays worsened perceived performance |
| `active:scale-[0.98]` / `scale-110` | Tactile scaling felt inconsistent on mobile |
| `font-black` (weight 900) | Too heavy for mobile-first UI |
| `uppercase tracking-[0.2em]` | Reduced legibility, added visual noise |
| `text-[11px]` micro-labels | Too small for accessibility |
| `rounded-[2rem]` / `rounded-[2.5rem]` / `rounded-[3.5rem]` | Arbitrary values, inconsistent scale |
| `h-14` / `h-16` oversized buttons | Wasted vertical space on mobile |
| `shadow-2xl` / `shadow-primary/20` | Heavy shadows felt outdated |
| Decorative background icons (`opacity-5`) | Added DOM nodes without functional value |
| `bg-card/40` / `bg-card/60` | Semi-transparent backgrounds hurt contrast |

---

## 6. Architecture Notes

### 6.1 Data layer (unchanged)
- **Prisma + PostgreSQL**: Single source of truth.
- **Server Actions**: All mutations go through server actions.
- **Centralized queries**: `src/lib/match-queries.ts` for consistent reads.

### 6.2 Ranking system (unchanged)
- **Formula**: `score = 1000 + (wins * 15) + (streak * 5) + (setsWonBonus)`.
- **Tiebreak**: Score > Attendance > Wins > Recency.
- **Attendance**: Ratio of confirmations over total participations.
- **Decay**: x0.5 after 60 days inactive, x0.25 after 120 days.
- **Confirmation**: At least one player per team must confirm.

### 6.3 Component hierarchy
- Pages use plain `<h1>` / `<p>` headers — no `PageHeader`.
- Shared components live in `src/components/`.
- Match flow components in `src/components/matches/`.
- Ranking components in `src/components/ranking/`.
- Dashboard components in `src/components/dashboard/`.

### 6.4 Turn-to-match flow (unchanged)
- Turns act as player funnel.
- `convertTurnToMatchAction` inherits club, players, positions.
- `useMatchForm` supports `turnId` pre-fill.

---

## 7. Refinements

### 7.1 Shared Component Sanitization
All core navigation and shared components (`BottomNav`, `TopBar`, `RankingSearch`, `ManageSlotModal`, `TurnCard`, `ToastProvider`, `PlayerAvatar`, `Badge`, `ShareButton`, `Switch`, `OpenToNetworkButton`) have been refactored to the Minimal Design System. Refined `TurnCard` date indicator and action button heights (h-10) for tactile consistency.

- **Standardized Button Radius & Heights**: Buttons use `rounded-lg`. Primary actions are strictly `h-12`, secondary/ghost are `h-10`. Small inline buttons (e.g., ManageSlotModal actions, TurnCard actions) are `h-8` or `h-9`.
- **Tactile Feedback Standard**: Primary and secondary buttons utilize `active:scale-[0.98]` to provide delightful micro-interaction feedback. Purely decorative scale effects remain prohibited.
- **Elimination of Glassmorphism**: Semi-transparent backgrounds (`bg-card/40`, `bg-background/50`) and `backdrop-blur-*` have been replaced by solid `bg-card` or `bg-background`.
- **Shadow Normalization**: `shadow-2xl` and `shadow-xl` have been downgraded to `shadow-sm` or removed.
- **Typography**: Micro-typography below 11px, `uppercase` transforms, non-standard `tracking-*`, and heavy `font-black` weights have been replaced by standard Tailwind weights (`font-medium`, `font-semibold`, `font-bold`) and sizes (`text-xs`, `text-sm`).
- **Semantic Invitation Pages**: Invitation routes (`/t/[id]`, `/m/[matchId]`) are refactored to use semantic HTML and solid backgrounds, ensuring maximum mobile performance and clarity for guest users.
