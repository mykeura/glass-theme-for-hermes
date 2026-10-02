# SPDX-FileCopyrightText: 2026 Miguel Euraque
# SPDX-License-Identifier: LicenseRef-Miguel-Euraque-Proprietary

# Glass theme review contract

This is the read-only contract audit for the Glass theme plugin. The host
references below are from the local Hermes checkout at
`/home/miguel/.hermes/hermes-agent` and are evidence for implementation, not
code to copy. The implementation review covers commit `1b254e4`.

## Public integration seam

- Import only from `@hermes/plugin-sdk`.
- Register a complete `DesktopTheme` with
  `ctx.register({ id, area: THEMES_AREA, data: theme })`.
- `THEMES_AREA`, `DesktopTheme`, `DesktopThemeColors`, `useTheme`,
  `requestTheme`, and `readableOn` are exported by
  `apps/desktop/src/sdk/index.ts` (around lines 2041-2051 in the host).
- The contribution disposer is tracked by `PluginContext`; plugin-owned
  listeners, timers, and other side effects must also use `ctx.onDispose` or
  the scoped context helpers.

## Behavior that must be preserved

1. **Transparency.** `apps/shared/src/color.ts::parseColor` and the desktop
   `normalizeHex` helper reduce colors to RGB/6-digit hex. Do not send an
   alpha-bearing value through palette math and claim that its alpha survived.
   Preserve translucency in valid CSS (`rgb(... / alpha)`, `color-mix`, or a
   theme `customCSS` rule) and prove it with computed style. The xterm canvas
   cannot paint a CSS custom property: keep its surface concrete through
   `resolveSurfaceColor` and `terminalTheme`.
2. **Theme lifecycle.** `themes/context.tsx::applyTheme` injects exactly one
   `style#hermes-desktop-custom-css`, replaces its text on every active-theme
   apply, and removes it when `customCSS` becomes empty. A plugin must not add a
   second global style node or a MutationObserver. Switching away from Glass
   and disabling/unloading the plugin must leave no plugin-owned listeners,
   timers, style nodes, or stale contribution.
3. **Token coverage.** The host derives the page from `DesktopThemeColors`,
   but important text variants are separate: foreground, card/popover
   foreground, muted foreground, primary/secondary/accent foreground,
   midground foreground, destructive foreground, sidebar and bubble borders.
   Glass CSS must set/use the public `--theme-*`, `--ui-*`, and `--dt-*`
   chains rather than assuming one `--foreground` token makes every text
   surface readable.
4. **Dark and rendered mode.** `renderedModeFor` keys `.dark` from actual
   background luminance, not only the selected mode. A bright surface selected
   under dark mode must keep light selectors and terminal colors.
5. **Surfaces.** The public CSS selectors include `*::selection`,
   `[data-slot='dropdown-menu-content']`, `[data-slot='select-content']`,
   `[data-slot='dialog-content']`, `[data-slot='thread-timeline-popover']`,
   the dropdown item focus selectors, `.cm-*` CodeMirror classes, and the
   xterm surface. Verify selection, CodeMirror selection/caret/gutters,
   terminal foreground/cursor/selection, and portaled menus/popovers.
6. **Reduced transparency.** The host already applies
   `@media (prefers-reduced-transparency: reduce)` to remove backdrop filters.
   Glass CSS must retain opaque or alpha-mixed fills and readable foregrounds
   under that media query; a transparent-only panel is a regression.

## Required verification

- `hermes plugins validate .` from this directory must pass.
- Run focused plugin/theme tests against the source checkout once it exists.
- Exercise the actual local Electron/browser renderer in an isolated temporary
  profile or renderer context: install/enable Glass, switch to another theme,
  disable/unload it, and inspect computed styles plus the absence of the custom
  style node. Do not change the active user profile, Hermes core, or the host
  installation. A jsdom or static mockup is not evidence for the real renderer.
- If an isolated real renderer cannot be started without touching the active
  profile, report that limitation explicitly; do not claim visual success from
  tests alone.

## Revisión de la implementación 1b254e4

### Confirmado por lectura y checks

- `desktop/plugin.js` registers one `themes` contribution through
  `@hermes/plugin-sdk`; it does not access the DOM or create its own listeners.
  `PluginContext.register` therefore owns the contribution disposer.
- The current host contains the public variables used here: `--ui-bg-chrome`,
  `--ui-bg-sidebar`, `--ui-bg-editor`, `--ui-bg-elevated`, and the chat/editor/
  terminal/sidebar surface variables in `apps/desktop/src/styles.css` around
  lines 297-406. The markers used by the CSS are also real: `composer-bounds`,
  `statusbar`, `data-terminal`, the menu/select/dialog/popover slots, and
  `thread-timeline-popover`.
- The added menu highlight selectors and `.cm-*` selectors cover the host
  locations for menu selection and CodeMirror selection/caret/gutters. The
  light/dark terminal palettes provide the ANSI, cursor, foreground, and
  selection fields consumed by `terminalTheme`.
- `npm run check`, `npm test`, and `hermes plugins validate .` pass with exit 0
  on commit `1b254e4`. These tests are source and palette checks; they do not
  establish browser contrast or visual readability.

### Revisión de los cambios 1b254e4

The broad control foreground rule was removed. `--glass-border` now follows the
host's concrete `--dt-border`, the focused tests require all four text tiers to
meet the normal-text threshold, disabled controls receive a readable muted
tier without global opacity, and the terminal canvas receives a concrete
background token. The declared light/dark ANSI colors and selection also pass
the static contrast checks against that canvas. Those source gaps are resolved
for the static contract; they still do not replace renderer evidence or cover
colors drawn by terminal applications themselves.

1. **Terminal canvas fix is source-confirmed; visual proof remains pending.**
   Commit `1b254e4` sets `--ui-terminal-surface-background` to
   the opaque `--theme-card-seed` and paints `.xterm`, `.xterm-screen`, and
   `.xterm-viewport` from that concrete token. The enclosing `[data-terminal]`
   panel remains glass. This matches host `terminal/selection.ts`, which
   resolves the token for xterm's canvas/WebGL path, and avoids the host's
   documented alpha limitation. The declared ANSI palette passes static checks
   against that concrete canvas; actual canvas compositing still requires a
   real renderer check.
2. **Real renderer QA is blocked in this environment.** I copied the plugin
   entry to a temporary `HERMES_HOME/desktop-plugins/glass-theme/plugin.js`,
   used a temporary Electron user-data directory and the existing host `dist/`,
   and launched Playwright Electron. Electron exited before the first window
   with:

   ```text
   FATAL:content/browser/sandbox_host_linux.cc:41] Check failed. . shutdown: Operation not permitted (1)
   ```

   No active profile, host source, or installed plugin was touched. Thus theme
   selection, light/dark computed styles, terminal canvas, switching away, and
   unload/dispose remain unverified here. The source tests must not be reported
   as universal renderer or compatibility proof.
