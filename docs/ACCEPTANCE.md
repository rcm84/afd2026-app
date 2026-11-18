# Checklist visual y operativo

## Antes de integrar
- [ ] npm install completa y genera un lockfile revisable.
- [ ] npm run check y npm run build pasan en el entorno objetivo.
- [ ] Las 19 vistas abren desde el selector.
- [ ] Revisar 360, 390, 768 y 1280 px, sin desbordamiento de página.
- [ ] Tablas pueden desplazarse horizontalmente sin romper el layout.
- [ ] Navegación por teclado y foco visible.
- [ ] Revisar zoom y tamaño de texto del dispositivo.
- [ ] Exportación PNG del pase DEMO funciona.
- [ ] Estado correcto, duplicado, desconocido y cancelado distinguen texto además de color.
- [ ] Sustituir marcador de logo por logo autorizado.
- [ ] Acordar manillas sin depender de un color de ejemplo.

## Antes de usar con personas reales
- [ ] RLS comprobado con identidades de cada rol, no solo service_role.
- [ ] Participante A no lee expediente de B.
- [ ] Comisión general no descarga padrón de puerta ni teléfonos.
- [ ] Primera carga, descarga de padrón y renovación de sesión desde Cuba.
- [ ] Entrada sin red, cierre abrupto y recuperación de pendientes.
- [ ] Reintentos idempotentes y duplicados entre dos dispositivos.
- [ ] Descarga de agenda interrumpida conserva versión anterior.
- [ ] Cierre de sesión y actualización no pierden pendientes.
- [ ] Consentimiento, menores y retención aprobados.
- [ ] Restauración de copia de seguridad y protocolo en papel ensayados.

Esta entrega no marca como ejecutadas pruebas de compilación, navegador u operación.
