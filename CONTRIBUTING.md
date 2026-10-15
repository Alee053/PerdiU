# Contribuir a PerdiU

Esta guía define el formato compartido de issues, ramas, commits y pull requests. El trabajo se coordina en [PerdiU Backlog](https://github.com/users/Alee053/projects/5); `master` es la rama de integración actual.

## Antes de empezar

1. Leer el [README](README.md), la [documentación de producto](docs/product/README.md) y la issue completa, incluidos comentarios y dependencias.
2. Comprobar que la historia tiene comportamiento esperado, criterios observables, alcance y responsable. Resolver decisiones de producto antes de programar.
3. Asignar una persona responsable de la issue y coordinar la revisión con otra persona. Registrar dependencias en GitHub; evitar trabajo simultáneo sobre contratos sin acuerdo.
4. Crear una rama desde `origin/master` actualizado y pasar la historia a `In progress` al iniciar el trabajo.

Una corrección documental pequeña puede ir sin issue nueva si explica su propósito. Una funcionalidad, cambio de permisos o decisión de arquitectura necesita una issue o decisión acordada.

## Nombres

Usar descripciones breves en español. Los prefijos técnicos y nombres de ramas van en minúsculas; las ramas usan ASCII y guiones.

| Elemento                  | Formato                                | Ejemplo                                         |
| ------------------------- | -------------------------------------- | ----------------------------------------------- |
| Historia de sprint        | `[S1-02] <capacidad del usuario>`      | `[S1-02] Buscar y filtrar reportes`             |
| Rama de sprint            | `<tipo>/s1-02-<descripcion>`           | `feat/s1-02-busqueda-reportes`                  |
| Rama fuera de sprint      | `<tipo>/<issue>-<descripcion>`         | `docs/123-guia-contribucion`                    |
| Rama documental sin issue | `docs/<descripcion>`                   | `docs/plantillas-pr`                            |
| PR de sprint              | `<tipo>(<scope>): <resultado> [S1-02]` | `feat(web): buscar reportes por texto [S1-02]`  |
| PR fuera de sprint        | `<tipo>(<scope>): <resultado>`         | `docs(repo): definir el flujo de contribución`  |
| Commit                    | `<tipo>(<scope>): <cambio> (#<issue>)` | `fix(api): conservar el orden de creación (#1)` |

El scope y el número de issue son opcionales cuando no aplican; el identificador del sprint no reemplaza el vínculo real con una issue. Mantener los nombres de ramas y commits históricos: estas convenciones se aplican a trabajo nuevo.

| Tipo       | Uso                                            |
| ---------- | ---------------------------------------------- |
| `feat`     | Comportamiento nuevo.                          |
| `fix`      | Corrección de un fallo.                        |
| `docs`     | Documentación.                                 |
| `refactor` | Reorganización que conserva comportamiento.    |
| `test`     | Pruebas y herramientas de verificación.        |
| `build`    | Dependencias y herramientas de compilación.    |
| `ci`       | Automatización de integración continua.        |
| `chore`    | Mantenimiento que no encaja en los anteriores. |

Scopes habituales: `web`, `api`, `contracts`, `catalog`, `repo`. Nombrar el área afectada sin inventar etiquetas para cada archivo.

Crear commits progresivos que representen pasos coherentes y verificables. Evitar mensajes como «cambios», «final», «fix stuff» o la narración de la conversación. No reescribir commits ya compartidos sin acuerdo.

## Elegir un template de PR

| Template                                                      | Cuándo usarlo                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| [Predeterminado](.github/pull_request_template.md)            | Cambio general o pequeño.                                    |
| [Funcionalidad](.github/PULL_REQUEST_TEMPLATE/feature.md)     | Historia con comportamiento nuevo y criterios de aceptación. |
| [Corrección](.github/PULL_REQUEST_TEMPLATE/bugfix.md)         | Fallo reproducido, causa demostrada y regresión cubierta.    |
| [Documentación](.github/PULL_REQUEST_TEMPLATE/docs.md)        | Guías, requisitos y fuentes documentales.                    |
| [Mantenimiento](.github/PULL_REQUEST_TEMPLATE/maintenance.md) | Dependencias, infraestructura, refactors y tooling.          |

Los templates estarán disponibles automáticamente en GitHub cuando lleguen a la rama predeterminada. El archivo predeterminado se carga al abrir una PR; las variantes se eligen con `--template` en `gh` o con `?template=feature.md` en la URL de comparación. No asumir un selector de variantes en la interfaz. [Referencia de GitHub](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository).

Completar los campos y eliminar instrucciones/filas que no apliquen. Una descripción debe permitir revisar el cambio sin leer conversaciones anteriores:

- Problema concreto y comportamiento resultante.
- Issue asociada, cambios relevantes y límites de alcance.
- Comandos realmente ejecutados, sus resultados y comprobaciones manuales pertinentes.
- Riesgos, compatibilidad, migraciones y limitaciones conocidas. Usar «No aplica» con una explicación breve cuando corresponda.

Las PRs, commits y evidencias describen el cambio y su validación. No añadir atribuciones sobre herramientas de IA, frases de generación ni trailers `Co-authored-by`. La responsabilidad del cambio y su revisión sigue siendo del equipo.

### Crear la PR con gh

Ejemplo para S1-02, desde su rama de trabajo y después de verificar el diff:

```bash
git push -u origin HEAD
gh pr create --repo Alee053/PerdiU --base master \
  --head feat/s1-02-busqueda-reportes \
  --title 'feat(web): buscar reportes por texto [S1-02]' \
  --template .github/PULL_REQUEST_TEMPLATE/feature.md
```

`gh` permite editar el cuerpo antes de publicar. Para automatizaciones, preparar y revisar el cuerpo en un archivo temporal y usar `--body-file <archivo>` con título, base y head explícitos. No publicar el template vacío ni rellenar resultados de pruebas que no se ejecutaron. Usar Draft si falta implementación, verificación o una decisión; una PR lista para revisión debe tener el alcance completo y evidencia suficiente. [Opciones de gh](https://cli.github.com/manual/gh_pr_create).

### Vincular la issue

En el cuerpo de la PR, fuera de bloques de código:

```text
Closes #2
```

Usar `Closes` solamente si esa PR termina los criterios de la issue. GitHub vincula y cierra la issue cuando la PR se integra en la rama predeterminada; no al abrirla. Para trabajo parcial, usar `Refs #2`: es una referencia de seguimiento, no un cierre. Para varias issues completas, escribir una línea `Closes #N` por cada una. No cerrar historias distintas solo porque se modificó un archivo compartido.

Una PR entre ramas de trabajo o dependiente de otra PR debe explicar la dependencia, usar `Refs` y verificar el vínculo al preparar la integración final. El cierre automático requiere destino a la rama predeterminada. [Vínculos y palabras de cierre](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue).

### Vincular con GitHub Projects

La issue es la tarjeta de trabajo; evitar duplicarla con otra tarjeta para la PR. Verificar que pertenece a PerdiU Backlog. Si falta, incorporarla mediante su URL:

```bash
gh issue view 2 --repo Alee053/PerdiU --json number,title,projectItems
gh project item-add 5 --owner Alee053 \
  --url https://github.com/Alee053/PerdiU/issues/2
```

Después de abrir una PR lista para revisión, actualizar el estado de la issue:

```bash
gh project item-edit 5 --owner Alee053 \
  --url https://github.com/Alee053/PerdiU/issues/2 \
  --field Status --value 'In review'
```

Si `gh` solicita permiso `project`, autorizar ese alcance antes de modificar el tablero. No guardar tokens en el repositorio. Los comandos anteriores usan las opciones por nombre disponibles en el `gh` del proyecto; consultar `gh project item-edit --help` si una instalación antigua solo admite IDs.

Verificar el vínculo y el estado; no asumir que añadir `Closes` coloca por sí solo la issue en el proyecto:

```bash
gh pr view <numero-pr> --repo Alee053/PerdiU \
  --json url,state,baseRefName,closingIssuesReferences
gh issue view 2 --repo Alee053/PerdiU --json number,state,projectItems
```

## Estados del tablero

| Estado existente | Cuándo corresponde                                                                 |
| ---------------- | ---------------------------------------------------------------------------------- |
| `Backlog`        | Propuesta pendiente de refinar o priorizar.                                        |
| `Ready`          | Historia entendida, criterios verificables y dependencias identificadas.           |
| `In progress`    | Implementación o corrección en curso; una PR Draft sigue aquí.                     |
| `In review`      | PR lista, verificaciones relevantes ejecutadas y revisión pendiente.               |
| `Done`           | Cambio integrado en `master`, aceptado y con verificaciones pertinentes completas. |

Si la revisión descubre trabajo pendiente, volver a `In progress`. Registrar los bloqueos en la issue y sus relaciones de dependencia. Tras integrar, comprobar el cierre y el estado del tablero: las automatizaciones de Projects pueden estar o no configuradas.

## Validación y revisión

- Cambios de comportamiento: pruebas del recorrido afectado, `pnpm test`, `pnpm typecheck` y `pnpm build` según su alcance. Para lógica de negocio, mantener TDD y registrar evidencia útil.
- Persistencia/HTTP: añadir integración con PostgreSQL aislado. Para recorridos web integrados, usar `pnpm test:e2e`. Una simulación no sustituye la verificación del servicio real cuando es parte del criterio.
- Solo documentación: revisar enlaces, nombres, ejemplos, correspondencia con las fuentes y `git diff --check`; no ejecutar suites de aplicación sin motivo.
- Cambios visuales: comprobar móvil/escritorio y adjuntar capturas con datos ficticios. Proteger contacto privado, tokens, `.env`, archivos de usuario y datos de pruebas identificables.

Pedir revisión a otra persona. El autor explica las decisiones y atiende hallazgos; el revisor comprueba tanto estándares como criterios de la issue. Integrar cuando la revisión humana y los checks pertinentes estén aprobados. Mantener los commits progresivos; el método de merge uniforme se acordará antes de imponerlo en GitHub.

Actualizar documentación y ejemplos si cambia una interfaz, configuración, migración o procedimiento de arranque. Las migraciones nuevas no reescriben migraciones aplicadas; las mutaciones se verifican en bases locales aisladas. Cambios de datos compartidos, permisos o despliegue requieren autorización específica.

## Qué falta acordar antes de ampliar el equipo

Estas son propuestas, no configuraciones activadas:

1. **Protección de `master`:** exigir PR, aprobación de otra persona y checks; evitar pushes directos y force-push. Acordar quién puede integrar y las excepciones de emergencia.
2. **CI y estilo:** ejecutar pruebas, typecheck y build en PRs; añadir integración aislada y decidir formatter/linter antes de hacerlos obligatorios. `.editorconfig` ya unifica indentación y finales de línea.
3. **Responsabilidad:** asignar responsables/revisores de web, API y contratos; añadir `CODEOWNERS` cuando estén confirmados, con especial cuidado de las interfaces compartidas.
4. **Criterios de entrega:** acordar Definition of Ready/Done, tamaño de PR, política de merge y cómo registrar pruebas manuales, bloqueos y cambios de alcance.
5. **Contratos y datos:** acordar formatos de error HTTP, validación de entrada, convenciones de nombres/fechas, evolución de DTOs, migraciones y datos ficticios. Mantener una guía de acceso a entornos y gestión de secretos sin guardar sus valores.
6. **Issues y versiones:** templates de historias/bugs, etiquetas y prioridades compartidas, ADRs para decisiones de arquitectura y una política de versiones/changelog cuando haya entregas desplegadas.
