# Final Repo Cleanup Cheatsheet

## Goal

Make the repository understandable, runnable, and safe.

## 1. Remove Secrets

Check for:

- API keys,
- passwords,
- database credentials,
- private tokens,
- `.env` files,
- service-account files,
- and private URLs.

Use:

```txt
.env.example
```

to show required variable names without exposing real values.

## 2. Test Important Links

Check:

- root README,
- `portfolio/README.md`,
- Weekly Sprint Packet links,
- PR links,
- Issue links,
- screenshots,
- docs links,
- presentation links,
- and individual portfolio links.

## 3. Clean Up Names

Rename confusing files when easy.

Weak:

```txt
new.md
final-final2.md
test2.js
stuff/
```

Better:

```txt
proposal-final.md
architecture-v2.md
login-validation.test.js
qa-checklists/
```

## 4. Test Setup Instructions

Ask:

- Can a new developer install dependencies?
- Are environment variables explained?
- Are run commands correct?
- Are test commands correct?
- Is seed data explained?
- Are common errors explained?

## 5. Test the Demo

Before presentation day:

- test login,
- test demo accounts,
- test internet,
- test local run,
- test database,
- test external APIs,
- test sample data,
- test your laptop,
- test display connection,
- and test your backup.

## 6. Check Portfolio Navigation

Open:

```txt
portfolio/README.md
```

Then click every important link.

## 7. Final Question

Can another developer understand what you built without asking your team ten questions?

If not, improve the docs.
