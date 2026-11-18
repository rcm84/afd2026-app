# AFD App 2026

Repositorio de la AFD App 2026: React + TypeScript + Vite + Tailwind CSS 3.4.

**Estado: v0.2.0 — interfaz visual + integración Supabase (sin probar).**

Incluye la interfaz con la paleta aprobada y la conexión a Supabase: Auth anónima para preinscripción, acceso de equipo por correo y contraseña, check-in offline con Dexie, manifiesto, QR con html5-qrcode y cola persistente. El SQL (`AFD_001_schema_rls.sql`) no se incluye en este repo, se aplica aparte en un proyecto de Supabase de pruebas. **No se ha instalado, compilado ni probado: hay que generar los tipos desde el esquema real y correr `docs/PRUEBAS.md` antes de usarlo en el congreso.** Ver `docs/INSTALACION.md` y `docs/PRUEBAS.md`.

## 1. Instalación local

Usar Node.js 22.12 o superior. Se incluye `.nvmrc` para Node 22.

Descomprimir el ZIP. En una terminal, entrar en la carpeta `afd-app` que contiene `package.json`:

```bash
npm install
npm run dev
```

Abrir la dirección local mostrada por Vite. Para probar desde otro equipo de la misma red, usar la dirección de red mostrada por Vite; el acceso depende del firewall local.

No hay que crear un proyecto Supabase ni copiar variables de entorno para revisar esta interfaz. No introducir contraseñas reales en el formulario de acceso.

## 2. Verificación y producción

```bash
npm run check
npm run build
npm run preview
```

`npm run build` verifica tipos y genera `dist`. No se incluye `node_modules` ni `dist`: se generan en tu entorno. La instalación inicial necesita descargar dependencias. No se incluye un lockfile inventado: después del primer `npm install`, revisar y conservar `package-lock.json` en Git para fijar las versiones resueltas.

**Validación de esta entrega:** referencias de imports, rutas, variables de color, JSON, sintaxis de configuraciones CommonJS e integridad ZIP revisadas automáticamente. La instalación de dependencias y el build no han sido ejecutados aquí. Esto no sustituye compilar ni probar en navegador y Android.

## 3. Subir el repositorio a GitHub

Crear un repositorio vacío en tu cuenta. Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Interfaz visual inicial de AFD App"
git branch -M main
```

Agregar como `origin` la URL real de tu repositorio vacío y ejecutar:

```bash
git push -u origin main
```

No se ha creado ni publicado ningún repositorio desde esta entrega. `.gitignore` excluye dependencias, compilados y archivos `.env`. Los archivos de entorno nunca deben contener secretos que terminen expuestos en el frontend.

## 4. Despliegue en Cloudflare Pages

Configurar el proyecto que contiene este repositorio con:

- Comando de build: `npm run build`.
- Directorio de salida: `dist`.
- Versión Node: 22.12 o superior compatible con las dependencias elegidas.
- Variables de entorno: ninguna para esta versión visual.

Se usa HashRouter: las vistas se representan después de `#` en la URL y la navegación de demostración no necesita reglas SPA de reescritura. Esto es una elección de la maqueta, no una migración del contrato de rutas funcional previsto. Revisa cualquier cambio de router al integrar con la app real.

Publicar este proyecto NO activa reservas, inscripciones, permisos ni check-in. La barra de demostración se conserva para evitar confusiones.

## 5. Pantallas

El selector superior permite recorrer todas las vistas. Se conservan las rutas funcionales de la propuesta dentro del router de demostración:

1. Inicio: `/`.
2. Inscripción: `/inscripcion`.
3. Mi pase: `/mi-pase`.
4. Agenda: `/agenda`.
5. Hospedaje: `/hospedaje`.
6. Comida: `/comida`.
7. Transporte: `/transporte`.
8. Avisos: `/avisos`.
9. Acceso equipo: `/equipo/ingresar`.
10. Panel equipo: `/equipo`.
11. Comisión: `/equipo/comisiones/inscripciones`.
12. Puerta: `/equipo/puerta`.
13. Sincronización: `/equipo/sincronizacion`.
14. Coordinación: `/coordinacion`.
15. Participantes: `/coordinacion/participantes`.
16. Editor agenda: `/coordinacion/agenda`.
17. Editor avisos: `/coordinacion/avisos`.
18. Comisiones: `/coordinacion/comisiones`.
19. Estado offline: `/sin-conexion`.

## 6. Interacciones implementadas

Navegación entre pantallas, selección de día, cuatro estados visuales de entrada, filtro sobre participantes ficticios, reordenación local de tarjetas, previsualización de aviso normal/urgente y exportación PNG del pase DEMO.

No se hacen peticiones al backend. Los formularios muestran mensajes de demostración, no confirmaciones falsas. La cámara no se activa. El botón de compartir no envía mensajes. La pantalla offline es solo una vista de estado, no prueba que la aplicación funcione sin conexión.

El QR codifica `AFD-DEMO-NO-VALIDO`; no sirve para entrar al evento. Nombres, cifras, precios, horarios y alojamientos son ficticios e identificados como ejemplo. Las fechas y ciudad del congreso proceden del contexto del proyecto.

## 7. Integración y marca

- Tokens y componentes visuales: `src/styles/tokens.css`.
- Configuración Tailwind: `tailwind.config.cjs` (v3.4; no v4).
- Layouts: `src/app/layouts.tsx`.
- Router y selector de vistas: `src/app/App.tsx`.
- Pantallas: `src/features`.
- Componentes comunes: `src/shared/ui`.

El símbolo de cruz es un marcador provisional, no el logo oficial. Sustituir `Logo` por el logo del ministerio. Los colores reales de manilla quedan pendientes de coordinación; no se inventan en esta entrega.

Comida muestra solo puestos, responsable, ubicación y horario. No se modificó ningún esquema para ocultar menú y precios.

Consulta `docs/DESIGN.md`, `docs/INTEGRATION.md` y `docs/ACCEPTANCE.md` antes de conectar la aplicación a información real.
