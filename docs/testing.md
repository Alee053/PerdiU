# TDD y verificación

Probar comportamiento observable en interfaces públicas. Mantener pruebas rápidas para reglas y pocos recorridos completos para comprobar composición; no imponer porcentajes de cobertura ni tests de cada método. Se conservan `node:test`, `tsx`, PostgreSQL real y Playwright.

## Ciclo de trabajo

1. Convertir un criterio de la issue en un ejemplo observable y elegir su interfaz de prueba. Acordar una interfaz nueva si cambia el diseño; reutilizar las existentes para cambios ordinarios.
2. Escribir **un** test y ejecutarlo. Confirmar rojo por el comportamiento que falta, no por imports rotos, configuración ausente o un servicio que no arrancó.
3. Implementar lo mínimo que lo hace pasar. Ejecutar ese test hasta verde.
4. Revisar el diseño y refactorizar si aporta claridad, conservando verde. Continuar con el siguiente ejemplo, sin escribir toda la batería antes de implementar.
5. Ampliar validación según la tabla, revisar el diff y registrar la prueba/comando y resultado en la PR. Una corrección necesita una regresión que reproduzca el fallo.

Los tests de caracterización de comportamiento existente pueden pasar desde el principio: indicarlo sin inventar un rojo. Cambios solo de texto, formato o archivos generados no requieren TDD ni una suite de aplicación completa. CI verifica resultados actuales, pero no puede demostrar retrospectivamente el orden red/green; la evidencia breve y la revisión verifican el proceso.

## Qué probar y dónde

| Interfaz                           | Tipo y ubicación                                 | Qué debe demostrar                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ListReports` y `ReportRepository` | Unitarias, `packages/catalog/test`               | Transmisión de consulta, activos, orden estable/microsegundos, límite y proyección pública. El adapter aplica los predicados de búsqueda antes del límite.                |
| Configuración de BD/API            | Unitarias, workspace dueño                       | Entradas inválidas, mensajes seguros y restricciones de mutaciones.                                                                                                       |
| Cliente y presenter                | Unitarias, `apps/web/test`                       | DTO público, consultas HTTP, carga/error/reintento, cancelación y respuestas obsoletas. Doblar la red en esta interfaz.                                                   |
| Migraciones y SQL                  | Integración PostgreSQL, `packages/database/test` | Orden, idempotencia, rollback y evolución. Usar PostgreSQL real, no mocks de SQL.                                                                                         |
| `GET /reports`                     | Integración HTTP/PG, `apps/api/test`             | Validación/status, filtros reales, persistencia y privacidad.                                                                                                             |
| Composición React/API/PG           | E2E, `scripts/browser-catalog.mjs`               | Unos pocos recorridos de usuario en móvil/escritorio: controles, búsqueda, vacío, error/reintento y guardados. Las combinaciones exhaustivas pertenecen a HTTP/unitarias. |
| Verificadores del repositorio      | Unitarias, `scripts/test`                        | Detectar documentos/skills inválidos y admitir los válidos.                                                                                                               |
| Documentación y skills             | Check local y revisión                           | Frontmatter y destinos locales válidos; revisar manualmente exactitud, ejemplos e impacto.                                                                                |

## Comandos

Usar la versión de [`.node-version`](../.node-version) y pnpm de [`packageManager`](../package.json). Desde un clone limpio, instalar con `pnpm install --frozen-lockfile`. Los imports entre workspaces resuelven `dist`: el build de dependencias debe preceder a una prueba focalizada.

```bash
# Unitarias de todos los workspaces y herramientas del repositorio.
pnpm test

# Unitarias focalizadas, incluyendo build de dependencias desde un clone limpio.
pnpm exec turbo run build --filter=@perdiu/catalog
pnpm --filter @perdiu/catalog exec tsx --test --test-name-pattern='máximo de 50' test/catalog.test.ts

# Un escenario HTTP, sobre un PostgreSQL desechable nuevo.
pnpm test:integration --test-name-pattern='la búsqueda HTTP'
pnpm test:integration --test-name-pattern='catálogo HTTP'

# Integración completa o aceptación completa (esta última ya incluye integración/build).
pnpm test:integration
pnpm test:e2e

# Calidad rápida utilizada en CI.
pnpm verify
```

`pnpm verify` comprueba formato, documentos/skills, dependencias, tipos, unitarias y build. `pnpm test:repo` permite focalizar herramientas. Las pruebas de integración preparan sus propios datos; no requieren ejecutar antes otro escenario. Se ejecutan secuencialmente en cada contenedor, no con concurrencia sobre los mismos fixtures. El filtro selecciona escenarios HTTP; las migraciones tienen su suite propia dentro de la integración completa. No combinar filtro con E2E, que debe aceptar el recorrido entero.

El runner solo crea/elimina su contenedor y usa credenciales efímeras; `TRUNCATE` en preparación de tests exige su indicador de aislamiento. No apuntar estos comandos a bases compartidas. Las capturas quedan en `test-results/`, ignoradas por Git; se pueden adjuntar con datos ficticios y en CI se conservan por tiempo limitado.

## Evidencia de PR

Indicar interfaz/criterio, fallo inicial o caracterización, comandos que realmente se ejecutaron, resultado y límites. No copiar logs con secretos ni afirmar integración real si solo se usó un doble. Las pruebas futuras de Google/R2 se definen en [servicios](services.md); este catálogo no necesita esas cuentas.

El enfoque combina distintos niveles y favorece los tests más pequeños que dan la confianza necesaria: [TDD](https://martinfowler.com/bliki/TestDrivenDevelopment.html) y [pirámide práctica](https://martinfowler.com/articles/practical-test-pyramid.html). No exige un framework nuevo ni duplicar cada caso en todos los niveles.
