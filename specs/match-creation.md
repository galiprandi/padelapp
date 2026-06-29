# Especificación vista de creación de partido

- Path: `/match/new`
- Estado: Implemented (V9+ Refactor)

## Notas de implementación
- Enfocar la experiencia exclusivamente en configurar el partido antes de registrar resultados.
- Se implementó un flujo de 4 pasos inmersivo con estética "High-Fidelity".
- Se integró búsqueda de jugadores en tiempo real para reducir la fricción.

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
- [x] Cada paso ocupa el 100% del viewport con animaciones de entrada V9.

### 3. Paso 1: Jugadores y parejas
- [x] El usuario actual se preselecciona en la posición 0.
- [x] Las posiciones 1–3 permiten buscar jugadores existentes mediante `/api/players` o asignar nombres manuales.
- [x] La interfaz muestra una previsualización táctil con avatares y estados de "Perfil Verificado".
- [x] No se puede avanzar si no hay cuatro jugadores cargados.

### 4. Paso 2: Formato del partido
- [x] Selector táctil de tipo de partido y cantidad de sets (1, 3, 5).
- [x] Toggle "Cargar resultado ahora" que habilita el paso 4.
- [x] Selector de "Ranking competitivo".

### 5. Paso 3: Datos opcionales
- [x] Campos para Club y Número de cancha con diseño bubble-aesthetic.

### 6. Paso 4: Marcador Final (Instant Match)
- [x] Grid táctil para cargar resultados de cada set de forma rápida.

### 7. Navegación y creación
- [x] Botones `Atrás` y `Continuar/Crear` estandarizados a `h-14` con feedback táctil.
- [x] Al finalizar, redirige al detalle del partido.

### 8. Experiencia móvil (V9+)
- [x] Contenedores `backdrop-blur-2xl` y `rounded-[2.5rem]`.
- [x] Iluminación ambiental y sombras de alto impacto.
