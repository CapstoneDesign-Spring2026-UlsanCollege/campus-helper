# Final Portfolio and Presentation Instructions

## Capstone Design — Spring 2026

## 1. Purpose

Your final portfolio is the professional handoff package for your semester project.

It should show:

- what your team built,
- how your project changed during the semester,
- what evidence proves the work is real,
- how to run and understand the project,
- how your team tested and stabilized the MVP,
- how AI tools were used responsibly,
- what each student personally contributed,
- and how your team is prepared to present and defend the project.

This is not a new report written from scratch. It is an organized portfolio of your real semester work.

## 2. Core Rules

1. **GitHub is the source of truth.**
2. **If it is not linked, it did not happen.**
3. Include the work and evidence that actually exist.
4. Do not invent missing historical documents.
5. Include every available version of important planning documents.
6. Rename and organize files where reasonably easy.
7. If moving a file would break useful links or create confusion, link to the original file instead.
8. AI-assisted work only counts if your team can run it, explain it, test it, debug it, and link evidence.
9. Every student must complete an individual portfolio page.
10. Your team is responsible for making the final presentation work.

## 3. Important Dates

| Item | Date and time |
|---|---|
| Final portfolio due | **Wednesday, June 17, 2026, by 8:00 AM** |
| Final presentations begin | **Wednesday, June 17, 2026, at 10:00 AM** |
| Maximum presentation time | **15 minutes per team** |

The portfolio is due before the presentations begin.

## 4. Where the Portfolio Goes

Create this folder inside your existing team repository:

```txt
portfolio/
```

Your instructor already has access to your repository. You do not need to upload a duplicate ZIP file or send a separate submission email.

The required starting point is:

```txt
portfolio/README.md
```

This file is the front door to your portfolio. It should help the instructor quickly find every major section.

## 5. Required Portfolio Structure

Use this structure as closely as possible:

```txt
portfolio/
├── README.md
│
├── 01-project-overview/
│   ├── PROJECT_SUMMARY.md
│   ├── FINAL_MVP_SCOPE.md
│   └── SCOPE_DECISIONS.md
│
├── 02-semester-journey/
│   ├── SEMESTER_JOURNEY.md
│   ├── weekly-sprints/
│   │   ├── WEEK_01.md
│   │   ├── WEEK_02.md
│   │   ├── ...
│   │   └── WEEK_16.md
│   └── sprint-summaries/
│       ├── SPRINT_01.md
│       ├── SPRINT_02.md
│       ├── SPRINT_03.md
│       ├── SPRINT_04.md
│       └── FINAL_SPRINT.md
│
├── 03-design-and-planning/
│   ├── proposals/
│   ├── user-research/
│   ├── wireframes/
│   ├── architecture/
│   ├── risk-and-scope/
│   └── planning-docs/
│
├── 04-final-product/
│   ├── FINAL_MVP_DEMO.md
│   ├── SETUP_AND_RUN_GUIDE.md
│   ├── ARCHITECTURE_FINAL.md
│   ├── DEPLOYMENT_AND_DEMO_PLAN.md
│   └── screenshots/
│
├── 05-qa-and-stabilization/
│   ├── QA_REPORT.md
│   ├── BUGS_AND_LIMITATIONS.md
│   ├── qa-checklists/
│   ├── test-evidence/
│   └── refactor-evidence/
│
├── 06-ai-and-code-ownership/
│   ├── AI_CODE_OWNERSHIP_AUDIT.md
│   ├── AI_USE_SUMMARY.md
│   └── representative-prs/
│
├── 07-final-presentation/
│   ├── FINAL_PRESENTATION_SCRIPT.md
│   ├── TECHNICAL_DEFENSE_PREP.md
│   ├── BACKUP_DEMO.md
│   └── slides/
│
└── 08-individual-portfolios/
    ├── STUDENT_NAME_1.md
    ├── STUDENT_NAME_2.md
    └── STUDENT_NAME_3.md
```

Small differences are acceptable if your portfolio is easy to navigate.

## 6. Project Overview

Create:

```txt
01-project-overview/PROJECT_SUMMARY.md
01-project-overview/FINAL_MVP_SCOPE.md
01-project-overview/SCOPE_DECISIONS.md
```

### `PROJECT_SUMMARY.md`

Include:

- team name,
- project name,
- team members,
- target user,
- problem,
- one-sentence value statement,
- final MVP summary,
- repo link,
- deployed app link if available,
- final screenshots,
- and links to the most important portfolio sections.

### `FINAL_MVP_SCOPE.md`

Include:

- the final core user flow,
- features included in the final MVP,
- features that work reliably,
- features that work with limitations,
- and features excluded from the final MVP.

### `SCOPE_DECISIONS.md`

Use a table:

| Feature or idea | Final status | Why | Evidence |
|---|---|---|---|
| Login flow | Included | Required for MVP | Link |
| Password reset | Cut | Not required for demo | Link |
| Admin dashboard | Nice Later | Core flow took priority | Link |

Use these statuses:

- **Included**
- **Cut**
- **Nice Later**
- **Incomplete**
- **Working with limitations**

## 7. Semester Journey

Create:

```txt
02-semester-journey/SEMESTER_JOURNEY.md
```

This is a readable index of your semester.

Include links to:

- weekly files,
- sprint summaries,
- proposals,
- wireframes,
- architecture documents,
- user research,
- scope documents,
- risks,
- QA evidence,
- major PRs,
- major bug fixes,
- and final presentation materials.

### Weekly files are required

Create one file for every week:

```txt
WEEK_01.md
WEEK_02.md
...
WEEK_16.md
```

Add the work and evidence you actually have for that week.

You may include:

- Weekly Sprint Packet Issues,
- presentation files,
- planning documents,
- screenshots,
- GitHub Issues,
- PRs,
- commits,
- demo videos,
- meeting notes,
- instructor feedback,
- or short notes.

If little exists for a week, say so honestly.

Example:

```md
# Week 03

## Materials We Have

- [Planning notes](...)
- [Relevant commit](...)

## Note

We do not have a formal Sprint Packet for this week.
```

Do not invent missing historical work.

### Sprint summaries are required

Create:

```txt
SPRINT_01.md
SPRINT_02.md
SPRINT_03.md
SPRINT_04.md
FINAL_SPRINT.md
```

Each sprint summary should include:

- goal,
- planned work,
- completed work,
- incomplete work,
- major scope changes,
- strongest evidence,
- bugs or risks,
- and what moved into the next sprint.

## 8. Design and Planning History

Use:

```txt
03-design-and-planning/
```

Include all available versions of major documents.

Examples:

```txt
proposal-v1.md
proposal-v2.md
proposal-final.md

architecture-v1.png
architecture-v2.md
architecture-final.md

risk-matrix-v1.md
risk-matrix-final.md

moscow-mvp-v1.md
moscow-mvp-final.md
```

Include the real versions you have.

Do not:

- delete older versions because they look messy,
- rewrite older documents to make the semester look cleaner,
- create fake versions after the semester ends,
- or hide decisions that changed.

The purpose is to show your development process.

## 9. Final Product Documentation

Create:

```txt
04-final-product/FINAL_MVP_DEMO.md
04-final-product/SETUP_AND_RUN_GUIDE.md
04-final-product/ARCHITECTURE_FINAL.md
04-final-product/DEPLOYMENT_AND_DEMO_PLAN.md
```

### `FINAL_MVP_DEMO.md`

Include:

- main user flow,
- how to access the app,
- demo credentials if needed,
- screenshots,
- demo notes,
- and links to evidence.

### `SETUP_AND_RUN_GUIDE.md`

A new developer should be able to run the project.

Include:

- required software,
- clone instructions,
- dependency installation,
- environment-variable setup,
- run commands,
- test commands,
- seed-data instructions if needed,
- troubleshooting notes,
- and known setup limitations.

Do not commit secrets.

### `ARCHITECTURE_FINAL.md`

Include:

- tech stack,
- major folders,
- major components,
- routes or endpoints,
- database or data model,
- external services,
- and a diagram if useful.

### `DEPLOYMENT_AND_DEMO_PLAN.md`

Include:

- how the app will be shown,
- required accounts or devices,
- internet or local-run requirements,
- demo data,
- backup option,
- and known risks.

## 10. QA and Stabilization

Create:

```txt
05-qa-and-stabilization/QA_REPORT.md
05-qa-and-stabilization/BUGS_AND_LIMITATIONS.md
```

### `QA_REPORT.md`

Include:

- core-flow checklist,
- manual test results,
- automated tests if available,
- CI evidence if available,
- browser or device checks,
- accessibility checks if relevant,
- security basics,
- deployment reliability,
- and linked evidence.

### `BUGS_AND_LIMITATIONS.md`

Use this format:

| Bug or limitation | Severity | Status | Evidence | Workaround or next step |
|---|---|---|---|---|
|  | P0 / P1 / P2 / P3 | Open / Fixed / Accepted | Link |  |

Severity guide:

- **P0:** final demo cannot work
- **P1:** core feature broken or unreliable
- **P2:** important but workaround exists
- **P3:** polish or nice improvement

Do not hide bugs. Honest limitations are professional.

## 11. AI Use and Code Ownership

Create:

```txt
06-ai-and-code-ownership/AI_CODE_OWNERSHIP_AUDIT.md
06-ai-and-code-ownership/AI_USE_SUMMARY.md
```

### Required rule

> AI-assisted work only counts if your team can run it, explain it, test it, debug it, and link evidence.

Include:

- AI tools used,
- what AI helped with,
- what humans reviewed,
- what humans changed,
- how AI-assisted work was tested,
- code areas each student can explain,
- confusing or risky code areas,
- representative AI-assisted PRs,
- and remaining ownership risks.

If no one can explain a code area, say so honestly and document the risk.

## 12. Final Presentation Materials

Create:

```txt
07-final-presentation/FINAL_PRESENTATION_SCRIPT.md
07-final-presentation/TECHNICAL_DEFENSE_PREP.md
07-final-presentation/BACKUP_DEMO.md
07-final-presentation/slides/
```

### Presentation rules

- Maximum time: **15 minutes**
- Slides are optional.
- There is no required slide minimum or maximum.
- Include your script.
- Include slides when used.
- Include an editable slide link when relevant.
- Include a PDF export when practical.
- Your team chooses the backup plan.
- Your team is responsible for making the presentation work.

Recommended time split:

| Segment | Time |
|---|---:|
| Project story | 2 min |
| Live MVP demo | 5 min |
| Semester journey | 2 min |
| QA and engineering evidence | 2 min |
| AI use and code ownership | 1 min |
| Technical defense | 3 min |
| **Maximum** | **15 min** |

## 13. Individual Portfolio Pages

Each student creates:

```txt
08-individual-portfolios/STUDENT_NAME.md
```

Your individual portfolio page must include:

1. your role,
2. strongest contributions,
3. evidence links,
4. one area you can explain clearly,
5. your AI use,
6. one problem you helped solve,
7. what you learned,
8. what you are proud of,
9. what you should have done better,
10. what you would improve next,
11. and one skill you want to continue developing.

Each student is responsible for checking that their links work.

## 14. Historical Integrity Rule

Include the files and evidence you actually created during the semester.

Organize and rename them where helpful.

Do not invent missing historical work or silently rewrite older documents to make the semester look cleaner than it was.

Honest gaps are better than fake evidence.

## 15. Final Repo Cleanup

Before the deadline:

- remove committed secrets,
- check broken links,
- remove obvious junk files,
- rename confusing files where easy,
- make sure `portfolio/README.md` works,
- test the setup instructions,
- rehearse the demo,
- test the backup,
- and confirm each student can answer technical questions.

## 16. Final Definition of Done

Your final portfolio is complete when:

- [ ] `portfolio/README.md` exists and links to all major sections.
- [ ] Every week has a `WEEK_XX.md` file.
- [ ] Sprint 1, Sprint 2, Sprint 3, Sprint 4, and Final Sprint summaries exist.
- [ ] All available proposal, planning, scope, risk, wireframe, and architecture versions are included or linked.
- [ ] Final MVP scope is clear.
- [ ] Setup and run instructions work.
- [ ] QA evidence is visible.
- [ ] Bugs and limitations are documented.
- [ ] AI use is disclosed.
- [ ] Code ownership is documented.
- [ ] Presentation script exists.
- [ ] Slides are included when used.
- [ ] Backup plan exists.
- [ ] Every student has an individual portfolio page.
- [ ] Every student reviewed their evidence links.
- [ ] The team tested the presentation.
- [ ] The repo contains no exposed secrets.
- [ ] The portfolio is complete by **Wednesday, June 17, 2026, at 8:00 AM**.

## 17. Final Reminder

A polished portfolio is useful.

A working, understandable, evidence-linked portfolio is better.

Do not submit mystery code.
