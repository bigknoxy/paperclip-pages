Branch Protection Guidance

Recommended minimal branch protection rules for `main`:

- Require pull requests for all changes to `main` (disable direct pushes).
- Require at least one approving review before merging; consider 2 for high-risk repos.
- Require status checks to pass: `tests` workflow and build (if present).
- Require linear history (no merge commits) or squash merges depending on preferred workflow.
- Enable dismissing stale reviews when new commits are pushed.
- Restrict who can push to `main` to the `CODEOWNERS` or a small set of maintainer teams.

How to enable
1. Go to the repository Settings → Branches → Add rule.
2. Enter `main` as the branch name pattern and enable the checks above.
3. Optionally enable required signed commits and require admin enforcement.

Notes
- Applying strict rules before adding CODEOWNERS may block all merges; update `CODEOWNERS` first with real usernames or teams.
- Start with lenient rules (require PR + passing tests) and tighten after onboarding contributors.
