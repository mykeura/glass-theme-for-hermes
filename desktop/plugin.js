// SPDX-FileCopyrightText: 2026 Miguel Euraque
// SPDX-License-Identifier: MIT

import { THEMES_AREA } from '@hermes/plugin-sdk'

/**
 * Glass keeps its palette opaque and lets the host-owned customCSS layer add
 * translucency. That gives the app a readable base even when blur is absent
 * or the operating system asks for reduced transparency.
 */
const glassCSS = `
:root[data-hermes-theme='glass'] {
  --glass-blur: 18px;
  --glass-surface: color-mix(in srgb, var(--theme-card-seed) 78%, transparent);
  --glass-sidebar: color-mix(in srgb, var(--theme-sidebar-seed) 84%, transparent);
  --glass-popover: color-mix(in srgb, var(--theme-elevated-seed) 90%, transparent);
  /* The host writes --dt-border from DesktopThemeColors.border on every apply.
     Keep the measured UI stroke concrete after the host's own colour math. */
  --glass-border: var(--dt-border);
  --glass-selection: color-mix(in srgb, var(--theme-midground) 32%, var(--theme-background-seed));
  --ui-bg-chrome: var(--glass-surface);
  --ui-bg-sidebar: var(--glass-sidebar);
  --ui-bg-editor: var(--glass-surface);
  --ui-bg-elevated: var(--glass-popover);
  --ui-chat-surface-background: var(--glass-surface);
  --ui-editor-surface-background: var(--glass-surface);
  /* xterm's WebGL/canvas renderer needs a concrete colour. The surrounding
     terminal panel remains glass; the host resolves this seed for xterm. */
  --ui-terminal-surface-background: var(--theme-card-seed);
  --ui-sidebar-surface-background: var(--glass-sidebar);
  --ui-selection-background: var(--glass-selection);
  /* Keep every host text tier above normal-text contrast after compositing.
     The progressively lower alpha still preserves the visual hierarchy. */
  --ui-text-secondary: color-mix(in srgb, var(--theme-foreground) 84%, transparent);
  --ui-text-tertiary: color-mix(in srgb, var(--theme-foreground) 74%, transparent);
  --ui-text-quaternary: color-mix(in srgb, var(--theme-foreground) 70%, transparent);
}

:root[data-hermes-theme='glass'] :where(
  [data-slot='composer-bounds'],
  [data-slot='statusbar'],
  [data-terminal],
  [data-slot='dialog-content'],
  [data-slot='dropdown-menu-content'],
  [data-slot='dropdown-menu-sub-content'],
  [data-slot='select-content'],
  [data-slot='popover-content'],
  [data-slot='thread-timeline-popover']
) {
  border-color: var(--glass-border);
  background: var(--glass-surface);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

:root[data-hermes-theme='glass'] :where(
  [data-slot='dialog-content'],
  [data-slot='dropdown-menu-content'],
  [data-slot='dropdown-menu-sub-content'],
  [data-slot='select-content'],
  [data-slot='popover-content'],
  [data-slot='thread-timeline-popover']
) {
  background: var(--glass-popover);
  color: var(--ui-text-primary);
}

:root[data-hermes-theme='glass'] :where(a, button, [role='button'], [role='menuitem']):focus-visible {
  outline-color: var(--theme-midground);
  outline-offset: 2px;
}

:root[data-hermes-theme='glass'] :where(
  [data-slot='dropdown-menu-item'][data-highlighted],
  [data-slot='dropdown-menu-item']:focus,
  [data-slot='select-item'][data-highlighted],
  [data-slot='select-item']:focus
) {
  background: var(--ui-control-active-background);
  color: var(--ui-text-primary);
}

:root[data-hermes-theme='glass'] :where(
  button:disabled,
  input:disabled,
  textarea:disabled,
  select:disabled,
  [aria-disabled='true'],
  [data-disabled='true']
) {
  /* Host utility classes use opacity for disabled controls. Replace that
     opacity loss with a readable muted tier and a concrete muted fill. */
  opacity: 1;
  color: var(--ui-text-tertiary);
  background-color: var(--theme-card-seed);
  border-color: var(--dt-border);
  filter: none;
}

:root[data-hermes-theme='glass'] :where(.cm-editor, .cm-gutters) {
  background: var(--glass-surface);
  color: var(--ui-text-primary);
}

:root[data-hermes-theme='glass'] :where(.xterm, .xterm-screen, .xterm-viewport) {
  background: var(--ui-terminal-surface-background);
  color: var(--ui-text-primary);
}

:root[data-hermes-theme='glass'] :where(.cm-gutters) {
  border-color: var(--glass-border);
  color: var(--ui-text-secondary);
}

:root[data-hermes-theme='glass'] :where(.cm-selectionBackground, .cm-content ::selection) {
  background: var(--glass-selection) !important;
}

:root[data-hermes-theme='glass'] :where(.cm-cursor, .cm-dropCursor) {
  border-left-color: var(--theme-midground) !important;
}

:root[data-hermes-theme='glass'] ::selection {
  background: var(--glass-selection);
  color: var(--theme-foreground);
}

@supports not (backdrop-filter: blur(1px)) {
  :root[data-hermes-theme='glass'] {
    --glass-surface: var(--theme-card-seed);
    --glass-sidebar: var(--theme-sidebar-seed);
    --glass-popover: var(--theme-elevated-seed);
  }
}

@media (prefers-reduced-transparency: reduce) {
  :root[data-hermes-theme='glass'] {
    --glass-surface: var(--theme-card-seed);
    --glass-sidebar: var(--theme-sidebar-seed);
    --glass-popover: var(--theme-elevated-seed);
  }

  :root[data-hermes-theme='glass'] :where(
    [data-slot='composer-bounds'],
    [data-slot='statusbar'],
    [data-terminal],
    [data-slot='dialog-content'],
    [data-slot='dropdown-menu-content'],
    [data-slot='dropdown-menu-sub-content'],
    [data-slot='select-content'],
    [data-slot='popover-content'],
    [data-slot='thread-timeline-popover']
  ) {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
`

const glassTheme = {
  name: 'glass',
  label: 'Glass',
  description: 'Teal glass theme with light and dark palettes.',
  colors: {
    background: '#f3f7f8',
    foreground: '#17333a',
    card: '#fbfeff',
    cardForeground: '#17333a',
    muted: '#e7eff0',
    mutedForeground: '#46626a',
    popover: '#f9fcfd',
    popoverForeground: '#17333a',
    primary: '#1b6f78',
    primaryForeground: '#ffffff',
    secondary: '#d8e9eb',
    secondaryForeground: '#17333a',
    accent: '#d8f0ef',
    accentForeground: '#17333a',
    border: '#5f858c',
    input: '#5f858c',
    ring: '#1f8791',
    midground: '#287d86',
    midgroundForeground: '#ffffff',
    composerRing: '#287d86',
    destructive: '#a33f42',
    destructiveForeground: '#ffffff',
    sidebarBackground: '#e8f1f2',
    sidebarBorder: '#5f858c',
    userBubble: '#d4e9ec',
    userBubbleBorder: '#5f858c'
  },
  darkColors: {
    background: '#0e1c21',
    foreground: '#ecf8f7',
    card: '#14282f',
    cardForeground: '#ecf8f7',
    muted: '#1d363e',
    mutedForeground: '#b7ced1',
    popover: '#162c33',
    popoverForeground: '#ecf8f7',
    primary: '#62d4d5',
    primaryForeground: '#102124',
    secondary: '#28444d',
    secondaryForeground: '#e9f5f5',
    accent: '#28525a',
    accentForeground: '#e9f5f5',
    border: '#5f858c',
    input: '#5f858c',
    ring: '#7ae2dd',
    midground: '#5fc8c9',
    midgroundForeground: '#102124',
    composerRing: '#7ae2dd',
    destructive: '#ef7777',
    destructiveForeground: '#2b0f13',
    sidebarBackground: '#12262c',
    sidebarBorder: '#5f858c',
    userBubble: '#20414a',
    userBubbleBorder: '#5f858c'
  },
  terminal: {
    foreground: '#17333a',
    cursor: '#1b6f78',
    selectionBackground: '#9cc9cd',
    black: '#17333a',
    red: '#a33f42',
    green: '#1e765f',
    yellow: '#8b671e',
    blue: '#245d9d',
    magenta: '#78578a',
    cyan: '#287d86',
    white: '#45595d',
    brightBlack: '#46626a',
    brightRed: '#8c3035',
    brightGreen: '#17654f',
    brightYellow: '#745514',
    brightBlue: '#1a4b83',
    brightMagenta: '#624572',
    brightCyan: '#1d6870',
    brightWhite: '#263f46'
  },
  darkTerminal: {
    foreground: '#ecf8f7',
    cursor: '#7ae2dd',
    selectionBackground: '#3d777b',
    black: '#b5cdcc',
    red: '#ef7777',
    green: '#67c9a3',
    yellow: '#dfc27b',
    blue: '#82b7ef',
    magenta: '#c6a0d8',
    cyan: '#7ae2dd',
    white: '#d9eceb',
    brightBlack: '#729198',
    brightRed: '#ff9696',
    brightGreen: '#91e1bd',
    brightYellow: '#f2d994',
    brightBlue: '#a8d0ff',
    brightMagenta: '#ddb8ef',
    brightCyan: '#a2efeb',
    brightWhite: '#ffffff'
  },
  customCSS: glassCSS
}

export { glassCSS, glassTheme }

export default {
  id: 'glass-theme',
  name: 'Glass Theme',
  description: 'A native translucent glass theme for Hermes Desktop.',
  register(ctx) {
    ctx.register({ id: 'glass', area: THEMES_AREA, data: glassTheme })
  }
}
