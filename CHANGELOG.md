# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-24
### Added
- Initial scaffold: landing page (`index.html`) and a small React demo mounted at `/src/main.jsx`.
- Vite build configuration (`vite.config.js`) and npm scripts in `package.json`.
- Simple utility `src/utils/hello.js` with a unit test (`src/utils/hello.test.js`) and Vitest config (`vitest.config.js`).
- GitHub Actions workflows:
  - `.github/workflows/test.yml` — run tests on push/PR
  - `.github/workflows/deploy-pages.yml` — build and deploy `dist/` to GitHub Pages
- Documentation and contributor tooling: `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue templates, PR template, `CODEOWNERS` (placeholder), and branch protection guidance in `docs/BRANCH_PROTECTION.md`.
- Small social assets: `assets/og-image.svg`, `assets/favicon.svg`, and `about.html`.

### Verification
- Local `npm run build` completed and produced `dist/`.
- `npm test` (Vitest) ran and passed the example unit test.

### Notes
- A local branch `chore/scaffold` was created for these changes. It has not been pushed — push and create a PR when ready.
