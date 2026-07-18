# Spec: Chat de Turnos

**Estado:** Not Implemented
**Prioridad:** Nice to have (post-MVP)
**Última actualización:** 2026-07-18

## Resumen

Chat en tiempo real por turno, disponible desde la creación del turno hasta 90 días después. Historial efímero con expiración automática. Incluye un bot del sistema que envía mensajes contextuales que WhatsApp no puede ofrecer.

## Motivo

La comunicación hoy es externa (WhatsApp). Integrarla en la app reduce fricción y permite mensajes automáticos del sistema (bajas, cupos, recordatorios, resultados) que justifican usar el chat in-app en lugar de un grupo de WhatsApp.

## Reglas de vida

- **Nace**: al crear el turno
- **Muere**: 90 días después (TTL automático, sin cron)
- **Historial**: efímero, sin backup. Los mensajes expiran solos
- **Acceso**: solo jugadores inscriptos al turno + organizador

## Arquitectura técnica

### Stack
- **Socket.io** (WebSocket transport) sobre Vercel Functions
- **Upstash Redis** (free tier, 10k cmds/día, 256MB) como única DB de mensajes
- **TTL 90 días** en cada key de Redis — cleanup automático, sin cron

### Modelo de datos en Redis

```
turn:{turnId}:messages → LIST de JSON strings (TTL 90 días = 7776000s)
turn:{turnId}:presence → SET de userIds online (TTL 60s, renueva heartbeat)
```

Cada mensaje:
```json
{
  "id": "uuid",
  "userId": "xxx",
  "alias": "German",
  "type": "user|system",
  "text": "Llego 10 min tarde",
  "ts": 1784409140
}
```

### Operaciones
- **Enviar**: `RPUSH turn:{id}:messages {json}` + `EXPIRE turn:{id}:messages 7776000`
- **Cargar historial**: `LRANGE turn:{id}:messages 0 -1`
- **Presencia**: `SADD turn:{id}:presence {userId}` + `EXPIRE turn:{id}:presence 60`
- **Cleanup**: automático (TTL expira)

### Endpoint
- `GET /api/socket-io` — Vercel Function con Socket.io server
- Cliente: `socket.io-client` con `transports: ['websocket']`

### Consideraciones de Vercel
- WebSocket se cierra al alcanzar max duration de la Function → reconnect con backoff exponencial
- Nuevas conexiones pueden llegar a otra instancia → Redis pub/sub para sincronizar
- Fluid Compute debe estar habilitado (default desde abril 2025)

## Bot del sistema (diferenciador clave)

Mensajes automáticos que aparecen en el chat como `type: "system"`:

### Pre-partido
- 📢 "Se liberó un cupo. Compartí el link: padelred.app/t/{id}"
- ⚠️ "Faltan 2 jugadores. El turno es en 24h."
- ✅ "Turno completo. Nos vemos {fecha}."
- ⏰ "Recordatorio: el turno es en 2h en {club}."

### Bajas y suplentes
- ❌ "{alias} se bajó del turno. Cupo disponible."
- 🔔 "Notificando a tu red de contactos para buscar suplente..."

### Post-partido
- 🏆 "Resultado confirmado: 6-4, 3-6, 6-2"
- 📊 "Ranking actualizado: {alias} +15pts"
- ✅ "Asistencia marcada: 4 presentes, 1 tarde"

### Acciones rápidas (botones inline)
- "Confirmar asistencia" → un toque
- "Me bajo" → libera cupo + notifica red
- "Invitar a mi red" → dispara flujo "Open to my network"

## Casos de uso reales

### Pre-partido
- "Llego 10 min tarde"
- "Alguien trae pelotas?"
- "Cambiaron la cancha a la 5"
- "Me bajo, ¿alguien consigue suplente?"

### Post-partido
- "Buen partido, la próxima la pago yo"
- "Confirmo el resultado: 6-4, 3-6, 6-2"

## Notificaciones push

- **No** se envía push por cada mensaje de usuario
- **Sí** se envía push cuando el bot del sistema envía un mensaje crítico (baja de jugador, cupo abierto, recordatorio)
- FCM ya configurado en el proyecto

## Lo que NO incluye (MVP)

- Sin media (fotos, videos)
- Sin mensajes privados user2user
- Sin búsqueda de mensajes
- Sin moderación de contenido (fase posterior)
- Sin exportación de historial

## Dependencias

- `socket.io` + `socket.io-client`
- `@upstash/redis` (REST client, serverless-friendly)
- Upstash Redis account (free tier)

## Fases de implementación

1. **Fase 1**: Socket.io + Redis — chat básico entre usuarios, sin bot
2. **Fase 2**: Bot del sistema — mensajes automáticos de bajas, cupos, recordatorios
3. **Fase 3**: Acciones rápidas inline — confirmar asistencia, bajarse, invitar red
4. **Fase 4**: Push notifications selectivas del bot via FCM
