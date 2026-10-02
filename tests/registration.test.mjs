// SPDX-FileCopyrightText: 2026 Miguel Euraque
// SPDX-License-Identifier: MIT

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../desktop/plugin.js', import.meta.url), 'utf8')
const moduleSource = source.replace(
  "import { THEMES_AREA } from '@hermes/plugin-sdk'",
  "const THEMES_AREA = 'themes'"
)
const plugin = await import(`data:text/javascript,${encodeURIComponent(moduleSource)}`)

test('registers exactly one native Glass theme contribution', () => {
  const registrations = []
  const ctx = { register: contribution => registrations.push(contribution) }

  plugin.default.register(ctx)

  assert.equal(plugin.default.id, 'glass-theme')
  assert.equal(registrations.length, 1)
  assert.equal(registrations[0].area, 'themes')
  assert.equal(registrations[0].id, 'glass')
  assert.equal(registrations[0].data.name, 'glass')
  assert.equal(registrations[0].data.description, 'Teal glass theme with light and dark palettes.')
  assert.equal(registrations[0].data.customCSS, plugin.glassCSS)
  assert.ok(registrations[0].data.darkColors)
})

test('uses host-owned theme markers and does not inject or observe the DOM', () => {
  assert.match(plugin.glassCSS, /data-hermes-theme='glass'/)
  assert.match(plugin.glassCSS, /--glass-border: var\(--dt-border\)/)
  assert.match(plugin.glassCSS, /--ui-terminal-surface-background: var\(--theme-card-seed\)/)
  assert.match(plugin.glassCSS, /\.xterm-screen, \.xterm-viewport/)
  assert.match(plugin.glassCSS, /--ui-text-tertiary: color-mix\(in srgb, var\(--theme-foreground\) 74%/)
  assert.match(plugin.glassCSS, /button:disabled/)
  assert.match(plugin.glassCSS, /background-color: var\(--theme-card-seed\)/)
  assert.match(plugin.glassCSS, /filter: none/)
  assert.match(plugin.glassCSS, /prefers-reduced-transparency/)
  assert.match(plugin.glassCSS, /@supports not \(backdrop-filter: blur\(1px\)\)/)
  assert.doesNotMatch(plugin.glassCSS, /MutationObserver|createElement|appendChild|document\./)
})
