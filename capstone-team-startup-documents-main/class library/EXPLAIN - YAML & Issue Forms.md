<!--
How to use:
- Read this once in Week 1.
- When an Issue template breaks, come here first.
- If you edit YAML, make tiny changes and preview carefully.
-->

# YAML and GitHub Issue Forms

## What this file explains
This guide explains what your `.yml` files do, where they live, and how to avoid common mistakes when editing them.

## What is YAML?
YAML (files ending in `.yml` or `.yaml`) is a simple format for structured data.

- **Indentation matters**: use spaces, not tabs.
- YAML is used to configure tools like GitHub Issue templates and GitHub Actions.

Example:

```yml
name: Weekly Sprint Packet
labels: ["sprint-packet"]
```

## Where our YAML files live
This repo uses YAML in two main places.

### 1. Issue Forms
Path: `.github/ISSUE_TEMPLATE/*.yml`

These files define the form you see when you click:
`Issues -> New issue -> choose a template`

Each form controls:

- Title pattern
- Default labels
- Required fields
- Help text shown to students

### 2. Issue Template Config
Path: `.github/ISSUE_TEMPLATE/config.yml`

This file controls global Issue template behavior:

- Allow or disable blank issues
- Add contact links (how to ask for help)

## Why we use Issue Forms
Issue Forms force consistency:

- Same weekly submission structure
- Same evidence fields
- Faster grading with fewer "what do we submit?" questions

## Common YAML mistakes (and how to avoid them)
### Tabs instead of spaces
YAML rejects tabs. Use spaces only.

### Broken indentation
This is wrong:

```yml
body:
- type: input
   id: demo_link
```

This is right:

```yml
body:
  - type: input
    id: demo_link
```

### Quote usage issues
If your text contains `:` or special characters, wrapping it in quotes can prevent parsing errors.

## Issue Form building blocks
In our templates, you will see:

- `type: markdown` -> instructions only (no input)
- `type: input` -> one-line field
- `type: textarea` -> multi-line field
- `type: dropdown` -> select one option

Each input typically has:

- `id`: internal name (do not reuse)
- `label`: what users see
- `description`: helper text
- `validations`: `required: true` or `required: false`

## Editing rules (to avoid breaking the repo)
If you need to change an Issue Form:

1. Create a new branch.
2. Change one small thing.
3. Open a PR.
4. In the PR, explain what changed and why.

If the form is invalid, GitHub may hide it or show errors.

## If you do not want to edit YAML
You do not need to. Most teams never edit templates and only use them.

## Extra: YAML is also used for GitHub Actions
You may later see workflows in:
`.github/workflows/*.yml`

These files define automated checks (CI). Add or change them only after your project runs consistently.
