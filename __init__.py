# SPDX-FileCopyrightText: 2026 Miguel Euraque
# SPDX-License-Identifier: LicenseRef-Miguel-Euraque-Proprietary

"""Hermes Agent compatibility entrypoint for the Desktop-only Glass theme.

The visual contribution is registered by desktop/plugin.js in Hermes Desktop.
Hermes Agent loads unified plugin packages through this module; keeping this
entrypoint intentionally inert avoids exposing UI-only behavior as Agent tools.
"""


def register(ctx):
    """Satisfy Hermes Agent's plugin contract without registering capabilities."""
    del ctx
