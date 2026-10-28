// SPDX-FileCopyrightText: 2026 Miguel Euraque
// SPDX-License-Identifier: MIT

import assert from 'node:assert/strict'

// Shared WCAG luminance/contrast helpers, extracted from tests/contrast.test.mjs so
// other test files (e.g. tests/skins.test.mjs) reuse them instead of duplicating them.
export const channels = color => {
  const value = color.replace(/^#/, '')
  assert.match(value, /^[\da-f]{6}$/i, `expected a six-digit hex colour: ${color}`)
  return [0, 2, 4].map(offset => Number.parseInt(value.slice(offset, offset + 2), 16) / 255)
}

export const luminance = color =>
  channels(color)
    .map(channel => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)

export const contrast = (foreground, background) => {
  const foregroundL = luminance(foreground)
  const backgroundL = luminance(background)
  return (Math.max(foregroundL, backgroundL) + 0.05) / (Math.min(foregroundL, backgroundL) + 0.05)
}

export const composite = (foreground, background, alpha) => {
  const fg = channels(foreground)
  const bg = channels(background)
  return `#${fg.map((channel, index) => Math.round((channel * alpha + bg[index] * (1 - alpha)) * 255).toString(16).padStart(2, '0')).join('')}`
}
