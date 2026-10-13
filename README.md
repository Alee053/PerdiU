# PerdiU

PerdiU conecta a personas que perdieron algo con quienes lo encontraron. Este monorepo usa pnpm workspaces y Turborepo para coordinar la web, la API y los contratos compartidos.

## Requisitos

- Node.js 20.19+ (o 22.12+)
- pnpm 10+

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

- `apps/web`: demo frontend en React, TypeScript y Vite.
- `apps/api`: catálogo público NestJS con persistencia en PostgreSQL independiente.
- `packages/contracts`: tipos compartidos para los reportes y perfiles públicos.

La demo no persiste publicaciones ni conecta proveedores externos de autenticación. Los filtros, el cierre de reportes y la publicación funcionan en memoria para presentar los flujos de la primera entrega. El perfil, los reportes y teléfonos precargados son ficticios. Las fotos y tipografías de muestra se cargan desde Unsplash y Google Fonts.
