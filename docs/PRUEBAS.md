# Pruebas RLS y en modo avión — para el equipo

## RLS reproducible

Prepara seis cuentas separadas: visitantes A y B con pases del proyecto de pruebas; operario de Inscripciones con dispositivo activo; operario de una comisión general; coordinador; y usuario revocado con membresía inactiva. A debe tener un pase activo sin check-in previo. Abre `supabase/tests/rls.sql`, rellena los seis UUID al inicio y ejecútalo completo en el proyecto de pruebas. La prueba cambia el rol SQL y los claims para simular la API; las escrituras de prueba se revierten al final. Un error detiene la transacción; no cambies a `commit` para recuperar la sesión. Un resultado satisfactorio no sustituye probar la API con usuarios reales.

Desde ventanas/perfiles separados y usando las sesiones reales (`anon` sin sesión, visitante A/B, Inscripciones, Hospedaje, Alimentación, general, coordinador y revocado), verifica adicionalmente:

- Anónimo sin sesión: evento y contenido publicado visibles; no participantes, teléfonos, avisos internos, borradores, puerta ni ejecución de RPC privadas.
- Visitante anónimo autenticado: registra su propio pase, incluso con un WhatsApp ya utilizado por otro; un reintento con el mismo usuario devuelve el mismo folio. No aprueba invitado/servidor ni ve registros ajenos.
- Hospedaje: su comisión puede consultar su padrón vía RPC; no puede descargar manifiesto de puerta ni editar Alimentación. Alimentación y Transporte: solo sus propios registros. Una comisión general no puede inyectar un registro de Hospedaje o Alimentación bajo su propio `commission_id`. Un usuario de Inscripciones no puede usar un dispositivo asignado a otro usuario.
- Coordinador: publicar borrador completo con `p_expected_active` correcto; luego repetir con un segundo borrador y el mismo anterior esperado, y exigir `CONFLICT_REFRESH_REQUIRED`. El público solo ve el release publicado. La primera publicación envía `null` como activo esperado. Verifica que no se pueda modificar una sesión de release publicado.
- Revocado: RPC denegadas online; comprobar que su manifest previo solo permanece en el teléfono que ya lo descargó y que los pendientes quedan en revisión al intentar enviarlos tras revocación.
- Comprueba en Network que las llamadas usan la clave pública junto con el token de la sesión. No uses una clave administrativa para demostrar que RLS funciona.

## Modo avión: instalación y preparación

1. Usa `npm run build` y `npm run preview` o un despliegue HTTPS de pruebas. No uses `npm run dev` para validar reapertura offline. En Android evita una IP local `http://...`: la cámara y el service worker requieren contexto seguro. Mantén el mismo origen, perfil de navegador y modo PWA durante toda la prueba.
2. En un perfil visitante crea varios pases de prueba. Guarda su PNG o muéstralos en otro dispositivo. Conserva uno para un duplicado entre teléfonos y otro para probar búsqueda. Para el caso cancelado, marca uno como cancelado **antes** de descargar el manifiesto. Para desconocido, usa un QR ajeno al evento o un pase posterior a la descarga.
3. Con conexión, entra con el usuario de Inscripciones. Abre Puerta → Buscar dispositivos autorizados → elige su dispositivo → Descargar padrón. Confirma que muestra personas, folios, hora y manillas. Haz una primera prueba de permiso de cámara. En DevTools, comprueba que el service worker está activo y controla la página; recarga una vez en línea y repite si aún no la controla. Mantén la URL de Puerta en el historial o como marcador.

## Modo avión: caso principal

1. Activa modo avión (comprueba que Wi-Fi también está apagado). Cierra la cámara si estaba abierta; vuelve a abrirla y escanea un pase activo sin llegada, o registra el mismo caso por folio/nombre. Debe mostrar **Pendiente de sincronizar**, no **Entrada correcta**. Debe quedar una fila pendiente con un `id` en IndexedDB (`afd-real-v1`, tabla `ops`).
2. Vuelve a presentar el mismo pase en ese teléfono. Debe indicar duplicado y no aumentar el contador. Prueba un desconocido y un cancelado: deben verse en rojo y no generar una fila de salida. Usa un segundo pase activo para probar búsqueda por nombre con tilde y por folio exacto.
3. Cierra completamente la pestaña o la PWA. Sin salir de modo avión, vuelve a abrir la misma URL de Puerta. Debe cargar el shell sin servidor, mostrar el mismo padrón, las operaciones pendientes y conservar exactamente los mismos identificadores. No debe solicitar autenticación remota para abrir el padrón ya preparado.
4. Desactiva modo avión. Mantén Puerta visible. Verifica sincronización automática o pulsa **Sincronizar**. Las pendientes deben pasar a confirmadas y la BD debe tener una sola fila en `checkins` por pase. Si la sesión ha expirado, renueva en Equipo con la misma cuenta; los IDs no deben cambiar.
5. Prueba respuesta perdida: en un ensayo instrumentado, deja que Supabase confirme una `submit_checkin`, pero interrumpe la respuesta antes de que el cliente la procese; confirma que el siguiente POST lleva el mismo `p_operation` y que sigue existiendo solo una entrada y un intento para ese ID. Si no puedes reproducir el fallo de red exacto, verifica la idempotencia del servidor mediante la prueba SQL; un simple corte antes del POST no simula un commit con respuesta perdida.
6. En dos teléfonos, prepara dos dispositivos activos distintos. Escanea el mismo pase sin red en ambos. Al recuperar red, comprueba un `accepted` y un `duplicate`, con una sola fila de `checkins`. No esperes que los dos teléfonos desconectados se conozcan entre sí.
7. Registra una entrada offline, desactiva el dispositivo en Supabase y reconecta. Debe ir a revisión sin desaparecer. Reactívalo y pulsa Reintentar en revisión: mismo ID, un único resultado servidor. Nunca borres el almacenamiento del teléfono para resolver una cola.
