# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-28

### Added

- CLI/TUI skins `glass-light` and `glass-dark` with the theme's banner emblem and wordmark for the Hermes Agent terminal.
- Plugin manifest version 2, declaring `requires_hermes: >=0.21.3`.

### Fixed

- Stale tests that could leave the contrast gate unexecuted; the suite now covers the CLI skins' structure, banner geometry, and contrast thresholds.

### Changed

- Minimum supported Hermes Agent version raised to `>=0.21.3`, as declared by the manifest.

## [0.1.3] - 2026-10-06

- Routine version bump only; no user-facing changes.

[0.2.0]: https://github.com/mykeura/glass-theme-for-hermes/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/mykeura/glass-theme-for-hermes/compare/v0.1.2...v0.1.3
