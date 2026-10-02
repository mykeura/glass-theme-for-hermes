<!-- SPDX-FileCopyrightText: 2026 Miguel Euraque -->
<!-- SPDX-License-Identifier: LicenseRef-Miguel-Euraque-Proprietary -->

# Plan de Glass Theme

## Objetivo

Entregar un paquete unificado de Hermes Desktop que aporte un tema original
con modos claro y oscuro, superficies translúcidas con blur dentro de la
ventana y lectura clara. La implementación debe permanecer en el plugin y
usar el contrato público del Desktop Plugin SDK; el núcleo de Hermes se
consulta solo para verificar ese contrato.

La lectura es un requisito funcional: el objetivo es un contraste mínimo de
4.5:1 para texto normal y 3:1 para controles, iconos y foco, calculado sobre
el color que resulta después de componer la superficie. Los estados
deshabilitados deben seguir siendo distinguibles y no depender de una opacidad
global.

## Hitos y aceptación

### 0. Inicialización y documentación

**Entregables:** manifiesto documental, licencia, README, este plan y matriz de
validación. La documentación debe describir la instalación del paquete
unificado mediante una URI `file://` absoluta, los límites reales de la
translucidez y la frontera con el núcleo.

**Aceptación:** todos los archivos propios llevan los avisos SPDX exigidos;
README, licencia y plan no prometen transparencia del sistema operativo ni
presentan código, assets o paletas externas como propios. Este hito termina
con el commit inicial de documentación.

### 1. Implementación del plugin

**Entregables:** `plugin.yaml`, `desktop/plugin.js` y las comprobaciones del
proyecto que correspondan. El plugin debe exportar el contrato ESM de Hermes y
registrar un `DesktopTheme` en `THEMES_AREA`, con paleta clara, `darkColors`,
terminal coherente y CSS acotado a la apariencia de la interfaz.

**Aceptación:** el paquete tiene la topología unificada esperada por Hermes;
el identificador del manifiesto coincide con el del plugin; el selector nativo
puede descubrir el tema y alternar ambos modos; la superficie conserva lectura
con los objetivos de contraste; el código no edita el núcleo, no agrega
dependencias externas y no usa assets o paletas copiadas. Este hito termina
con el commit de implementación.

### 2. Validación y documentación final

**Entregables:** resultados reales de análisis, pruebas y revisión visual en
[`docs/VALIDATION.md`](VALIDATION.md), más los ajustes finales del README para
que describa exactamente el resultado implementado.

**Aceptación:** las verificaciones reproducibles pasan o tienen su fallo
explicado; la validación visual indica el host, versión y superficie que se
observó; se comprueba que el tema se selecciona desde la UI nativa y que el
modo claro/oscuro mantiene lectura. Si no es posible instalar o abrir una
sesión real, el documento lo marca como pendiente y no lo sustituye con una
inferencia estática. Este hito termina con el commit final de validación y
documentación.

## Fuera de alcance

- Cambiar `apps/desktop`, `web` u otro código del núcleo de Hermes.
- Crear un selector propio, una pantalla de configuración paralela o un
  mecanismo de selección por perfil.
- Prometer transparencia de la ventana, vibrancy o blur del escritorio fuera
  de las superficies que el host compone.
- Descargar tipografías, imágenes, iconos, dependencias o contenido remoto.
- Declarar éxito de runtime a partir de `node --check`, una captura aislada o
  la mera existencia del archivo.

## Contrato de referencia

El alcance se basa en la guía `website/docs/developer-guide/desktop-plugin-sdk.md`
y en los tipos y el contexto del tema del host:
`apps/desktop/src/themes/types.ts` y
`apps/desktop/src/themes/context.tsx`. El host aplica los colores del
`DesktopTheme` como variables CSS, puede derivar variantes y gestiona su
propia translucidez; el plugin solo declara la contribución que le corresponde.
