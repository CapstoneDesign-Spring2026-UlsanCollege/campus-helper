
# GitHub Features You Might Want

> This is a menu—pick 1–2 features that reduce pain for your team. You don't need all of them.

## Baseline (Required)

### Issues

Use Issues for:
- Tasks
- Bugs
- Risks/blockers
- Weekly Sprint Packet (submission)

**Rule:** If you do work, there should be an Issue and/or PR link.

### Pull Requests (PRs)

Use PRs for:
- All code changes
- Documentation changes that matter
- Reviews and feedback

**Important:** Fill in the PR template, especially the **How Tested** section.

## Recommended Upgrades

### Labels

Use labels to keep issues scannable:
- `bug`, `risk`, `blocker`, `docs`, `testing`, `ci`, `ux`, `backend`, `frontend`

**Tip:** Labels make your Sprint Packet snapshot cleaner.

### Milestones
Use Milestones for:
- “MVP”
- “Midterm demo”
- “Final demo”

Add Issues to the milestone so you can see progress at a glance.

### Projects (GitHub Projects v2)

Use Projects when:
- Your Issue list gets messy
- You want a simple To Do / Doing / Done board

**Minimum setup:**
- Columns: To Do / Doing / Done
- Each card has an owner (assignee)

## Optional Features

### Discussions

Use Discussions when:
- You want brainstorming without cluttering Issues
- You want Q&A threads for your project

### Releases + Tags

Use Releases when:
- You reach a version (midterm/final)
- You want a stable checkpoint

### GitHub Pages

Use Pages when:
- You want free hosting for a simple documentation site
- You want a public project page

### Wiki

Usually skip. Instead, keep docs in `/docs` so they're versioned and reviewed via PR.

## Advanced Quality-of-Life Features

### Branch Protection

Protect `main` to keep it demoable:
- Require PRs
- Require 1 review
- Block force pushes

### CODEOWNERS

Auto-request reviews from certain teammates. Useful if you want the PM or QA owner to review all merges.

### GitHub Actions (CI)

Use Actions when:
- Your project can run reliably
- You want automatic tests/lint on every PR

**Tip:** Start small (one test command), then add more later.

## Quick Decision Guide

**If your team is overwhelmed:** Pick **Projects** + **Labels** only.

**If your team breaks demos:** Add **Branch Protection** + basic **CI**.

