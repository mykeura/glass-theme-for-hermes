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
| Validador del host | `hermes plugins validate .` | Pasó tras el cambio: manifiesto, ambas entradas, sonda aislada de `register()`, seguridad y superficie Desktop SDK. |
| Cargador Python de Agent | `hermes plugins doctor . --ci` | Pasó desde la raíz del proyecto; importó y ejecutó la entrada de Agent sin registrar tools ni hooks. |
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

## Instalación activa autorizada

Se instaló el commit exacto en el perfil activo después de inspeccionar la
ayuda del comando y confirmar que no existía una instalación previa de
glass-theme que necesitara backup:

    hermes plugins install file:///home/miguel/Documentos/Desarrollador/Hermes/glass-theme-for-hermes \
      --ref de294c53a20e15631fd4ab09cb9c44dec1ff88dd --enable

El CLI informó instalación en
/home/miguel/.hermes/plugins/glass-theme, habilitación del plugin y recarga
de plugins del gateway. El paquete no declaró dependencias de runtime; el
instalador omitió la fase de Node deps porque el paquete solo contiene el
entrypoint ESM y sus pruebas.

La lista activa mostró glass-theme como enabled, versión 0.1.0 y
pinned@de294c53. La fuente y la copia instalada tienen los mismos SHA-256:

| Archivo | SHA-256 fuente e instalado |
| --- | --- |
| desktop/plugin.js | ef15f4b26596c3f975d36e916391f3c65dc0834c4328db96913ee0d2063511bb |
| plugin.yaml | 50be2f5dfe3bd24f842a2bd25c0adff1d4f9843fcad9ae0d40451717909b51 |
| package.json | a05c5a4f6e04433defb957be14fc7614078f36167044685f8196be89b2523a9c |

Esta instalación confirma el flujo del CLI, la ruta y la integridad de los
archivos. No confirma todavía que el renderer de Hermes Desktop haya cargado
el tema ni que el usuario lo haya seleccionado. Para comprobar esa parte,
abre Desktop, ejecuta ⌘K → Reload desktop plugins si no aparece Glass,
y selecciónalo desde el selector nativo. No se cambió el tema actual
ni se escribió estado de selección por fuera de la UI.

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

## Corrección del paquete unificado

La reproducción de `hermes plugins doctor . --ci` inicialmente falló porque
Agent intentaba importar el paquete como plugin Python y no encontraba
`__init__.py`. El paquete ahora incluye una función `register(ctx)` intencionalmente
sin efectos para satisfacer ese contrato sin exponer capacidades de Agent; la
contribución visual sigue siendo exclusivamente `desktop/plugin.js`.
`tests/agent-entrypoint.test.mjs` comprueba que la entrada carga y no registra
capacidades.

Comprobaciones ejecutadas después del cambio:

| Comprobación | Resultado |
| --- | --- |
| `npm run check` | Pasó. |
| `npm test` | 7/7 pasaron: entrada Agent, paletas clara/oscura, contraste, CSS y registro Desktop. |
| `hermes plugins validate .` | Pasó; la sonda aislada ejecutó `register()`. |
| `hermes plugins doctor . --ci` | Pasó desde el directorio fuente; runtime discovery, manifest, import y registration correctos. |

El artefacto de Desktop es un único paquete con dos paletas (`colors` y
`darkColors`), no dos plugins ni dos archivos compilados. El repositorio no
define un paso de build: la entrada ESM se carga directamente. Se probó
`hermes plugins install file:///home/miguel/Documentos/Desarrollador/Hermes/glass-theme-for-hermes --no-enable`
con un `HERMES_HOME` aislado; el instalador basado en Git instaló el `HEAD`
confirmado, no los cambios locales aún no versionados. Por ello esa copia no
verifica el artefacto corregido y no se cuenta como prueba de instalación. Para
probar exactamente esta corrección, primero hay que versionar los cambios y
repetir la instalación en un perfil de prueba.

La validación visual en Electron continúa pendiente: el entorno previamente
terminó antes de abrir una ventana con `Operation not permitted`. No se afirma
que la selección nativa, los estilos computados ni la limpieza tras desactivar
se hayan observado en pantalla. Reproducir esos pasos en una sesión Desktop
con soporte gráfico; al cambiar de Glass a otro tema, comprobar la retirada de
`#hermes-desktop-custom-css` o que su contenido corresponda al nuevo tema.

## Validación de la versión 0.1.1

La versión anterior era `0.1.0`; la versión nueva es `0.1.1` (incremento patch).
`plugin.yaml` es la fuente de versión del plugin y `package.json` se mantiene
sincronizado. Ambos manifiestos declaran ahora `MIT`, de acuerdo con `LICENSE`.
No hay un archivo separado de changelog en el proyecto.

Comprobaciones ejecutadas desde la raíz del repositorio:

| Comando | Resultado |
| --- | --- |
| `git diff --check` | Pasó. |
| `npm run check` | Pasó; sintaxis ESM de la entrada Desktop y las pruebas. |
| `npm test` | Pasó: 7/7 pruebas. |
| `hermes plugins validate .` | Pasó; manifiesto, entradas y superficie Desktop aceptados. |
| `hermes plugins doctor . --ci` | Pasó; runtime discovery, parseo del manifiesto, import y registro correctos. |

Para ejercitar el instalador real sin cambiar el perfil activo, se creó una copia
temporal del árbol fuente, se inicializó como repositorio Git temporal y se usó
un `HERMES_HOME` desechable:

```bash
HERMES_HOME="$TEST_ROOT/home" hermes plugins install "file://$TEST_ROOT/source" --no-enable
HERMES_HOME="$TEST_ROOT/home" hermes plugins doctor glass-theme --ci
HERMES_HOME="$TEST_ROOT/home" hermes plugins enable glass-theme
HERMES_HOME="$TEST_ROOT/home" hermes plugins show glass-theme
```

La instalación aislada reportó `glass-theme 0.1.1`, el doctor aprobó import y
registro, y `hermes plugins show glass-theme` mostró el estado habilitado y la
descripción declarada `Translucent teal glass theme with light and dark palettes.`
La descripción abreviada queda verificada en el manifiesto y en la vista del
plugin del CLI, pero el área de temas de Desktop no pudo inspeccionarse. Esta
activación corresponde al cargador de plugins Agent en el perfil temporal; no
equivale a seleccionar el tema nativo en Hermes Desktop.

La sesión actual de Hermes Desktop está empaquetada y no expone CDP en
`127.0.0.1:9222` (la conexión fue rechazada). No se cambió la configuración del
usuario ni se seleccionó el tema; por tanto, apariencia, selección nativa y
ausencia de errores nuevos del renderer siguen sin verificarse visualmente.

## Validación de la versión 0.1.2

La versión `0.1.2` actualiza el paquete a MIT, deja los encabezados SPDX solo
en archivos de código y scripts, reduce la descripción del tema a `Teal glass
theme with light and dark palettes.`, mejora la instalación remota del README y
amplía `.gitignore` para excluir cachés y salidas locales no necesarias para
instalar el plugin.

Comprobaciones ejecutadas desde la raíz del repositorio:

| Comprobación | Resultado |
| --- | --- |
| `npm run check` | Pasó. |
| `npm test` | Pasó: 7/7 pruebas. Incluye la descripción corta registrada en `THEMES_AREA`. |
| `hermes plugins validate .` | Pasó: manifiesto, entradas, sonda de `register()`, escaneo de seguridad y superficie Desktop SDK. |
| `hermes plugins doctor . --ci` | Pasó: discovery, manifiesto, import y registro sin capacidades de Agent. |

También se ejercitó el instalador real de Hermes con una instantánea Git temporal
del árbol de trabajo y un `HERMES_HOME` temporal. `hermes plugins install
file://… --no-enable` instaló `glass-theme 0.1.2`; después, `doctor`, `enable` y
`show` confirmaron el manifiesto, la descripción corta y el estado `enabled`.
No se modificó el perfil activo ni se automatizó Hermes Desktop con CUA.

Esta evidencia valida el paquete, el cargador y el flujo de instalación de
Hermes. La comprobación visual del selector nativo y de los estilos renderizados
sigue pendiente en una sesión Desktop compatible; no se sustituye por estas
pruebas estáticas o de CLI.
