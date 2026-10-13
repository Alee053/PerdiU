# PerdiU

PerdiU conecta a personas que perdieron algo con quienes lo encontraron. Este monorepo usa pnpm workspaces y Turborepo para coordinar la web, la API y los contratos compartidos.

## Requisitos

- Node.js 20.19+ (o 22.12+)
- pnpm 10+
- Docker con Compose para PostgreSQL local y pruebas de integración.

## Desarrollo

```bash
pnpm install
cp .env.example .env
```

En `.env`, define una contraseña local en `POSTGRES_PASSWORD` y una `DATABASE_URL` con el formato `postgresql://perdiu:<contraseña-codificada>@127.0.0.1:5433/perdiu_dev`. Codifica los caracteres especiales de la contraseña para la URL. El archivo está ignorado por Git; las credenciales de BD pertenecen exclusivamente a la API.

```bash
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

La web corre en `http://localhost:5173` y la API en `http://127.0.0.1:3000`. También puedes usar `pnpm dev:web` con la API iniciada por separado. `pnpm db:down` detiene PostgreSQL conservando su volumen.

`pnpm build` y `pnpm typecheck` recorren los workspaces con Turbo, compilando primero sus dependencias. `pnpm test` ejecuta las suites disponibles. La caché es local; los procesos de desarrollo y las pruebas de integración no se cachean.

La interfaz abre directamente en un dashboard. La barra lateral separa Resumen, Explorar reportes, Mapa, Publicar reporte, Mis reportes, Guardados y Seguridad y privacidad.

## Estructura de la interfaz

- apps/web/src/pages: un archivo por apartado del dashboard.
- apps/web/src/components/layout: barra lateral y encabezado.
- apps/web/src/components/reports: tarjetas, detalle, búsqueda, filtros y mapa de reportes.
- apps/web/src/components/common: encabezados de página y estados vacíos reutilizables.
- apps/web/src/data: publicaciones de demostración.
- apps/web/src/types.ts: tipos compartidos de la interfaz.
- apps/web/src/App.tsx: estado compartido y composición del dashboard.

## Workspaces

- `apps/web`: interfaz React/TypeScript/Vite con catálogo real y otras secciones de demostración.
- `apps/api`: catálogo público NestJS con persistencia en PostgreSQL independiente.
- `packages/contracts`: tipos compartidos para los reportes y perfiles públicos.

«Explorar reportes» consulta `GET /reports` de PostgreSQL a través del proxy `/api` de Vite. Distingue carga, error con reintento, catálogo vacío y búsqueda sin coincidencias. No usa datos demo como fallback. La búsqueda y los filtros existentes operan sobre el catálogo recibido; sus consultas del servidor corresponden a S1-02. El detalle abierto desde este catálogo muestra únicamente datos públicos, sin contacto ni controles de propietario. Las imágenes ausentes usan SVG locales por categoría; el mapa ilustrativo pertenece a la demo.

Resumen, Publicar, Mis reportes, Guardados y perfil conservan sus flujos de demostración: no hay Auth ni escrituras persistentes desde la web. Los guardados solo viven en memoria. Los reportes/telefonía demo y el seed son ficticios; el seed incluye un autor «Santiago Demo» para comprobar que su nombre no concede permisos. Las fotos y tipografías demo usan Unsplash y Google Fonts.

## Validación

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm test:integration
pnpm test:e2e
```

Las dos últimas órdenes crean y eliminan un PostgreSQL aislado con credenciales efímeras, sin requerir `.env` ni modificar la base de desarrollo. `test:e2e` también inicia API/web en puertos libres y usa Chromium para comprobar carga, búsqueda, privacidad, error/reintento, vacío, reinicio y móvil. Usa Chromium del sistema (`/usr/bin/chromium`) o define `CHROMIUM_PATH`; si no tienes uno, instala el navegador local de Playwright con `pnpm exec playwright install chromium`. Las capturas quedan en `test-results/`, ignorado por Git.

Consulta [la API](apps/api/README.md) y [la evidencia de S1-01](docs/validation/s1-01.md).
