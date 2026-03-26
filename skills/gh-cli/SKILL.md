# Skill: gh-cli

GitHub CLI (gh) skill for automating repository operations, pull requests, issues, and GitHub Pages deployments.

## Overview

The `gh` CLI is GitHub's official command-line tool for interacting with GitHub from the terminal. This skill provides common workflows and patterns for repository management.

## Prerequisites

- `gh` CLI installed and authenticated (`gh auth status`)
- Repository with git remote configured

## Quick Reference

### Authentication

```bash
gh auth status          # Check authentication status
gh auth login           # Login to GitHub
gh auth token           # Get current auth token
```

### Repository Operations

```bash
gh repo view            # View repository details
gh repo view --json name,url,defaultBranchRef
gh repo sync            # Sync fork with upstream
```

### Pull Requests

```bash
gh pr create --title "..." --body "..."     # Create PR
gh pr list                                    # List PRs
gh pr checkout <number>                       # Checkout PR branch
gh pr merge <number> --squash                 # Merge PR
gh pr review <number> --approve              # Approve PR
```

### Issues

```bash
gh issue create --title "..." --body "..."   # Create issue
gh issue list                                  # List issues
gh issue view <number>                         # View issue
gh issue close <number>                        # Close issue
```

### GitHub Actions & Pages

```bash
gh run list                                    # List workflow runs
gh run view <run-id>                           # View run details
gh api "repos/{owner}/{repo}/pages"            # Get Pages status
```

## Common Workflows

### Create PR from Current Branch

```bash
gh pr create --title "feat: add new feature" --body-file .github/PR_BODY.md
```

### Enable GitHub Pages

```bash
gh api "repos/{owner}/{repo}/pages" --method POST --input - <<'EOF'
{
  "source": {
    "branch": "main",
    "path": "/"
  }
}
EOF
```

### Get Pages URL

```bash
gh api "repos/{owner}/{repo}/pages" --jq '.html_url'
```

## Tips

- Use `--json` flag to get structured output for scripting
- Use `--jq` to filter JSON responses
- Most commands support `-R owner/repo` to target specific repos

## References

- Full documentation: https://cli.github.com/manual
- Cheat sheet: `gh --help`
