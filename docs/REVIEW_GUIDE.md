Reviewer Guide

Quick checklist for reviewing the `chore/scaffold` changes locally and in CI.

Local verification
- Clone or fetch the branch and checkout: `git fetch && git checkout chore/scaffold`
- Install deps: `npm install`
- Run quick verify (build + tests): `npm run verify`
- Start dev server: `npm run dev -- --host --port 5173` and open `http://localhost:5173` to sanity-check the landing page, About and Demo routes.

What to review in code
- `index.html`, `about.html` — content, metadata, accessibility basics (alt text for images if added).
- `src/` — demo code, utilities, tests: `src/main.jsx`, `src/pages/*`, `src/utils/*`.
- `src/pages/Demo.jsx` and `src/utils/notes.js` — verify intended persistence behavior and fallbacks for non-browser envs.
- `package.json`, `vite.config.js`, `vitest.config.js` — scripts, deps, test configuration.
- `.github/workflows/*` — confirm CI jobs (test, ci build+test, deploy-pages, e2e) match expectations and don't run secrets in the wrong context.
- `CHANGELOG.md`, `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` — confirm copy and next steps for contributors.

CI checks to expect
- `CI — build & test` (build + tests) should pass on PR.
- `E2E — Playwright tests` will run Playwright on the runner; it requires Playwright to install browsers, which the workflow includes.
- `Deploy to GitHub Pages` will run on `main` and deploy the built `dist/` site.

If something is failing
- Capture failing logs from the GitHub Actions run; they point to the failing job and step.
- Reproduce locally with `npm run verify` and iterate.

When ready to merge
- Ensure at least one approving review, CI checks green, and CHANGELOG entry is acceptable.
- Merge with a descriptive merge method (squash or merge per repo rules) and tag a release if appropriate.
