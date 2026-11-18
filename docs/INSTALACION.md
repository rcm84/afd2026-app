# Integración AFD — proyecto aislado de pruebas

## Aplicar los archivos

Este ZIP es un conjunto de archivos para superponer sobre el repositorio visual anterior, no un reemplazo del repositorio entero. Conserva `src/main.tsx`, `src/styles/tokens.css`, `src/shared/ui`, `index.html`, `tailwind.config.cjs`, `postcss.config.cjs` y la estructura de carpetas. Copia también los archivos ocultos del ZIP. App importa únicamente las vistas conectadas. El script opcional `node scripts/remove-demo.cjs` retira los archivos visuales antiguos que ya no se importan. No sobreescribas el SQL original. No hay credenciales ni tipos inventados en el ZIP.

No se instaló, compiló, ejecutó, aplicó SQL ni se conectó a un proyecto desde esta entrega. Todos los comandos son para tu equipo.

## Supabase desde cero

1. Crea un proyecto descartable dedicado a pruebas. Guarda su contraseña de base de datos fuera del repositorio. No uses datos personales del evento en pruebas.
2. En SQL Editor, abre el contenido completo de `AFD_001_schema_rls.sql` que recibiste. Ejecútalo una sola vez en el proyecto vacío. Si falla, no continúes: revisa el primer error y comprueba que la transacción no dejó cambios. Si usas migraciones CLI, pon el archivo original en `supabase/migrations/` con un prefijo de timestamp, y aplícalo vía CLI en lugar de SQL Editor. No apliques la misma migración por ambas vías.
3. Verifica que existen `events`, `checkin_devices`, `checkins`, `checkin_attempts`, las cinco RPC y `privacy_version` en `events`, `public_responsible_name` en `food_stalls`. Si esos dos campos faltan, no es la revisión final de la migración. Verifica que el evento `afd-2026` existe y que `registration_open` está desactivado por defecto.
4. En Auth habilita el proveedor Email y el inicio de sesión anónimo. Para pruebas crea cuentas de equipo individuales y confirmadas en Authentication → Users. Los visitantes de prueba se crean desde el formulario en perfiles separados del navegador. Antes de abrir una instancia pública, define controles de abuso; si activas CAPTCHA en Supabase tendrás que integrar el token en `signInAnonymously` antes de habilitar el registro público.
5. En SQL Editor, usa `event_memberships` para crear el primer `coordinator` activo. Para la cuenta de puerta, crea membresía activa con rol `staff`, agrégala mediante `commission_members` a la comisión cuyo `scope='registration'` y crea su fila activa en `checkin_devices`. El voluntario y el dispositivo deben compartir `event_id` y `user_id`. En `participant_types`, asigna el color y la etiqueta oficiales antes de operar. Define `events.privacy_notice` y `privacy_version` antes de abrir `registration_open` en pruebas. No mezcles sesiones de equipo y visitante en el mismo perfil de navegador.
6. En el directorio del repo, instala las dependencias después de superponer los archivos. Usa Node 22.12 o superior. Conserva el lockfile recién generado. En `.env.local`, copia las dos variables de `.env.example` y coloca únicamente la URL del proyecto y su clave pública anon/publishable obtenidas del panel. Las variables `VITE_` son públicas. No uses `service_role` ni claves `sb_secret_`.
7. Genera los tipos desde el proyecto real antes de compilar. `supabase init` solo si todavía no existe `supabase/config.toml`. Sustituye `<PROJECT_REF>` por la referencia real. Ejecuta desde la carpeta que contiene `package.json`:

```sh
npm install
npx supabase init
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npm run types:db -- --linked
npm run check
npm run build
npm run preview
```

Si trabajas con una instancia local ya inicializada y con la migración aplicada, usa `npm run types:db -- --local`. `src/lib/supabase/database.types.ts` se escribe solo si el generador devuelve un tipo `Database` válido en su salida. Haz commit del archivo generado y de `package-lock.json` para que funcione el flujo de verificación de GitHub. No subas `.env.local`.

## Aprovisionamiento sin valores inventados

El siguiente fragmento se rellena con los UUID de cuentas confirmadas del proyecto de pruebas. No se incluye ni ejecuta como migración. Mantén el SQL de esquema original intacto.

```sql
-- Ejemplo de DML administrativo, NO copiar sin sustituir los marcadores.
insert into public.event_memberships(event_id,user_id,role,active)
select id,'<UUID_COORDINACION>'::uuid,'coordinator',true from public.events where slug='afd-2026';
insert into public.event_memberships(event_id,user_id,role,active)
select id,'<UUID_PUERTA>'::uuid,'staff',true from public.events where slug='afd-2026';
insert into public.commission_members(event_id,commission_id,user_id,role)
select c.event_id,c.id,'<UUID_PUERTA>'::uuid,'member' from public.commissions c
join public.events e on e.id=c.event_id where e.slug='afd-2026' and c.scope='registration';
insert into public.checkin_devices(event_id,user_id,label,active)
select id,'<UUID_PUERTA>'::uuid,'<ETIQUETA_REAL_DEL_DISPOSITIVO>',true from public.events where slug='afd-2026';
```

## Límites de esta integración

- La escritura offline implementada es la entrada. No crear cuentas, inscribir, publicar ni descargar un padrón nuevo sin red. Las lecturas públicas reutilizan lo descargado al visitar cada pantalla. El padrón completo con teléfonos solo se carga online a memoria mediante la RPC autorizada; el manifiesto mínimo de puerta sí se guarda offline.
- Sincronización de puerta con la vista abierta y visible: al registrar con conexión, volver a foco, recuperar red, pulsar Sincronizar y mediante revisión periódica. Si la sesión expiró, vuelve a Equipo, renueva con la cuenta original y regresa a Puerta. No se promete sincronización con la app cerrada. Errores definitivos de dispositivo/permiso quedan en revisión; una vez corregidos, pulsa Reintentar en revisión con la cuenta original. No se genera otro UUID.
- La memoria de operador local no es autenticación offline ni protege ante alguien que ya controla el teléfono. No usar dispositivos compartidos sin bloqueo. Una revocación no puede borrar un móvil desconectado. Borrar los datos de este origen o perder el dispositivo antes de sincronizar puede destruir la única copia de las entradas. No duplicar el mismo ID de dispositivo en varios teléfonos.
- Tras descargar la lista, comprueba que la etiqueta de manilla y los estados son correctos. Vuelve a descargar el manifiesto si hay inscripciones, cancelaciones o cambios de tipo tardíos. Si no está en el padrón offline, deriva a incidencias: no se crea un pase ni se encola una entrada para un token desconocido localmente.
- Comida es un directorio de puestos. No hay menú, precio de comida, reservas, checkout ni pagos. Las ediciones de las tablas auxiliares no incluidas en las pantallas se cargan con la administración autorizada del proyecto.
