# AI Code Ownership Audit - Campus Helper

## Team + Project

- **Team:** LKRB
- **Project name:** Campus Helper
- **Current repo:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper
- **Current demo link:** https://ulsan-campus-plus-6mvfqdh9d-ulsanassignment-7071s-projects.vercel.app/
- **Date updated:** 2026-04-29

---

## What Our App Currently Does

Campus Helper is a full-stack student web app that combines core campus workflows in one authenticated platform. Students can create accounts, log in, open a dashboard, chat with other users, and use campus service modules such as marketplace and lost-and-found.

Additional modules include AI assistant, timetable, notes, and admin notices.

- Login (student/admin authentication)
- Create account (signup flow)
- Chat (direct communication)
- Marketplace (post/browse items)

### Current MVP Flow

A user can:

- Log in to the application
- Access the marketplace
- Chat with other users
- Report lost-and-found items

---

## What Works Right Now

| Working item | Evidence link | Owner |
|---|---|---|
| Login + signup flow | `docs/PROJECT.md`, Sprint docs, demo URL | Laxman Bhattarai |
| Chat module | `docs/PROJECT.md`, `docs/SPRINT_2.md` | Ujwol Upreti |
| Marketplace & lost-and-found | `docs/PROJECT.md`, demo URL | Rajim Danwar |
| Midterm demo plan | `docs/SPRINT_2.md` | Bibek Kunwar |

---

## Code We Understand

| Code area | File / folder | What it does | Owner |
|---|---|---|---|
| Product scope | `docs/PROJECT.md` | Defines features and MVP | Kushal Kharka |
| Demo readiness | `docs/SPRINT_2.md` | Demo plan and risks | Bibek Kunwar |
| Team workflow | `docs/TEAM_AGREEMENT.md` | Team roles and process | Laxman Bhattarai |
| Sprint planning | `docs/sprints/` | Weekly progress tracking | Rajim Danwar |

---

## Code We Do NOT Fully Understand Yet

| Code area | Issue | Risk | Owner | Next step |
|---|---|---|---|---|
| AI streaming | Prompt pipeline unclear | Medium | Rajim Danwar | Trace request flow |
| Authentication | Token handling unclear | High | Laxman Bhattarai | Add auth test cases |
| Real-time chat | Weak network behavior unknown | Medium | Ujwol Upreti | Run reliability tests |
| Deployment | Env mismatch risk | High | Bibek Kunwar | Verify environment setup |

---

## AI-Assisted Work

| Area | AI contribution | Human validation |
|---|---|---|
| Documentation | Structured sprint and audit docs | Reviewed by team |
| Feature planning | Broke features into tasks | Prioritized by team |
| Audit adaptation | Customized template | Needs final review |

---

## Bugs / Unreliable Features

| Issue | Severity | Owner | Action |
|---|---|---|---|
| Demo failure due to missing env/services | P1 | Bibek Kunwar | Add preflight checklist |
| AI depends on API reliability | P1 | Rajim Danwar | Prepare fallback demo |
| Admin login dependency | P1 | Laxman Bhattarai | Maintain test account |
| Missing evidence links | P2 | Kushal Kharka | Add screenshots/videos |

---

## Risk List

| Risk | Impact | Mitigation | Owner |
|---|---|---|---|
| External API failure | Demo failure | Backup demo | Ujwol Upreti |
| Missing links | Work not accepted | Enforce linking rule | Kushal Kharka |
| Unclear ownership | Weak explanation | Maintain audit | Laxman Bhattarai |
| Low test coverage | Bugs in demo | Add tests | Bibek Kunwar |

---

## Team Ownership Map

| Member | Area | Status | Needs Help |
|---|---|---|---|
| Laxman Bhattarai | Auth flow | Clear | Edge-case testing |
| Kushal Kharka | Documentation | Clear | Technical depth |
| Bibek Kunwar | QA & reliability | Clear | Automation |
| Ujwol Upreti | Demo & chat | Clear | Network issues |
| Rajim Danwar | Integration | Clear | AI logging |

---

## Stabilization Goals

- Ensure full MVP flow works reliably
- Improve demo reliability with backups
- Make ownership clear for all team members

---

## Definition of Done (Sprint 3)

- [ ] MVP flow works
- [ ] Evidence is linked
- [ ] Critical bugs are fixed or documented
- [ ] Each member explains one area
- [ ] AI work reviewed
- [ ] Sprint packet links this audit
