# Especificación vista de creación de partido

- Path: `/match/new`
- Estado: Implemented

## Notas de implementación
- Enfocar la experiencia exclusivamente en configurar el partido antes de registrar resultados.
- Flujo de 4 pasos con diseño minimalista según `DESIGN.md`.
- Búsqueda de jugadores en tiempo real para reducir la fricción.

## Criterios de aceptación (Completados)

### 1. Acceso y seguridad
- [x] La vista está disponible solo para usuarios autenticados con Google (NextAuth).
- [x] Usuarios no autenticados se redirigen al flujo de login antes de acceder a `/match/new`.

### 2. Flujo secuencial en cuatro pasos
- [x] El flujo se divide en cuatro pasos:
  1. Jugadores y parejas (Búsqueda integrada)
  2. Formato del partido (Amistoso/Torneo, Sets, Ranking)
  3. Datos opcionales (Club, Cancha)
  4. Marcador Final (Opcional, si se activa en paso 2)
- [x] Cada paso ocupa el 100% del viewport con transiciones limpias.

### 3. Paso 1: Jugadores y parejas
- [x] El usuario actual se preselecciona en la posición 0.
- [x] Las posiciones 1–3 permiten buscar jugadores existentes mediante `/api/players` o asignar nombres manuales.
- [x] La interfaz muestra una previsualización con avatares y estados de "Perfil Verificado".
- [x] No se puede avanzar si no hay cuatro jugadores cargados.

### 4. Paso 2: Formato del partido
- [x] Selector de tipo de partido y cantidad de sets (1, 3, 5).
- [x] Toggle "Cargar resultado ahora" que habilita el paso 4.
- [x] Selector de "Ranking competitivo".

### 5. Paso 3: Datos opcionales
- [x] Campos para Club y Número de cancha.

### 6. Paso 4: Marcador Final
- [x] Grid para cargar resultados de cada set de forma rápida.

### 7. Navegación y creación
- [x] Botones `Atrás` y `Continuar/Crear` estandarizados (h-12 primario, h-10 secundario) según `DESIGN.md`.
- [x] Al finalizar, redirige al detalle del partido.

### 8. Experiencia móvil
- [x] Layout mobile-first con tipografía clara y tamaños estándar de Tailwind.
- [x] Sin backdrop-blur, sin glassmorphism, sin iluminación ambiental — conforme a `DESIGN.md`.
