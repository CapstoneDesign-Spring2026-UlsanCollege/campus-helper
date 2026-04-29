1	# AI Code Ownership Audit - Campus Helper
     2	
     3	## 1) Team + Project
     4	
     5	- **Team:** LKRB
     6	- **Project name:** Campus Helper
     7	- **Current repo:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper
     8	- **Current demo link:** https://ulsan-campus-plus-6mvfqdh9d-ulsanassignment-7071s-projects.vercel.app/
     9	- **Date updated:** 2026-04-29
    10	
    11	---
    12	
    13	## 2) What Our App Currently Does
    14	
    15	Campus Helper is a full-stack student web app that combines core campus workflows in one authenticated platform. Students can create accounts, log in, open a dashboard, chat with other users, and use campus service modules such as marketplace and lost-and-found. The project documentation also defines broader modules such as AI assistant, timetable, notes, and admin notices.
    16	
    17	- **Feature / flow 1:** Login (student/admin authentication)
    18	- **Feature / flow 2:** Create account (signup flow)
    19	- **Feature / flow 3:** Chat (direct communication)
    20	- **Feature / flow 4:** Marketplace (post/browse items)
    21	
    22	### Current MVP flow
    23	
    24	Our main user can:
    25	
    26	1. Log in to the application.
    27	2. Access the marketplace.
    28	3. Chat with other users.
    29	4. Report lost-and-found items.
    30	
    31	---
    32	
    33	## 3) What Works Right Now
    34	
    35	| Working item | Evidence link | Owner who can explain it |
    36	|---|---|---|
    37	| Login + signup flow in MVP narrative | `docs/PROJECT.md`, Sprint docs, demo URL | Laxman Bhattarai |
    38	| Chat and communication module in current scope | `docs/PROJECT.md`, `docs/SPRINT_2.md` | Ujwol Upreti |
    39	| Marketplace and lost-and-found in core feature list | `docs/PROJECT.md`, demo URL | Rajim Danwar |
    40	| Midterm demo story + reliability plan documented | `docs/SPRINT_2.md` | Bibek Kunwar |
    41	
    42	Primary demo evidence: https://ulsan-campus-plus-6mvfqdh9d-ulsanassignment-7071s-projects.vercel.app/
    43	
    44	---
    45	
    46	## 4) Code We Understand
    47	
    48	| Code area | File / folder | What it does | Who can explain it? | Evidence |
    49	|---|---|---|---|---|
    50	| Product scope + feature map | `docs/PROJECT.md` | Defines user problem, core features, MVP, and stack | Kushal Kharka | `docs/PROJECT.md` |
    51	| Midterm readiness and demo design | `docs/SPRINT_2.md` | Documents demo story, proof checklist, risk, and speaker ownership | Bibek Kunwar | `docs/SPRINT_2.md` |
    52	| Team roles and workflow ownership | `docs/TEAM_AGREEMENT.md` | Defines role rotation, evidence rule, and team process | Laxman Bhattarai | `docs/TEAM_AGREEMENT.md` |
    53	| Weekly sprint execution plan | `docs/sprints/` | Captures week-by-week work framing and progress structure | Rajim Danwar | `docs/sprints/week-*.md` |
    54	
    55	---
    56	
    57	## 5) Code We Do NOT Fully Understand Yet
    58	
    59	| Code area | What is confusing? | Risk level | Owner | Next step |
    60	|---|---|---|---|---|
    61	| AI streaming integration details | Exact prompt pipeline, token handling, and fallback behavior under API errors | Medium | Rajim Danwar | Add architecture note + trace one full request/response path in code review |
    62	| Auth edge-case handling | Token refresh/expiry behavior in long sessions and admin role transitions | High | Laxman Bhattarai | Add explicit auth test checklist and document expected states |
    63	| Real-time chat reliability | Delivery/retry behavior and offline handling under weak network | Medium | Ujwol Upreti | Run reliability test script and log failure modes |
    64	| Deployment environment consistency | Potential mismatch between local `.env` and Vercel settings | High | Bibek Kunwar | Build environment matrix and verify each required variable |
    65	
    66	---
    67	
    68	## 6) AI-Assisted Work
    69	
    70	| Area | AI tool used | What AI helped with | What humans checked/changed | Evidence |
    71	|---|---|---|---|---|
    72	| Planning and documentation structure | ChatGPT / Codex-style assistants | Drafted sprint packet structure and wording polish | Team validated scope, edited ownership, and aligned with demo goals | `docs/SPRINT_2.md`, `docs/Issue/*.md` |
    73	| Feature ideation and decomposition | AI assistant | Helped break large features into weekly issue-sized tasks | Humans prioritized by MVP and feasibility | `docs/Issue/week-*.md` |
    74	| Audit template adaptation | AI assistant | Converted generic ownership template into project-specific audit draft | Team should review owner/evidence rows before final submission | `docs/AI_CODE_OWNERSHIP_AUDIT.md` |
    75	
    76	---
    77	
    78	## 7) Bugs / Unreliable Features
    79	
    80	| Bug / problem | Severity | Evidence link | Owner | Next action |
    81	|---|---|---|---|---|
    82	| Live demo can fail if external services/env vars are missing | P1 | `docs/SPRINT_2.md` (Current Risks) | Bibek Kunwar | Add deployment preflight checklist before each demo |
    83	| AI quality depends on OpenAI availability and response variance | P1 | `docs/SPRINT_2.md` (Current Risks) | Rajim Danwar | Prepare backup prompts + recorded fallback demo |
    84	| Admin demo requires valid admin account + fresh token | P1 | `docs/SPRINT_2.md` (Current Risks) | Laxman Bhattarai | Maintain seeded admin account and rehearse auth reset process |
    85	| Midterm visuals/evidence links may be incomplete | P2 | `docs/SPRINT_2.md` (Current Risks) | Kushal Kharka | Finalize screenshot/video links in Week 7 packet |
    86	
    87	---
    88	
    89	## 8) Risk List
    90	
    91	| Risk | Why it matters | Mitigation | Owner |
    92	|---|---|---|---|
    93	| External API/service outage during demo | Breaks core demo confidence | Keep recorded backup demo + static screenshots | Ujwol Upreti |
    94	| Missing evidence links in sprint packet | Work may not be accepted as completed | Apply “If not linked, it did not happen” rule weekly | Kushal Kharka |
    95	| Unclear ownership in AI-assisted code | Team cannot defend implementation decisions | Maintain this audit and assign explainers per code area | Laxman Bhattarai |
    96	| Incomplete test coverage for core auth/chat | Regressions may appear near final demo | Add focused smoke tests for login/chat/admin notice | Bibek Kunwar |
    97	
    98	---
    99	
   100	## 9) Team Ownership Map
   101	
   102	| Student | Owned area | Can explain? | Evidence link | Needs help with |
   103	|---|---|---|---|---|
   104	| Laxman Bhattarai | Auth flow, coordination, delivery readiness | Clear | `docs/TEAM_AGREEMENT.md`, `docs/SPRINT_2.md` | Token edge-case test matrix |
   105	| Kushal Kharka | Documentation, sprint evidence tracking | Clear | `docs/TEAM_AGREEMENT.md`, `docs/Issue/README.md` | Deeper technical walkthrough for AI/chat internals |
   106	| Bibek Kunwar | QA checklist, reliability proof, risk tracking | Clear | `docs/SPRINT_2.md` | Automated regression test expansion |
   107	| Ujwol Upreti | Demo driving, chat/module walkthrough | Clear | `docs/SPRINT_2.md` | Network failure recovery drills |
   108	| Rajim Danwar | Feature implementation and technical integration | Clear | `docs/PROJECT.md`, `docs/Issue/week-*.md` | AI observability and error instrumentation |
   109	
   110	---
   111	
   112	## 10) Top 3 Stabilization Goals
   113	
   114	Before adding more features, we will stabilize:
   115	
   116	1. End-to-end MVP reliability (login → dashboard → chat/marketplace → lost-and-found).
   117	2. Demo resilience (backup recordings, seed accounts, and environment preflight checks).
   118	3. Ownership clarity (each member can explain one functional code area and one risk area).
   119	
   120	---
   121	
   122	## 11) Definition of Done for Sprint 3
   123	
   124	By the end of Sprint 3, we should be able to show:
   125	
   126	- [ ] Core MVP flow works.
   127	- [ ] Core MVP flow has evidence.
   128	- [ ] P0 bugs are fixed or clearly documented.
   129	- [ ] Every member can explain one code/doc/test area.
   130	- [ ] AI-assisted work has been reviewed by humans.
   131	- [ ] Weekly Sprint Packet links this audit.
