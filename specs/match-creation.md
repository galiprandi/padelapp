# Especificación vista de creación de partido

- Path: `/match`
- Estado: Not Implemented

## Notas de implementación
- Enfocar la experiencia exclusivamente en configurar el partido antes de registrar resultados.
- Los resultados se gestionan luego en `/match/[id]` cuando el partido pasa a estado `active`.

## Criterios de aceptación

### 1. Acceso y seguridad
- [ ] La vista está disponible solo para usuarios autenticados con Google (NextAuth).
- [ ] Usuarios no autenticados se redirigen al flujo de login antes de acceder a `/match`.

### 2. Flujo secuencial en tres pasos
- [ ] El flujo se divide en tres pasos obligatorios:
  1. Jugadores y parejas
  2. Formato del partido
  3. Datos opcionales
- [ ] Cada paso ocupa el 100% del viewport sin elementos visibles de otros pasos.
- [ ] No se puede saltar pasos; es obligatorio completar el paso actual para avanzar.

### 3. Paso 1: Jugadores y parejas
- [ ] El usuario actual se preselecciona en la posición 0 (Pareja A, jugador 1).
- [ ] Las posiciones 1–3 permiten buscar jugadores existentes por `displayName` o `email`, o invitar a un nuevo jugador ingresando su email.
- [ ] Al invitar, se crea un registro en `MatchInvitation` y se habilita continuar.
- [ ] La interfaz muestra una previsualización de las dos parejas formadas.
- [ ] No se puede avanzar si no hay cuatro jugadores cargados (incluyendo invitaciones).

### 4. Paso 2: Formato del partido
- [ ] Selector de tipo de partido con `Amistoso` por defecto y `Torneo local` como alternativa.
- [ ] Campo numérico para la cantidad de sets (entero, mínimo 1, máximo 5).
- [ ] Validaciones aseguran que la cantidad de sets sea requerida y esté dentro del rango.

### 5. Paso 3: Datos opcionales
- [ ] Campos opcionales para Club (texto libre) y Número de cancha (texto o número).
- [ ] Estos campos no son obligatorios y no bloquean el envío.

### 6. Navegación y creación
- [ ] Cada paso muestra botones `Atrás` (excepto el Paso 1) y `Siguiente` (Pasos 1 y 2).
- [ ] En el Paso 3, la acción principal es `Crear partido`.
- [ ] Al enviar, se persiste el partido con estado `pending` y se redirige a una pantalla de éxito con link compartible del partido.

### 7. Estados del partido en almacenamiento
- [ ] Los registros de partido admiten estados: `pending`, `active`, `confirmed`, `disputed`.
- [ ] Todo partido nuevo inicia en estado `pending`.

### 8. Experiencia móvil
- [ ] El flujo es totalmente usable en dispositivos móviles, con inputs táctiles y sin solapamiento con el teclado.
- [ ] Errores obligatorios se muestran con mensajes claros.
- [ ] Se presenta un estado de carga durante la creación del partido.

## Preguntas abiertas
- ¿Los jugadores invitados reciben recordatorios antes del inicio del partido?
- ¿Cómo se manejan invitaciones duplicadas si se ingresa el mismo email más de una vez?
