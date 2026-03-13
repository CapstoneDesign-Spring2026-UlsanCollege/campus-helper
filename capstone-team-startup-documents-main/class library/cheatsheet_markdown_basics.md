# CHEATSHEET — Markdown Basics (Capstone)

**Goal:** Write clean, scannable docs in **`/docs`** using Markdown (`.md`).

Markdown = readable text + simple formatting. GitHub renders it automatically.

---

## Headings (structure)
```md
# Title (H1)
## Section (H2)
### Subsection (H3)
```
**Pro tip:** Most docs should be H1 + H2 sections only.

---

## Bold / italic (emphasis)
```md
**bold**
*italic*
```

---

## Lists (make docs scannable)
### Bullet list
```md
- item
- item
  - sub-item
```

### Numbered list
```md
1) step one
2) step two
3) step three
```

---

## Checklists (perfect for Definition of Done)
```md
- [ ] not done
- [x] done
```

---

## Links (evidence lives here)
```md
[link text](https://example.com)
```
Use links as **receipts** (PRs, issues, CI runs, demo links).

---

## Images / screenshots
```md
![alt text](path/to/image.png)
```
On GitHub, you can also **drag-and-drop** an image into an Issue/PR comment and it auto-uploads.

---

## Code (inline + blocks)
Inline:
```md
Use `npm test` to run tests.
```

Block:
```md
```bash
npm test
```
```
Yes, it’s triple backticks.

---

## Tables (use sparingly)
```md
| Item | Owner | Status |
|---|---|---|
| Login page | Mina | Doing |
| API auth | Joon | To Do |
```

---

## Blockquotes (decisions / important notes)
```md
> Decision: We will use SQLite for local development.
```

---

## Copy/paste doc templates (use these in `/docs`)

### 1) Simple doc template
```md
# Document Title

## Purpose
One sentence: why this doc exists.

## Overview
- What the system does
- Who uses it
- What “done” means

## How to run
1) steps
2) steps

## Key decisions
- Decision + reason
- Decision + reason

## Known issues / risks
- risk + mitigation
```

### 2) Runbook template (`/docs/Runbook.md`)
```md
# Runbook

## Quick start
1) Install: …
2) Configure: …
3) Run locally: …
4) Run tests: …

## Deploy
- URL:
- Deploy steps:
- Rollback plan:

## Troubleshooting
- Problem: …
  - Fix: …

## Demo backup
- If live demo fails, show:
  - video link / screenshots
  - local run steps
```

---

## “Good Markdown” rules (don’t overthink)
- Use H2 sections (`##`) to structure
- Use checklists for DoD
- Use links for evidence
- Keep paragraphs short
- Screenshots beat long explanations

**Class rule reminder:** If it isn’t linked, it didn’t happen.

