// SPDX-FileCopyrightText: 2026 Miguel Euraque
// SPDX-License-Identifier: MIT

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { channels, composite, contrast, luminance } from './helpers/contrast.mjs'

const source = await readFile(new URL('../desktop/plugin.js', import.meta.url), 'utf8')
const moduleSource = source.replace(
  "import { THEMES_AREA } from '@hermes/plugin-sdk'",
  "const THEMES_AREA = 'themes'"
)
const { glassTheme } = await import(`data:text/javascript,${encodeURIComponent(moduleSource)}`)

for (const [mode, colors] of Object.entries({ light: glassTheme.colors, dark: glassTheme.darkColors })) {
  test(`${mode} theme preserves composited text and UI contrast`, () => {
    const surface = composite(colors.card, colors.background, 0.78)
    const sidebar = composite(colors.sidebarBackground, colors.background, 0.84)
    const popover = composite(colors.popover, colors.background, 0.9)
    const surfaces = [colors.background, surface, sidebar, popover]

    // Host text tiers are alpha-mixed over the active surface. Glass raises
    // them to 94/84/74/70% so normal, muted, and disabled copy all retain AA.
    const textTiers = [
      ['primary', 0.94],
      ['secondary', 0.84],
      ['tertiary', 0.74],
      ['quaternary', 0.70]
    ]
    for (const [tier, alpha] of textTiers) {
      for (const background of surfaces) {
        const textColor = composite(colors.foreground, background, alpha)
        assert.ok(contrast(textColor, background) >= 4.5, `${mode}: ${tier} text on ${background} must be at least 4.5:1`)
      }
    }

    const disabledText = composite(colors.foreground, colors.card, 0.74)
    for (const control of ['primary', 'destructive']) {
      assert.ok(
        contrast(disabledText, colors.card) >= 4.5,
        `${mode}: disabled ${control} control text on the concrete muted fill must be at least 4.5:1`
      )
    }

    for (const background of surfaces) {
      assert.ok(
        contrast(colors.foreground, background) >= 4.5,
        `${mode}: foreground on ${background} must be at least 4.5:1`
      )
    }

    for (const [foreground, background, label] of [
      [colors.primaryForeground, colors.primary, 'primary'],
      [colors.secondaryForeground, colors.secondary, 'secondary'],
      [colors.accentForeground, colors.accent, 'accent'],
      [colors.destructiveForeground, colors.destructive, 'destructive']
    ]) {
      assert.ok(contrast(foreground, background) >= 4.5, `${mode}: ${label} text must be at least 4.5:1`)
    }

    for (const background of [surface, sidebar, popover]) {
      assert.ok(contrast(colors.border, background) >= 3, `${mode}: border UI contrast must be at least 3:1`)
      assert.ok(contrast(colors.midground, background) >= 3, `${mode}: focus/selection accent must be at least 3:1`)
    }

    const selection = composite(colors.midground, colors.background, 0.32)
    assert.ok(contrast(colors.foreground, selection) >= 4.5, `${mode}: text on selection must be at least 4.5:1`)

    const terminal = mode === 'light' ? glassTheme.terminal : glassTheme.darkTerminal
    for (const [slot, value] of Object.entries(terminal)) {
      if (slot === 'selectionBackground') {
        continue
      }

      assert.ok(contrast(value, colors.card) >= (slot === 'cursor' ? 3 : 4.5), `${mode}: terminal ${slot} must be readable on the concrete canvas`)
    }
    assert.ok(
      contrast(terminal.foreground, terminal.selectionBackground) >= 4.5,
      `${mode}: terminal selection must retain normal text contrast`
    )
  })
}

