# PR: paneles operativos del equipo

## Archivos que se reemplazan

- `src/app/App.tsx`: incorpora rutas y validación online para los paneles nuevos.
- `src/app/layouts.tsx`: navegación con accesos según el ámbito de la comisión.

## Archivos nuevos

- `src/features/team/access.tsx`: verificación de sesión y membresía activa, ámbitos y navegación.
- `src/features/team/Directories.tsx`: CRUD de Hospedaje, Puestos de comida y Transporte.
- `src/features/team/TeamCommissions.tsx`: directorio, miembros y cambio de responsable.
- `src/features/team/TeamParticipants.tsx`: lista con folio y rol ministerial y configuración de manillas.
- `supabase/migrations/003_team_panels.sql`: permisos de borrado y rotación atómica de responsables, sin alterar políticas RLS.
- `docs/PR_PANEL_EQUIPO.md`: integración y criterios de prueba.

## Integración

1. Crea una rama en `rcm84/afd2026-app` y superpón los archivos desde la raíz del ZIP. No reemplaces el repositorio completo.
2. En `afd-2026-test`, confirma que se aplicó `002_participant_roles.sql` y existen los seis roles. Aplica `003_team_panels.sql` una sola vez, después de 002, usando el flujo habitual de migración del proyecto. No vuelve a aplicar 001 ni 002; no genera ni toca cuentas, participantes, folios, manillas ni directorios existentes.
3. Ejecuta `npx tsc --noEmit` y `npx vite build` en tu entorno. No se añaden dependencias, variables de entorno, tablas, columnas, RLS ni funciones públicas. `database.types.ts` se conserva: el código usa sus tipos y la migración no cambia su esquema público.
4. Tras validar, crea el commit y abre el PR. Título sugerido: `Paneles de equipo: directorios, comisiones y manillas`.

## Por qué hay un SQL 003

El esquema original tiene políticas de escritura por comisión, pero no concede `DELETE` a `authenticated` en las tres tablas del directorio. El grant permite solicitar el borrado; las políticas existentes siguen decidiendo qué filas pueden borrarse. No se usa `service_role`. Una relación existente, como una asignación de alojamiento o un menú anterior, puede bloquear el borrado: en ese caso la alternativa segura es despublicar, sin borrar en cascada.

El cambio de responsable es un UPDATE de `commission_members.role` con el cliente Supabase tipado. El trigger en esquema privado aplica la rotación en la misma transacción bajo los permisos del usuario de conexión; no eleva privilegios. Solo se puede escoger a un miembro activo del equipo que ya esté en la comisión. Si hay responsables múltiples previos, se muestran hasta que coordinación guarde el responsable definitivo. No hay botones de eliminar responsables o miembros.

## Acceso

| Panel | Coordinador activo | Staff activo |
| --- | --- | --- |
| Hospedaje, Puestos de comida y Transporte | Gestiona cualquier comisión del ámbito correspondiente | Gestiona solo las comisiones propias del ámbito correspondiente |
| Directorio de comisiones | Ve las 15 comisiones cargadas y cambia responsables | Ve sus comisiones; no cambia responsables |
| Participantes | Lee folio, nombre, rol y manilla; configura las manillas | Solo Inscripciones lee folio, nombre, rol y manilla |

Los paneles nuevos requieren sesión y verificación online. No guardan directorios privados, roles ni padrón en Dexie. El panel de Inscripciones reutiliza `get_checkin_manifest` porque RLS no permite a staff leer la tabla de participantes completa. La pantalla descarta campos no mostrados, incluidos tokens, y no guarda el manifiesto en una caché. Puerta conserva su ruta y su lógica local anterior.

Los nombres del equipo se leen de `profiles.display_name`; sin perfil se muestra un identificador abreviado, no se consulta Auth administrativamente. El código de rol usa `approved_type` y `participant_types`, columnas ya existentes; no aparece ninguna clasificación de congresista, invitado o servidor. Los seis roles se obtienen de 002; no se asignan colores por código. Un valor `unassigned` de la BD aparece vacío en el formulario, y «Por confirmar» en listados. Guardar la manilla afecta a todas las personas con ese rol. Volver a descargar el manifiesto de Puerta para usar el cambio offline.

La UI de comida solo solicita nombre, responsable, lugar y horario, además de publicar/despublicar. Al crear, envía `public_contact: ''` para satisfacer el campo obligatorio no expuesto, y al editar no lo toca. Transporte deriva el título de origen y destino al guardar porque el esquema requiere `title`; las instrucciones existentes no se reemplazan. Hospedaje pide además unidad del precio porque es un dato obligatorio en 001. Los paneles conservan los estados de publicación existentes.

## Verificación antes del PR

- [ ] `tsc --noEmit` y `vite build` terminan sin errores.
- [ ] Visitante y usuario revocado no pueden abrir ni mutar los paneles; usa sesiones reales distintas.
- [ ] Coordinación ve las 15 comisiones; staff solo las asignadas. Un staff no puede nombrarse responsable por API.
- [ ] Cambia el responsable a otro miembro activo: al recargar queda un único responsable en esa comisión. Intenta cambiar a un miembro inactivo: no debe alterarse ninguno.
- [ ] Crea, edita, despublica y elimina un alojamiento, un puesto y una ruta con la identidad autorizada. Alterar el `commission_id` o el evento en una petición directa no da acceso a filas ajenas. Usa un registro relacionado para comprobar el bloqueo de borrado.
- [ ] Con dos sesiones, abre el mismo registro y guarda cambios desde ambas: el segundo guardado con `version` antigua debe rechazarse, no sobrescribir.
- [ ] Verifica que Comida no lee ni escribe menús y que no existe flujo de pago.
- [ ] Verifica listado con más de 1.000 folios como coordinación, filtro por nombre y folio, ausencia de categorías antiguas y estado de manilla sin configurar. Solo coordinación puede editar la manilla de un rol. Inscripciones la consulta; el resto de staff no recibe el listado.
- [ ] Tras definir una manilla, refresca el manifiesto de Puerta y comprueba un pase de ese rol en modo avión. Comprueba que abrir Puerta offline sigue sin depender de la verificación online de los nuevos paneles.

Preparado como código fuente sin instalar dependencias ni ejecutar aplicación, TypeScript, Vite, migraciones, pruebas o escrituras remotas.
