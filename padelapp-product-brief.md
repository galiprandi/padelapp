Perfecto. Con estos cambios, el MVP se vuelve aún **más ágil y enfocado**. Vamos a actualizar la especificación completa con:

- ✅ **Login solo con Google** (más rápido, menos fricción).  
- ❌ **Eliminación de la confirmación de asistencia** (confiamos en el sistema de reputación post-partido).  
- 🎯 **Categorías de nivel definidas: 1 (profesional) a 8 (principiante)**.

Aquí está la **versión actualizada y consolidada** en Markdown, lista para usar como guía de desarrollo, pitch o documentación del repo.

---

# 🎾 **PadelApp**  
**La app para registrar partidos, construir ranking y organizar turnos de pádel — sin fricción, solo juego.**

---

## 📌 **Visión General**

**PadelApp** es una **Progressive Web App (PWA)** diseñada para jugadores de pádel que quieren:

- **Registrar partidos reales** de forma rápida y confiable.  
- **Construir un ranking individual y por pareja** basado en resultados reales y comportamiento en cancha.  
- **Organizar turnos abiertos** compartiendo un link en WhatsApp, Instagram o SMS, y permitir que otros se anoten hasta el último minuto.  
- **Fomentar el compromiso** mediante un sistema de reputación que premia la puntualidad y penaliza las ausencias injustificadas.

> 🔑 **Modelo de distribución**: 100% basado en **links compartibles**.  
> No se requiere descarga previa: al abrir un link, el usuario se registra **con Google** y participa.

> 🎯 **Público objetivo**: jugadores amateur en España, LATAM y Europa que usan WhatsApp para organizar partidos.

---

## 🧱 **MVP (Versión 1) – “Registro + Ranking + Turnos Abiertos”**

### ✅ **Funcionalidades esenciales**

#### 1. **Registro / Login**
- **Únicamente con Google** (OAuth 2.0).  
- Se extraen:  
  - `email` (verificado)  
  - `nombre` → se usa como **apodo inicial** (editable después)  
  - `foto` (opcional, para perfil)  
- **Sin contraseña, sin magic links** → máxima simplicidad.

#### 2. **Creación de turnos abiertos**
Un jugador (organizador) define:
- **Club y cancha(s)** (texto libre, ej. “Padel City – Cancha 3”).
- **Fecha, hora y duración** (60, 90, 120 min).
- **Número de canchas** (1, 2, 3…).
- **Máximo de jugadores**: cualquier número par ≥ 4 (4, 6, 8, 10, 12…).
- **Nivel sugerido**: selecciona una **categoría** (ver sección abajo).
- Genera un **link único y público**: `padelapp.app/t/abc123`.

#### 3. **Inscripción abierta**
- Cualquiera con el link puede **anotarse** (hasta **1 minuto antes del inicio**).
- Lista de inscritos visible (apodo + foto de Google).
- El turno se cierra al **completar cupo** o al **iniciar el horario**.

#### 4. **Registro de partidos**
- Cualquier jugador puede registrar un **partido individual** vinculado al turno.
- Define:
  - **Formato**: mejor de 2 sets, mejor de 3, 4 juegos, tiempo límite.
  - **Resultado**: set por set o juegos totales.
- Los **4 jugadores deben confirmar** el resultado.
- Si hay discrepancia → partido en “disputa” (sin puntos hasta resolver).

#### 5. **Ranking, categorías y reputación**

##### 🏆 **Categorías de nivel (fijas)**
| Nivel | Nombre | Descripción |
|------|--------|------------|
| **1** | Profesional | Circuitos internacionales (Premier Padel, etc.) |
| **2** | Alta Competición | Torneos nacionales, muy alto nivel |
| **3** | Avanzado Plus | Control total, estrategia, pocos errores |
| **4** | Avanzado | Buenas armas, juego consistente |
| **5** | Intermedio Plus | Domina saque, volea, smash básico |
| **6** | Intermedio | Juega con regularidad, entiende tácticas |
| **7** | Principiante Plus | Conoce reglas, juega ocasionalmente |
| **8** | Principiante | Primeros partidos, en aprendizaje |

> - Al registrarse, el usuario **elige su categoría inicial**.  
> - El sistema **ajusta automáticamente** la categoría con base en:  
>   - Resultados contra rivales de distintos niveles.  
>   - Calificaciones de otros jugadores (“¿su nivel real coincide?”).

##### 📊 **Ranking**
- **Individual**: puntos basados en:  
  - Victoria/derrota.  
  - Nivel del rival (categoría ajustada).  
  - Margen de victoria.  
- **Por pareja**: mismo cálculo, solo para partidos jugados juntos.
- **Decaimiento**: puntos pierden 8.33% mensual (solo últimos 12 meses cuentan).

##### 🛡️ **Reputación**
- Inicia en **100 puntos**.
- **Penalización**:  
  - Si un jugador **se anota y no participa** en ningún partido del turno → **-10 pts** (reportado por al menos 2 compañeros).  
- **Consecuencias**:  
  - < 80 pts → no puede crear turnos.  
  - < 60 pts → no puede unirse a turnos abiertos (solo invitaciones cerradas).

#### 6. **PWA + Notificaciones**
- App **instalable en móvil** (iOS + Android).
- **Notificaciones push** para:  
  - Nuevo partido para confirmar.  
  - Cambios en ranking (“¡Subiste a Nivel 4!”).

#### 7. **Compartir en redes**
- Después de un partido:  
  > 🏆 Juan & Lucas vencieron a María & Sofía  
  > 6-4, 3-6, [10-7]  
  > #PadelApp #Nivel4  
- Genera imagen automática para WhatsApp/Instagram.

---

## 🛠️ **Stack Técnico (MVP)**

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 15 (App Router, Server Components, Server Actions) |
| **Lenguaje** | TypeScript |
| **Estilado** | Tailwind CSS + shadcn/ui |
| **Gestión de datos** | React Query (Client Components) + Prisma (Server Actions) |
| **Base de datos** | Supabase (PostgreSQL gratuito) |
| **ORM** | Prisma |
| **Autenticación** | **NextAuth.js** (con proveedor Google) |
| **PWA** | `next-pwa` |
| **Notificaciones Push** | Firebase Cloud Messaging (FCM) |
| **Hosting** | Vercel |
| **Dominio** | `padelapp.app` |

> 💡 **Nota**: al usar **NextAuth.js**, el login con Google se implementa en <1 hora.

---

## 📈 **Features Futuras (Roadmap)**

### Etapa 2: **Matchmaking**
- Jugadores solos buscan pareja por nivel.
- Parejas publican partidos abiertos (“busco rivales nivel 4–5”).

### Etapa 3: **Red Social Ligera**
- Feed de partidos, seguidores, retos.

### Etapa 4: **Integración con Clubes**
- Reserva de canchas dentro de la app.

### Etapa 5: **IA + Estadísticas Avanzadas**
- Sugerencias de pareja óptima.
- Análisis de desempeño por jugador.

---

## 📲 **Flujo de Usuario Clave (Turno Abierto)**

1. **Organizador** → Crea turno (nivel 4, 6 jugadores) → Comparte link:  
   > 🎾 ¡Turno abierto! Sáb 18h | Club X | Nivel 4 | 6 cupos  
   > 👉 Únete: padelapp.app/t/abc123

2. **Jugador** → Abre link → **Login con Google** → Se anota.

3. **Post-partido** → Cualquiera registra partido → Los 4 confirman resultado.

4. **Sistema** → Actualiza:  
   - Ranking individual y por pareja.  
   - Categoría (si hay evidencia de sobre/subestimación).  
   - Reputación (si alguien no jugó).

5. **Notificación**: “¡Subiste al Nivel 3!”.

---

## 🚀 **Próximos Pasos Inmediatos**

1. Registrar dominio: `padelapp.app`  
2. Crear repo: `github.com/tu-usuario/padelapp`  
3. Implementar:  
   - Login con Google (NextAuth)  
   - Turno público con SSR (`/t/[id]`)  
   - Registro de partido con Server Actions  
4. Desplegar en Vercel  
5. Probar con 10 jugadores reales

---

## 💬 **Pitch de 30 segundos**

> “¿Jugaste un partido hoy? En **PadelApp**, entras con Google, registras el resultado en 30 segundos, y descubres tu verdadero nivel con un ranking que va del **1 (pro)** al **8 (principiante)**. Organiza turnos con un link, y juega con quienes sí aparecen. Sin fricción. Solo pádel.”

---

✅ **Este documento refleja todos los acuerdos finales**:  
- Login **solo con Google**.  
- **Sin confirmación de asistencia** (se maneja post-partido).  
- **Categorías 1–8** claras y alineadas con la realidad del pádel amateur/pro.  
- Enfoque en **hispanohablantes**, **links compartibles** y **MVP minimalista**.

