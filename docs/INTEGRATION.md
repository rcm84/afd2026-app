# Alcance de integración pendiente

Este repositorio implementa la capa visual. No debe anunciarse como aplicación operativa del congreso hasta completar y verificar lo siguiente.

## Mantener el contrato de la arquitectura previa

1. Aplicar y probar por separado la migración SQL y RLS previamente propuesta en un proyecto de pruebas. Ese archivo no se incluye ni se modifica aquí.
2. Generar tipos TypeScript desde el esquema real de Supabase; no adivinar nombres de columnas.
3. Implementar Auth y guardas de navegación. La seguridad real es RLS, no una ruta oculta.
4. Añadir IndexedDB y repositorios locales con aislamiento por usuario/evento.
5. Añadir cola idempotente de check-in, confirmaciones y reconciliación.
6. Conectar padrón mínimo de puerta y QR reales con las RPC previstas.
7. Implementar agenda publicada por versiones; no exponer borradores.
8. Conectar directorios, avisos, tareas, responsables y turnos.
9. Añadir service worker y actualización segura sin descartar pendientes.
10. Realizar pruebas reales en Cuba y Android de gama media.

## Funciones SQL previstas por la arquitectura, no incluidas en este frontend

- register_participant: inscripción confirmada en servidor.
- publish_schedule: publicación atómica de versión.
- submit_checkin: entrada idempotente.
- get_checkin_manifest: datos mínimos de puerta.
- get_commission_roster: padrón autorizado.

Comprobar firmas contra la migración que se termine aprobando. No hay servicios ni clientes Supabase simulando una implementación inexistente.

## Secuencia

Permisos -> persistencia local -> registro/pase -> puerta/sincronización -> agenda -> directorios -> comisiones/avisos -> ensayo operativo.

La UI de Comida no debe recuperar ni mostrar precios o menús. Puede conectarse solo a los campos de puestos del modelo existente.

## Condiciones de salida del modo demostración

No retirar la barra DEMO hasta que existan autenticación, permisos y datos reales verificados. Retirar también datos ficticios, QR DEMO, emails example.com y mensajes de simulación al sustituir cada módulo por su implementación real.

No convertir el QR en contraseña del perfil. No incluir nombre/teléfono en el token de acceso. No incluir service_role en variables VITE_*.

Dos puertas sin comunicación pueden aceptar el mismo pase antes de sincronizar. La reconciliación posterior no evita físicamente dos manillas; el protocolo operativo debe contemplarlo.
