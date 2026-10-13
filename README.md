# PerdiU

PerdiU conecta a personas que perdieron algo con quienes lo encontraron. Este monorepo usa pnpm workspaces y Turborepo para coordinar la web, la API y los contratos compartidos.

## Requisitos

- Node.js 20.19+ (o 22.12+)
- pnpm 10+

## Desarrollo

```bash
pnpm install
pnpm dev
```

La web corre en `http://localhost:5173`. También puedes usar `pnpm dev:web`.

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
- `apps/api`: espacio reservado para el backend de la siguiente etapa.
- `packages/contracts`: tipos compartidos para los reportes y perfiles públicos.

La demo no persiste publicaciones ni conecta proveedores externos de autenticación. Los filtros, el cierre de reportes y la publicación funcionan en memoria para presentar los flujos de la primera entrega. El perfil, los reportes y teléfonos precargados son ficticios. Las fotos y tipografías de muestra se cargan desde Unsplash y Google Fonts.
