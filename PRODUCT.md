# PRODUCT.md – PadelApp

Visión de producto, estrategia y principios de UX que guían el desarrollo de **PadelApp**.

## 1. Misión

PadelApp existe para **facilitar la organización de turnos fijos y recurrentes de pádel**, y **salvarlos cuando están en peligro de cancelación** por falta de jugadores.

El organizador crea el turno, lo comparte, y los jugadores se unen con un toque. Cuando faltan jugadores y el turno corre riesgo, PadelApp notifica automáticamente a la **red de contactos de pádel** de todos los anotados — jugadores con quienes compartieron cancha en el último año — para llenar los cupos antes de que sea tarde.

## 2. Pilares de Producto

- **Turnos que no se cancelan**: el valor central es asegurar que cada turno fijo se juegue. Si faltan jugadores, la app los busca en tu red automáticamente.
- **Red de contactos de pádel**: cada partido confirmado construye automáticamente tu red. No hay que agregar a nadie manualmente. Jugaste con alguien una vez → ya es parte de tu red.
- **Cero fricción**: login con Google, links compartibles, inscripción con un toque. Sin App Store, sin contraseñas, sin pasos innecesarios.
- **Mobile-First**: diseñada para usarse en el club, a pie de pista, desde un smartphone.

## 3. El ranking como gancho

El ranking **no es el valor central** de la app. Es un **gancho de engagement** y arenga competitiva. Su propósito es:

- Generar motivación para registrar resultados.
- Dar un motivo para volver a la app después de jugar.
- Crear conversación y rivalidad sana entre jugadores.

El ranking es intencionalmente simple y no pretende ser un sistema técnico preciso de medición de nivel. El nivel auto-reportado (1–8) sigue siendo la referencia práctica para armar partidos.

## 4. Estrategia de UX/UI

- **Paleta amarilla**: identidad visual vibrante y deportiva.
- **Acciones claras (CTAs)**: botones de ancho completo, accesibles con el pulgar.
- **Feedback inmediato**: toasts para confirmar acciones sin interrumpir el flujo.
- **Estados vacíos con camino a seguir**: nunca dejar al usuario ante una pantalla en blanco.
- **Diseño minimalista**: claridad sobre decoración. Ver `DESIGN.md`.

## 5. Diferenciadores

- **Distribución vía links**: un link de WhatsApp es la puerta de entrada. No dependemos de App Store.
- **Red social implícita**: la red de contactos se construye automáticamente a partir de los partidos jugados. No hay que agregar amigos ni enviar solicitudes.
- **Salvataje de turnos**: notificación proactiva a tu red cuando un turno está por cancelarse por falta de jugadores. La red se construye a partir de **todos los inscriptos** en el turno (no solo el organizador), considerando contactos de partidos confirmados en los **últimos 12 meses**.

## 6. Lo que NO es PadelApp

- No es un sistema de reservas de canchas (eso lo hace el club).
- No es un sistema de matchmaking automático (eso requiere escala).
- No es una red social general (no hay feed, no hay seguidores).
- No es un sistema técnico de medición de nivel (el ranking es un gancho, no un ELO serio).
