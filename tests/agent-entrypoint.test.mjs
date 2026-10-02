// SPDX-FileCopyrightText: 2026 Miguel Euraque
// SPDX-License-Identifier: LicenseRef-Miguel-Euraque-Proprietary

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const entrypoint = new URL('../__init__.py', import.meta.url)

test('Agent compatibility entrypoint loads without registering capabilities', () => {
  const probe = String.raw`
import importlib.util
import sys

spec = importlib.util.spec_from_file_location("glass_theme_agent", sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class Context:
    def register(self, *args, **kwargs):
        raise AssertionError("Desktop-only theme must not register Agent capabilities")

assert module.register(Context()) is None
`
  const output = execFileSync('python3', ['-B', '-c', probe, entrypoint.pathname], { encoding: 'utf8' })
  assert.equal(output, '')
})
