<!--
STUDENT NOTE: Revisions reward improvement, not deadline avoidance.
If you miss a deadline, that work may still be required, but it stays zero.
-->

# POLICY — Revisions (Improvement-Only)

## How to use this policy
- Plan to submit on time.
- Use revision windows to make already-submitted work **better**.
- Always include evidence links showing what changed.

## Purpose
Revisions exist to reward improvement and help you ship higher-quality work.
They are not a way to erase missed deadlines.

## Core rules
1) **Revision windows only**  
   Revisions are accepted only during announced revision windows.

2) **Improvement-only**  
   A revision must clearly improve quality (clarity, correctness, testing, stability, documentation, UX, etc.).

3) **Missed work stays missed**  
   If something was not submitted on time, it may still be required to complete, but it remains **zero**.

4) **Evidence required**  
   Revisions must include links showing what changed (PRs, commits, tests, demos).

## What can be revised
- Weekly Sprint Packets (clarity, completeness, better evidence, better demo readiness)
- Documentation in `/docs`
- Code quality improvements (tests, CI, bug fixes, refactors)
- Demo reliability (repeatable setup, backup plan)

## What cannot be revised
- Anything outside the revision window
- “Cosmetic” changes that don’t improve quality (typos only, trivial formatting)
- Revisions with no evidence

## How to submit a revision (exact process)
1) Open a **Revision Issue** (or comment on the original Sprint Packet) titled:  
   `Revision Request — Week X — <short summary>`
2) Create a **PR** that makes the improvements
3) In the PR description, include:
   - What changed (bullets)
   - Why it’s better
   - Evidence links (tests/CI/demo)
   - What to review
4) Merge after review (or instructor approval, depending on repo settings)

## Common mistakes
- Submitting revisions as direct commits to `main`
- No before/after explanation
- No proof the fix works (no tests, no demo)

## What “good” looks like
- Adds tests + CI check passes
- Fixes a recurring demo failure and documents the steps
- Turns a vague Sprint Packet into a clear plan with owners + DoD + real receipts
