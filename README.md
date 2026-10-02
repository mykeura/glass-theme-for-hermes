<!-- SPDX-FileCopyrightText: 2026 Miguel Euraque -->
<!-- SPDX-License-Identifier: LicenseRef-Miguel-Euraque-Proprietary -->

# Glass Theme for Hermes

Glass Theme es un tema original para Hermes Desktop, inspirado en la claridad
del vidrio de macOS. Ofrece una familia coherente para modo claro y oscuro,
con superficies translúcidas, capas suaves y blur dentro de la ventana de
Hermes, manteniendo el texto y los controles legibles.

El paquete usa la API nativa de Desktop Plugin SDK. Su aporte visual se
registra mediante `THEMES_AREA` como un `DesktopTheme`: colores base, una
variante opcional `darkColors`, tipografía local del sistema, paleta ANSI y
CSS acotado a las superficies que el host permite personalizar. No modifica el
núcleo de Hermes ni copia código, assets o paletas de otros plugins.

## Qué incluye

- Tema claro y tema oscuro seleccionables desde el selector nativo de Hermes.
- Transparencia y blur dentro de las superficies de la aplicación cuando el
  host y el estilo de la superficie los admiten.
- Contraste objetivo de al menos 4.5:1 para texto normal y 3:1 para controles,
  iconos y estados de foco, medido sobre el color compositado de cada
  superficie.
- Estados deshabilitados distinguibles sin aplicar una opacidad global que
  vuelva ilegible el contenido.
- Una paleta de terminal coherente con cada modo, sin establecer un fondo que
  opaque la superficie translúcida. Sus colores ANSI por defecto se revisan
  sobre el canvas concreto del host; una aplicación que dibuja sus propios
  colores dentro del terminal queda fuera de esa garantía.

La transparencia descrita aquí ocurre dentro de la interfaz de Hermes. El
plugin no promete una ventana transparente frente al escritorio ni controla la
vibrancy, el material o el compositor del sistema operativo; esas capacidades
pertenecen al host.

## Compatibilidad y límites

El objetivo es Hermes Desktop con el contrato de `@hermes/plugin-sdk` que
expone `THEMES_AREA` y el modelo `DesktopTheme`. El archivo de escritorio es
ESM sin compilar y solo debe importar los módulos admitidos por el SDK. Hermes
carga un plugin de disco desde:

```text
$HERMES_HOME/desktop-plugins/<id>/plugin.js
```

Este repositorio es un paquete unificado: contiene `plugin.yaml`, una entrada
de compatibilidad sin efectos para el cargador de plugins Python de Hermes
Agent (`__init__.py`) y la mitad de Desktop en `desktop/plugin.js`. La entrada
de Agent no registra herramientas ni modifica configuración; el tema visual
solo se registra y aplica en Hermes Desktop. Al instalar el paquete, Hermes
carga cada entrada con su runtime correspondiente. El cambio de perfil no crea
otra copia ni altera el alcance del tema.

El plugin no está aislado del proceso de Desktop. Carga únicamente código que
hayas revisado y conserva una copia del repositorio para poder retirar el
paquete si el host informa un error.

## Instalación local

Desde una instalación de Hermes que incluya `hermes plugins`, instala el
paquete usando una URI `file://` absoluta. La opción `--no-enable` deja la
instalación inactiva hasta que revises el estado:

```bash
hermes plugins install file:///RUTA/ABSOLUTA/glass-theme-for-hermes --no-enable
hermes plugins list
hermes plugins enable glass-theme
```

El identificador `glass-theme` coincide con el manifiesto de este repositorio.
El comando de instalación sigue la interfaz documentada por Hermes (`install
<identifier> [--no-enable|--enable]`); la URI debe apuntar a la carpeta que
contiene el manifiesto y `desktop/plugin.js`. No se debe copiar el archivo
manualmente a una instalación activa para esta prueba.

Después de editar `desktop/plugin.js`, usa **⌘K → Reload desktop plugins**
para pedir al host una recarga. La selección del tema se hace en la interfaz
nativa de Hermes, no desde una pantalla propia del plugin.

Para revertirlo, vuelve a seleccionar el tema anterior en Desktop, desactiva
Glass en la gestión nativa de plugins y recarga los plugins de Desktop. El host
retira el aporte registrado y reemplaza o limpia su hoja `customCSS`; no borres
ni edites archivos del núcleo. Para retirar también la instalación del lado de
Agent, ejecuta `hermes plugins disable glass-theme` y, si ya no necesitas el
paquete, `hermes plugins remove glass-theme`.

## Desarrollo y verificación

El SDK de Desktop carga `desktop/plugin.js` sin paso de compilación. Antes de
considerar una versión lista, ejecuta las comprobaciones del proyecto y anota
la evidencia reproducible en [`docs/VALIDATION.md`](docs/VALIDATION.md).
Ese archivo distingue las comprobaciones estáticas de una comprobación visual
real en Hermes; la segunda requiere una sesión de Desktop compatible y no se
debe inferir a partir de que el archivo JavaScript analice correctamente.

Los comandos de comprobación del paquete son:

```bash
npm run check
npm test
hermes plugins validate .
```

`npm test` debe terminar sin fallos antes de publicar una versión. Si alguno
de estos comandos falla, conserva el resultado y el motivo en
[`docs/VALIDATION.md`](docs/VALIDATION.md).

El plan de hitos y sus criterios de aceptación está en
[`docs/PLAN.md`](docs/PLAN.md). La licencia del repositorio se encuentra en
[`LICENSE`](LICENSE).

## Originalidad

Glass Theme toma del host únicamente el contrato público necesario para
registrar un tema nativo. El nombre, la composición visual, las decisiones de
contraste y las paletas de este paquete son trabajo original de Miguel
Euraque. No se distribuyen assets externos ni fragmentos de otros plugins.
