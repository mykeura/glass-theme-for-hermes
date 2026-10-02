// SPDX-FileCopyrightText: 2026 Miguel Euraque
// SPDX-License-Identifier: LicenseRef-Miguel-Euraque-Proprietary

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../desktop/plugin.js', import.meta.url), 'utf8')
const moduleSource = source.replace(
  "import { THEMES_AREA } from '@hermes/plugin-sdk'",
  "const THEMES_AREA = 'themes'"
)
const { glassTheme } = await import(`data:text/javascript,${encodeURIComponent(moduleSource)}`)

const channels = color => {
  const value = color.replace(/^#/, '')
  assert.match(value, /^[\da-f]{6}$/i, `expected a six-digit hex colour: ${color}`)
  return [0, 2, 4].map(offset => Number.parseInt(value.slice(offset, offset + 2), 16) / 255)
}

const luminance = color =>
  channels(color)
    .map(channel => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)

const contrast = (foreground, background) => {
  const foregroundL = luminance(foreground)
  const backgroundL = luminance(background)
  return (Math.max(foregroundL, backgroundL) + 0.05) / (Math.min(foregroundL, backgroundL) + 0.05)
}

const composite = (foreground, background, alpha) => {
  const fg = channels(foreground)
  const bg = channels(background)
  return `#${fg.map((channel, index) => Math.round((channel * alpha + bg[index] * (1 - alpha)) * 255).toString(16).padStart(2, '0')).join('')}`
}

for (const [mode, colors] of Object.entries({ light: glassTheme.colors, dark: glassTheme.darkColors })) {
  test(`${mode} theme preserves composited text and UI contrast`, () => {
    const surface = composite(colors.card, colors.background, 0.78)
    const sidebar = composite(colors.sidebarBackground, colors.background, 0.84)
    const popover = composite(colors.popover, colors.background, 0.9)
    const surfaces = [colors.background, surface, sidebar, popover]

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
    }
  })
}

test('Glass CSS has an opaque fallback for reduced transparency and missing blur', () => {
  assert.match(glassTheme.customCSS, /--glass-surface: var\(--theme-card-seed\)/)
  assert.match(glassTheme.customCSS, /backdrop-filter: none/)
  assert.match(glassTheme.customCSS, /-webkit-backdrop-filter: none/)
})
