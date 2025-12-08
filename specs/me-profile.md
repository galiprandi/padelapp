# Especificación vista de edición de perfil

- Path: `/me/profile`
- Estado: Implemented

## Objetivo
- Permitir que el usuario autenticado ajuste su identidad visible en la app (alias) y revise datos básicos (nombre de Google, nivel).
- Debe ser mobile-first, con CTA primario de ancho completo.

## Alcance
- Solo usuarios autenticados (redirigir a `/login` si no hay sesión).
- Edición de **alias** (nickname) que reemplaza `displayName` en toda la app.
- Lectura solamente para `displayName` de Google y nivel actual.
- No incluye cambio de foto ni nivel en este MVP.

## Layout propuesto
1) **Header**: Título “Editar perfil” + descripción corta “Personalizá cómo te ven tus rivales”.
2) **Bloque de identidad**:
   - Fila “Nombre de Google” (solo lectura, valor de `displayName`).
   - Fila “Nivel” (solo lectura, ej. “Nivel 6 · Intermedio”).
3) **Bloque Alias**:
   - Input de texto controlado para `alias`.
   - Placeholder: “Ej: Gero, La Muralla”.
   - Helper: “Usaremos tu alias para identificarte en partidos, rankings y listados. Este será el nombre que tus rivales verán.”
4) **Acciones**:
   - Botón primario `Guardar cambios` (full width).
   - Botón secundario `Volver` (ghost) para regresar a `/me`.

## Validaciones
- Alias opcional, pero si se envía:
  - Trim de espacios.
  - Longitud 2–30 caracteres.
- Mostrar errores en línea bajo el campo.
- Deshabilitar botón primario mientras envía.

## Comportamiento
- Al guardar, invocar `updateUserAliasAction` (server action) y revalidar `/me` y `/me/profile`.
- Toast de éxito: “Alias actualizado correctamente”.
- Toast de error: mensaje genérico y conservar valor ingresado.
- Al cancelar/volver, no descartar cambios automáticamente; solo navegar.

## Estados vacíos y carga
- Estado inicial debe precargar alias actual (o vacío).
- Mostrar skeleton simple (título + input deshabilitado + botones) mientras se carga la sesión.

## Accesibilidad
- Labels conectados con `id/for`.
- `aria-invalid` y `aria-describedby` cuando haya error.
- Focus visible en inputs y botones.

## Navegación
- Desde `/me` hay CTA “Editar perfil” que dirige a esta vista.
- Breadcrumb implícito con botón “Volver”.
