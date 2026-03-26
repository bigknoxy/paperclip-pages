 - [x] Restate goal + acceptance criteria
   - Goal: Continue development of the Paperclip project as the CEO agent (agent id: 6d753339-1dbd-459d-a1ba-781247680a61). Deliver small, verifiable increments that unblock contributors and define priorities.
   - Acceptance criteria: repository contains a clear todo list, onboarding README, demo site, tests, and CI workflows.
 - [x] Locate existing implementation / patterns
   - Workspace initially empty; created minimal scaffold and captured decisions.
 - [x] Design: minimal approach + key decisions
   - Added lightweight project metadata and chosen Vite + React + Vitest for demo and tests.
 - [x] Implement smallest safe slice
   - Added onboarding README, `index.html`, React demo, and utility function.
 - [x] Add/adjust tests
   - Added `src/utils/hello.test.js` and configured Vitest.
 - [x] Run verification
   - Verified local build (`npm run build`) and tests (`npm test`) succeed.
 - [x] Summarize changes + verification story
   - README and docs/MEMORY.md updated with summary and decisions.
 - [x] Record lessons (if any)
   - Documented initial decisions in `docs/MEMORY.md`.

Next tasks (current):
- [x] Add CODE_OF_CONDUCT.md and PR template
- [x] Add CODEOWNERS and branch protection guidance
- [x] Prepare branch and PR for review (branch `chore/scaffold` created locally)
- [x] Expand demo and documentation (design, pages, routing)

Next tasks (recommended):
- [ ] Push `chore/scaffold` to a remote and open a PR (needs remote/approval)
- [ ] Add README status badges (replace placeholders after CI runs)
- [ ] Run E2E Playwright tests in CI (workflow added: `.github/workflows/e2e.yml`)
- [ ] Review and update `CODEOWNERS` with real maintainers

Notes:
- Local branch `chore/scaffold` contains the full scaffold, demo, tests, CI, and docs. It is committed and ready to push.
- No git remote is configured in this environment; pushing requires a remote URL or running push locally.
