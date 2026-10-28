// SPDX-FileCopyrightText: 2026 Miguel Euraque
// SPDX-License-Identifier: MIT

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { contrast } from './helpers/contrast.mjs'

// ---------------------------------------------------------------------------
// Minimal YAML reader (no external dependencies: the package is `private` and
// carries no `dependencies`). The skins are flat YAML — top-level scalars,
// one-level nested maps, and `|` block scalars — which is all this parses.
// Anything more exotic should be treated as a schema failure, not parsed here.
// ---------------------------------------------------------------------------
const parseSkinYaml = text => {
  const root = {}
  let section = null // nested map currently being filled
  let block = null // { key, indent, lines } while consuming a `|` block scalar

  const scalar = value => {
    const trimmed = value.trim()
    if (trimmed.length >= 2 && ((trimmed[0] === '"' && trimmed.at(-1) === '"') || (trimmed[0] === "'" && trimmed.at(-1) === "'"))) {
      return trimmed.slice(1, -1)
    }
    return trimmed
  }

  for (const line of text.split('\n')) {
    if (block) {
      if (line.trim() === '') {
        block = null // blank line ends a block scalar in these files
        continue
      }
      if (block.indent === null) {
        block.indent = line.match(/^ */)[0].length
      }
      if (line.startsWith(' '.repeat(block.indent))) {
        block.lines.push(line.slice(block.indent))
        continue
      }
      block = null // dedented line ends the block; fall through and parse it normally
    }

    const blockMatch = line.match(/^([A-Za-z_][\w]*): \|$/)
    if (blockMatch) {
      block = { key: blockMatch[1], indent: null, lines: [] }
      root[blockMatch[1]] = block.lines
      continue
    }

    if (line.startsWith('#') || line.trim() === '') continue // comment or blank

    const sectionMatch = line.match(/^([A-Za-z_][\w]*):$/)
    if (sectionMatch) {
      section = sectionMatch[1]
      root[section] = {}
      continue
    }

    const entryMatch = line.match(/^ {2}([A-Za-z_][\w]*): (.*)$/)
    if (entryMatch && section) {
      root[section][entryMatch[1]] = scalar(entryMatch[2])
      continue
    }

    const scalarMatch = line.match(/^([A-Za-z_][\w]*): (.*)$/)
    if (scalarMatch) {
      root[scalarMatch[1]] = scalar(scalarMatch[2])
      continue
    }

    assert.fail(`unparsed YAML line: ${JSON.stringify(line)}`)
  }
  return root
}

const skinFiles = ['glass-light', 'glass-dark']
const skins = Object.fromEntries(
  await Promise.all(skinFiles.map(async name => [
    name,
    parseSkinYaml(await readFile(new URL(`../skins/${name}.yaml`, import.meta.url), 'utf8'))
  ]))
)

// The colour key set that defines a skin. Taken from hermes_cli/skin_engine.py —
// the CLI surface keys of the built-in `default` skin plus the glass overlay keys
// (background, ui_text, ui_thinking, ui_border, ui_tool, diff_*, syntax_*) that
// the skins inherited from the desktop theme's colour roles.
const EXPECTED_COLOR_KEYS = [
  'background', 'banner_accent', 'banner_border', 'banner_dim', 'banner_text',
  'banner_title', 'completion_menu_bg', 'completion_menu_current_bg', 'diff_added',
  'diff_removed', 'input_rule', 'prompt', 'response_border', 'selection_bg',
  'session_border', 'session_label', 'status_bar_bad', 'status_bar_bg',
  'status_bar_critical', 'status_bar_dim', 'status_bar_good', 'status_bar_strong',
  'status_bar_text', 'status_bar_warn', 'syntax_comment', 'syntax_keyword',
  'syntax_number', 'syntax_string', 'ui_accent', 'ui_border', 'ui_error', 'ui_label',
  'ui_ok', 'ui_text', 'ui_thinking', 'ui_tool', 'ui_warn', 'voice_status_bg'
]
assert.equal(EXPECTED_COLOR_KEYS.length, 38)

// Built-in skin names from _BUILTIN_SKINS in hermes_cli/skin_engine.py; the
// minimalist-* family lives in ~/.hermes/skins/ and is covered by the prefix check.
const BUILTIN_SKIN_NAMES = [
  'default', 'ares', 'mono', 'slate', 'daylight',
  'warm-lightmode', 'poseidon', 'sisyphus', 'charizard'
]

const stripBannerMarkup = row => row.replace(/\[#[0-9a-fA-F]{6}\]|\[\/\]/g, '')

for (const [name, skin] of Object.entries(skins)) {
  test(`${name}: declares a glass-prefixed name and a non-empty description`, () => {
    assert.match(skin.name, /^glass-/)
    assert.equal(skin.name, name)
    assert.ok(skin.description.trim().length > 0)
  })

  test(`${name}: defines all 38 colour keys as six-digit hex`, () => {
    assert.deepEqual(Object.keys(skin.colors).sort(), EXPECTED_COLOR_KEYS)
    for (const key of EXPECTED_COLOR_KEYS) {
      assert.match(skin.colors[key], /^#[0-9a-fA-F]{6}$/, `${key} must be a six-digit hex colour, got ${skin.colors[key]}`)
    }
  })

  test(`${name}: hero banner is 13 rows of at most 30 cells`, () => {
    assert.equal(skin.banner_hero.length, 13)
    for (const [index, row] of skin.banner_hero.entries()) {
      const cells = stripBannerMarkup(row).length
      assert.ok(cells <= 30, `hero row ${index + 1} is ${cells} cells (max 30): ${row}`)
    }
  })

  test(`${name}: logo banner is 6 rows opening with bold markup`, () => {
    assert.equal(skin.banner_logo.length, 6)
    assert.ok(skin.banner_logo[0].startsWith('[bold #'), `first logo row must open with "[bold #", got ${skin.banner_logo[0].slice(0, 20)}`)
  })

  test(`${name}: body text and status text stay readable on the background`, () => {
    const background = skin.colors.background
    const textRatio = contrast(skin.colors.ui_text, background)
    assert.ok(textRatio >= 4.5, `ui_text on background is ${textRatio.toFixed(3)}:1 (needs 4.5:1)`)
    for (const key of ['ui_warn', 'ui_error']) {
      const ratio = contrast(skin.colors[key], background)
      assert.ok(ratio >= 3, `${key} on background is ${ratio.toFixed(3)}:1 (needs 3:1)`)
    }
  })
}

test('skin names never collide with built-in or minimalist skins', () => {
  for (const name of Object.keys(skins)) {
    assert.ok(!BUILTIN_SKIN_NAMES.includes(name), `${name} collides with a built-in skin`)
    assert.ok(!name.startsWith('minimalist-'), `${name} collides with the minimalist-* family`)
  }
})
