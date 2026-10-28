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
  assert.equal(registrations[0].data.description, 'Glass surfaces in light and dark')
  assert.equal(registrations[0].data.customCSS, undefined)
  assert.ok(registrations[0].data.darkColors)
  assert.ok(registrations[0].data.terminal)
  assert.ok(registrations[0].data.darkTerminal)
})

test('uses host-owned theme markers and does not inject or observe the DOM', () => {
  assert.doesNotMatch(source, /MutationObserver|createElement|appendChild|document\./)
})
