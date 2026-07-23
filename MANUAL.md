# Manual de Padel Red

Padel Red existe para facilitar la organización de turnos fijos y recurrentes de pádel, y para evitar que se cancelen cuando no hay suficientes jugadores.

El organizador crea un turno, comparte el link, y los jugadores se suman con un toque. Si faltan jugadores, la app busca automáticamente en la red de contactos de todos los anotados — personas con las que compartieron cancha en el último año — para completar los cupos.

El objetivo principal es salvar los turnos de la cancelación: si faltan jugadores, la app los busca automáticamente. Cada partido confirmado construye tu red de contactos de pádel — no hay que agregar amigos a mano, se arma sola jugando.

Además de los turnos, la app permite registrar partidos, cargar resultados, llevar un ranking competitivo simple como gancho de engagement, y marcar asistencia para construir reputación. Todo pensado para mobile, con login de Google y links compartibles.

---

## Índice

1. [Turnos](#flujo-turnos)
2. [Partidos](#flujo-partidos)
3. [Ranking](#flujo-ranking)
4. [Perfil](#flujo-perfil)
5. [Notificaciones](#flujo-notificaciones)
6. [Onboarding](#flujo-onboarding)

---

## Flujo: Turnos

### Crear
- Cualquier usuario logueado crea un turno (club, fecha, duración, cupos, nivel sugerido, notas)
- Queda automáticamente anotado como jugador y organizador
- El turno queda abierto para que otros se sumen

### Sumarse
- Si hay cupos libres → botón "Anotarme ahora" (un tap, sin confirmación)
- Si el turno está lleno → botón "Anotarme como suplente"
- Al llenarse todos los cupos → todos los jugadores reciben push: "¡Turno completo!"
- Si todavía hay cupos → los jugadores y el organizador reciben push: "X se sumó, N/M jugadores"

### Bajarse
- Botón "Bajarme del turno" → confirmación con 2 botones (Cancelar / Confirmar baja)
- Si el turno estaba lleno → se libera el cupo + push a suplentes con contexto temporal ("En 2h. ¡Cupo libre!")
- Si se baja a menos de 2h del turno y no es el organizador → pierde 5% de reputación + push avisándolo
- Si el organizador se baja → el rol pasa al jugador más antiguo del turno + push al nuevo organizador
- Si el turno estaba lleno y no hay suplentes → se notifica automáticamente a la red de contactos (máximo 1 vez por hora)

### Suplentes
- Se anotan cuando el turno está lleno (hasta el mismo número de cupos del turno)
- Lista por orden de anotación, sin prioridad de nivel
- Ocupan cupo con "Ocupar cupo" — el primero que toma, se queda
- Al ocupar → push a jugadores y suplentes restantes con el estado del turno
- Pueden salir de la lista con un botón (sin confirmación)
- Al iniciar el partido o cancelar el turno → se limpia la lista + push a suplentes

### Organizador (acciones extra)
- Editar turno (club, fecha, duración, cupos, nivel, notas) — no disponible si el turno ya finalizó
- Iniciar partido (requiere 4 jugadores mínimos) → crea el partido con 2 equipos, toma los 4 primeros por orden de inscripción (si hay más, los restantes quedan fuera), el turno se finaliza
- Cancelar turno → avisa a todos los jugadores y suplentes + limpia suplentes
- Programar próximo turno (duplica el turno a la misma hora la semana siguiente)
- Abrir a la red (puede hacerlo cualquier jugador anotado, no solo el organizador) → push a contactos de los últimos 12 meses de todos los anotados, máximo 1 vez por hora

### No implementado
- Remover jugador (organizador)
- Asignar suplente a cupo libre (organizador)
- Recordatorio push 24h antes a suplentes

---

### Referencia

**Actores:** Organizador, Jugador, Suplente, Red de contactos

**Estados:** ABIERTO → LLENO → FINALIZADO | CANCELADO

**Penalizaciones:** Bajarse a <2h sin ser organizador → -5% reputación

**Cooldowns:** Notificación a red → 1h entre envíos

**Push notifications:** Turno completo, Nuevo jugador, Jugador se bajó, Cupo libre (suplentes), Nuevo organizador, Baja tardía, Partido iniciado, Turno cancelado, Cupo abierto (red)

---

## Flujo: Partidos

### Crear
- Cualquier usuario logueado crea un partido (formato: dobles o singles, sets, tipo: amistoso o torneo, club, cancha, notas)
- El creador queda automáticamente en el primer puesto del equipo A, pero puede reemplazarse por otro jugador (o un placeholder) para cargar partidos en los que no juega. El botón "Quitar" lo vuelve a poner a él en ese puesto
- Los demás puestos pueden estar ocupados por usuarios o ser "placeholders" (nombre sin cuenta)
- Al crear → se genera un link compartible para invitar a los demás jugadores
- Los partidos creados desde un turno heredan club y fecha del turno

### Sumarse
- Un jugador recibe el link, entra y ocupa su puesto con un tap (debe loguear con Google)
- No puede unirse si el partido ya está confirmado o cancelado
- No puede unirse si ya está en otro puesto del mismo partido

### Organizador (acciones sobre el partido)
- Editar datos (fecha, sets, tipo, club, cancha, notas) — no puede cambiar formato si ya está confirmado
- Intercambiar jugadores de posición (swaps entre equipos)
- Liberar un cupo (saca al jugador, deja el puesto libre con placeholder)
- Renombrar un placeholder
- Renombrar los equipos
- Cancelar partido (no disponible si ya está confirmado)

### Resultado
- Cualquier jugador del partido carga el marcador (formato: sets con games por set)
- Al cargar → marca su confirmación + push al equipo rival: "Resultado cargado por X, confirmá"
- El partido se confirma cuando al menos un jugador de cada equipo confirmó el resultado
- El organizador puede "Finalizar" el partido sin esperar confirmación del rival → marca todos como presentes y confirma

### Asistencia
- Solo el organizador puede marcar asistencia, y solo 1 hora después de la hora del partido
- Tres estados: Presente, Llegó tarde, No asistió
- Si el partido ya estaba confirmado → recalcula el ranking con los nuevos datos de asistencia
- Si se marca "No asistió" → push al jugador: "Te marcaron ausente"

### No implementado
- Estado DISPUTED (resultado en disputa) — existe en el esquema pero no se usa

---

### Referencia

**Actores:** Organizador (creador), Jugador (con cuenta), Placeholder (sin cuenta)

**Estados:** PENDIENTE → CONFIRMADO | CANCELADO

**Formatos:** Dobles (4 jugadores, 2 equipos), Singles (2 jugadores, 1 vs 1)

**Tipos:** Amistoso, Torneo local

**Confirmación:** Al menos 1 jugador de cada equipo debe confirmar el resultado

**Asistencia:** Disponible 1h después de la hora del partido

**Push notifications:** Resultado cargado (al equipo rival), Marcado ausente

**Ranking:** Se recalcula al confirmar el partido o al marcar asistencia si ya estaba confirmado

---

## Flujo: Ranking

### Cómo funciona
- El ranking es un gancho competitivo, no un sistema serio de medición de nivel
- Solo cuentan los partidos confirmados con resultado cargado
- Cada jugador arranca con 1000 puntos

### Fórmula de puntaje
- Puntos = 1000 + (victorias × 15) + (racha × 5) + (bonus por sets ganados)
- Bonus por sets: ganador suma 2 puntos por set ganado, perdedor suma 1 punto por set ganado
- Racha: positiva si ganás seguido, negativa si perdés seguido

### Penalizaciones al puntaje
- No asistió: -25 puntos por cada ausencia
- Llegó tarde: -10 puntos por cada llegada tarde
- Bajarse de un turno a menos de 2h: -5% de reputación (no afecta el puntaje del ranking, afecta el score de asistencia)

### Decaimiento por inactividad
- Sin partidos hace más de 60 días → puntaje se reduce a la mitad
- Sin partidos hace más de 120 días → puntaje se reduce a un cuarto

### Desempate
- Mayor puntaje → mayor reputación (asistencia) → más victorias → partido más reciente → orden alfabético

### Reputación (asistencia)
- Se calcula como: (presentes + llegadas tarde) / total de partidos con asistencia marcada
- Si no hay partidos con asistencia marcada pero sí partidos confirmados: confirmados / total
- Si no hay partidos: 100%
- Las ausencias bajan la reputación, las llegadas tarde no (cuentan como presente para la reputación)

### Cuándo se recalcula
- Al confirmar un partido (al menos 1 de cada equipo confirma)
- Al finalizar un partido (el organizador lo fuerza)
- Al marcar asistencia si el partido ya estaba confirmado
- Recalculo incremental: solo se recomputan los jugadores afectados, pero las posiciones se actualizan para todos

### No implementado
- Ranking por nivel (1-8) — el nivel existe en el perfil pero no genera rankings separados

---

### Referencia

**Puntaje base:** 1000

**Fórmula:** 1000 + (wins × 15) + (streak × 5) + setsWonBonus − noShowPenalty − latePenalty

**Decaimiento:** >60 días × 0.5, >120 días × 0.25

**Penalizaciones:** No asistió -25, Llegó tarde -10 (al puntaje); Bajarse <2h -5% (a la reputación)

**Desempate:** Puntaje > Reputación > Victorias > Recencia > Alfabético

**Reputación:** (presentes + tarde) / total con asistencia; fallback: confirmados / total; default: 1.0

**Recalculo:** Incremental por jugadores afectados, posiciones globales

---

## Flujo: Perfil

### Datos editables
- **Alias**: nombre que ven los demás en partidos, turnos y ranking. Entre 2 y 30 caracteres. Si no se setea, se usa el nombre de Google.
- **Nivel (1-8)**: referencia práctica para armar partidos. 1 = profesional, 8 = principiante. No afecta el ranking.
- **Foto**: se puede elegir un avatar predefinido o pegar un link de imagen personalizada. Si no se setea, se muestran las iniciales.

### Datos no editables
- Nombre y email vienen de Google al loguear
- Reputación, victorias, derrotas, partidos jugados y posición en el ranking se calculan automáticamente

### Perfil público
- Cualquier usuario puede ver el perfil público de otro jugador
- Muestra: alias, nivel, foto, posición en el ranking, puntaje, victorias/derrotas, efectividad (win rate), forma reciente (W/L de últimos 5 partidos)
- Si el que mira tiene partidos compartidos con el jugador → muestra "Cara a Cara": récord como socios y como rivales + último duelo
- Muestra los últimos 5 partidos confirmados con resultado

### No implementado
- Edición de nombre (viene de Google, no se puede cambiar)

---

### Referencia

**Datos editables:** Alias (2-30 chars), Nivel (1-8), Foto (URL o avatar predefinido)

**Datos automáticos:** Reputación, Victorias, Derrotas, Partidos jugados, Posición ranking, Puntaje ranking

**Perfil público muestra:** Stats generales, Win rate, Forma reciente (5 partidos), Cara a cara (si hay partidos compartidos), Historial reciente (5 partidos)

**Niveles:** 1 (Profesional) a 8 (Principiante) — referencia informativa, no segmenta rankings

---

## Flujo: Notificaciones

### Push (Firebase Cloud Messaging)
- El usuario activa las notificaciones desde un banner que aparece en la app
- Al activar, se registra el dispositivo y se guarda el token asociado al usuario
- Un usuario puede tener múltiples dispositivos (cada uno registra su token)
- Si un token expira o es inválido, se limpia automáticamente
- Las notificaciones llegan incluso con la app cerrada (service worker)

### Centro de notificaciones
- Sección dentro de la app que muestra acciones pendientes, no un historial de pushes
- Muestra partidos pasados que requieren acción:
  - Si tienen resultado cargado → botón "Confirmar"
  - Si no tienen resultado → botón "Cargar resultado"
- Ordena primero los que tienen resultado (faltan confirmar) sobre los que no tienen resultado
- Un contador en la navegación muestra cuántas acciones pendientes hay

### Tipos de push que envía la app
- **Turnos:** Turno completo, nuevo jugador, jugador se bajó, cupo libre (suplentes), nuevo organizador, baja tardía, partido iniciado, turno cancelado, cupo abierto (red)
- **Partidos:** Resultado cargado (al equipo rival), marcado ausente
- **Red:** Cupo abierto a contactos (cuando un turno queda con cupos libres)

### No implementado
- Recordatorio push 24h antes a suplentes
- Historial de notificaciones recibidas
- Notificaciones por email

---

### Referencia

**Sistema:** Firebase Cloud Messaging (web push)

**Registro:** Token FCM por dispositivo, asociado al usuario. Auto-limpieza de tokens inválidos

**Centro de notificaciones:** Acciones pendientes (no historial de pushes). Partidos pasados sin confirmar/cargar resultado

**Badge:** Contador en navegación de acciones pendientes

**Multi-dispositivo:** Un usuario puede tener múltiples tokens activos

---

## Flujo: Onboarding

### Primer ingreso
- El usuario llega a la landing page: logo, tagline ("Turnos que no se cancelan. Tu comunidad de pádel en un solo lugar.") y botón "Comenzar ahora"
- Solo se puede entrar con Google — no hay registro con email/contraseña
- Al loguear por primera vez, el usuario queda con nivel 6 (intermedio) por defecto, sin alias, sin foto personalizada

### Completar perfil
- En el dashboard, si el usuario no tiene alias, aparece un banner amarillo: "¡Completá tu perfil de jugador!" con botón "Configurar mi perfil"
- El banner desaparece cuando el usuario setea un alias
- Mientras no tenga alias, se muestra su nombre de Google en partidos, turnos y ranking

### Instalación PWA
- Banner de instalación en el dashboard: "Instalá la app. Accedé más rápido desde tu inicio."
- Si el navegador soporta instalación nativa → botón "Instalar" (instala directamente)
- Si no soporta instalación nativa → link "Ver cómo" que lleva a una guía de instalación
- El banner se puede cerrar (se guarda en localStorage y no vuelve a aparecer)
- Si la app ya está instalada → el banner no aparece

### Activar notificaciones
- Banner de push en el dashboard: "Activar notificaciones. Recibí avisos cuando abran un cupo en tu red o necesiten confirmar un resultado."
- Botón "Activar" → pide permiso del navegador → registra el dispositivo
- Botón "Ahora no" → cierra el banner (no persiste, puede volver a aparecer)
- Si el navegador no soporta notificaciones → el banner no aparece
- Si ya tiene permiso concedido → el banner no aparece

### No implementado
- Tutorial guiado paso a paso
- Onboarding interactivo con tooltips
- Detección de primer login para redirigir automáticamente al perfil

---

### Referencia

**Login:** Solo Google (NextAuth). Sin registro manual

**Defaults nuevo usuario:** Nivel 6, sin alias, sin foto, 1000 puntos ranking, 100% reputación

**Banners en dashboard:** Completar perfil (si sin alias), Instalar PWA, Activar notificaciones

**PWA:** Instalable, banner descartable (localStorage), guía alternativa si no hay soporte nativo

**Push prompt:** Descartable pero no persistente (puede reaparecer)
