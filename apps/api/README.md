# API de PerdiU

NestJS con PostgreSQL independiente y consultas parametrizadas mediante `pg`. El arranque carga el `.env` ignorado de la raíz; variables ya definidas en el entorno tienen prioridad. No imprime URLs ni errores crudos de PostgreSQL.

## Catálogo público

`GET /reports` devuelve un array de `ReportSummary` de `@perdiu/contracts`: solo activos, ordenados por `createdAt` descendente e ID ascendente en empates. `type` distingue pérdida/hallazgo y `state` distingue activo/resuelto. `incidentDate` usa `YYYY-MM-DD`; `createdAt` usa UTC y se genera en PostgreSQL.

El autor público tiene ID (sujeto de Auth), nombre y foto opcional. Los contactos están en tablas privadas; ni esos datos ni claves de almacenamiento se consultan para el catálogo. Una lista vacía devuelve `200 []`; fallos de consulta devuelven `503` con mensaje seguro en español. No hay autenticación ni endpoints de escritura en esta historia.

El controlador HTTP traduce el resultado/error, `ListReports` aplica los invariantes y la proyección pública, y `PostgresReportRepository` adapta SQL al modelo. El SQL filtra y ordena para reducir trabajo; el caso de uso conserva los invariantes al sustituir ese adapter.

## Desarrollo y validación

Sigue el README de la raíz para preparar PostgreSQL y ejecutar `pnpm dev`. `pnpm --filter @perdiu/api start` ejecuta el build; `pnpm --filter @perdiu/api test` prueba reglas de catálogo/configuración. Los contratos deben estar compilados antes de ejecutar comandos aislados del workspace.

`pnpm test:integration` crea un contenedor PostgreSQL desechable con puerto y contraseña efímeros, verifica el catálogo y elimina únicamente ese contenedor. No requiere una cuenta externa ni modifica la BD de desarrollo. Las migraciones/seed solo aceptan una BD local `perdiu_*dev` o `perdiu_*test`, fuera de `NODE_ENV=production`; el seed usa IDs fijos y `ON CONFLICT DO NOTHING` para conservar registros existentes.
