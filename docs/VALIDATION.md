<!-- SPDX-FileCopyrightText: 2026 Miguel Euraque -->
<!-- SPDX-License-Identifier: LicenseRef-Miguel-Euraque-Proprietary -->

# Validación

Este registro separa evidencia observada de comprobaciones todavía pendientes.
No se considera que el plugin esté validado hasta que una sesión real de
Hermes Desktop confirme la selección nativa y la lectura en ambos modos.

La revisión de la implementación `e500379` confirmó los checks estáticos y se
cerró en `1b254e4`: se retiró el foreground global de controles, el borde usa
el token concreto `--dt-border`, las pruebas cubren cuatro niveles de texto
con umbral de texto normal, los controles deshabilitados conservan un nivel
legible con opacidad 1, fondo concreto y borde del host, y el canvas de
terminal usa un token de fondo opaco. Los ANSI por defecto también se prueban
contra ese canvas concreto. La QA visual Electron sigue bloqueada; por eso la
validación del renderer permanece abierta.

## Evidencia disponible al iniciar el trabajo

| Comprobación | Evidencia | Estado |
| --- | --- | --- |
| Contrato de entrega Desktop | La guía del host describe `desktop/plugin.js` como ESM sin compilar y la topología unificada `$HERMES_HOME/plugins/<id>/desktop/plugin.js` junto a `plugin.yaml`. | Confirmado por lectura de `website/docs/developer-guide/desktop-plugin-sdk.md`. |
| Contrato de tema | `DesktopTheme` requiere `name`, `label`, `description` y colores con `background`, `foreground` y `primary`; admite `darkColors`, terminal, tipografía y `customCSS`. | Confirmado por lectura de `apps/desktop/src/themes/types.ts`. |
| Aplicación de apariencia | El contexto del host deriva el modo, aplica variables CSS, gestiona `customCSS` y llama a su propia política de translucidez. | Confirmado por lectura de `apps/desktop/src/themes/context.tsx`. |
| Interfaz del instalador | `hermes plugins install --help` acepta `identifier`, `--enable` y `--no-enable`; la salida describe el identificador como entrada de catálogo, URL Git o forma `owner/repository`. | Ejecutado localmente durante la preparación; no se instaló el plugin. |
| Versiones de referencia | El checkout de host consultado reporta `v0.21.4+canary.20261001T070239Z-381-ge05b16348b1`; el artefacto UI instalado tiene `builtAt` `2026-09-24T18:05:53.244950+00:00`. | Observado localmente; no se deben mezclar ambas versiones como si fueran el mismo runtime. |

## Estado del paquete

El paquete de implementación ya está presente. El executor debe completar la
tabla con comandos ejecutados, código de salida y rutas exactas cuando agregue
las pruebas que declara `package.json`.

| Comprobación | Comando o procedimiento | Resultado |
| --- | --- | --- |
| Sintaxis ESM | `node --check desktop/plugin.js` | Pasó localmente (`exit 0`). |
| Manifiesto | Parsear `plugin.yaml` y comprobar que `name: glass-theme` coincide con `id: 'glass-theme'` en `desktop/plugin.js`. | YAML parseado localmente; el identificador coincide por lectura (`glass-theme`). |
| Scripts declarados | Lectura de `package.json`: `check` incluye sintaxis de plugin y pruebas; `test` usa `node --test tests/*.test.mjs`. | Observado. |
| Sintaxis del proyecto | `npm run check` | Pasó localmente (`exit 0`). |
| Registro del plugin | `npm test`, que ejecuta `tests/registration.test.mjs`. | Pasó localmente (`1/1` en el resumen combinado). |
| Prueba de paleta base | `npm test`, que ejecuta `tests/contrast.test.mjs`; cubre cuatro niveles compositados de texto con umbral `4.5:1`, colores de acción, borde, foco, selección y controles deshabilitados sobre superficies de prueba. | Pasó localmente en `1b254e4` (`2/2`); también verifica fallback opaco y modo de transparencia reducida. Es evidencia estática y no una medición universal del CSS renderizado por Hermes. |
| ANSI sobre canvas concreto | `tests/contrast.test.mjs` comprueba foreground, cursor, colores ANSI por defecto y selección claro/oscuro contra el fondo concreto del canvas. | Pasó localmente en `1b254e4`; cubre la paleta que declara el plugin. Los colores que una aplicación dibuje por su cuenta dentro del terminal quedan fuera del alcance. |
| Validador del host | `hermes plugins validate .` | Pasó localmente (`exit 0`); el host informó que el manifiesto, la entrada Desktop, seguridad y ausencia de override del núcleo son válidos. También advirtió que no hay `__init__.py`, esperado para este plugin manifest-only. |
| Contraste renderizado | Medir texto normal, texto secundario, estados de control y foco sobre las superficies compositadas por el host; registrar estilos calculados y valores. | Pendiente: falta evidencia del renderer Electron y del canvas real de terminal; los checks actuales cubren el contrato estático y los ANSI declarados. |
| Selección nativa | Abrir Hermes Desktop, recargar plugins y seleccionar el tema desde la UI nativa. | Pendiente; no se instala vivo durante la preparación documental. |
| Claro y oscuro | Observar ambos modos, terminal, foco, controles y estados deshabilitados. | Pendiente de validación visual real. |
| Alcance de transparencia | Confirmar que el efecto se limita a superficies dentro de la ventana y no afirmar transparencia del sistema operativo. | Pendiente de validación visual real. |

## Revisión del renderer

Se intentó una comprobación aislada con una copia temporal del entrypoint,
`HERMES_HOME` temporal, `user-data` temporal y el `dist/` existente del host.
Electron terminó antes de crear la primera ventana con:

```text
FATAL:content/browser/sandbox_host_linux.cc:41] Check failed. . shutdown: Operation not permitted (1)
```

También se intentaron las opciones alternativas de sandbox y GPU. La sesión
no tocó el perfil activo, el código fuente del host ni el
plugin instalado. Por ello siguen sin verificarse selección nativa, estilos
calculados claro/oscuro, canvas de terminal, cambio a otro tema y limpieza al
deshabilitar o descargar el plugin. Los checks estáticos no deben presentarse
como prueba universal del renderer.

## Procedimiento final

1. Ejecutar `npm run check`, `npm test` y `hermes plugins validate .` sin instalar el
   paquete en una cuenta o perfil activo.
2. Revisar la topología `plugin.yaml` + `desktop/plugin.js` y el identificador
   que se usará en el README.
3. En una sesión de prueba autorizada, instalar con una URI `file://` absoluta
   y `--no-enable`, habilitar el identificador, recargar Desktop plugins y
   seleccionar el tema desde la UI nativa.
4. Registrar versión de Hermes Desktop, plataforma, modo, superficie observada
   y resultado de lectura. Incluir cualquier limitación del renderer o del
   compositor.
5. Actualizar README para reflejar solo el comportamiento observado y cerrar
   el hito de validación con su commit correspondiente.

La versión del código fuente del host consultada y la versión de Desktop
instalada pueden no coincidir. Por eso una lectura del SDK no sustituye la
prueba con el runtime que se vaya a entregar.
