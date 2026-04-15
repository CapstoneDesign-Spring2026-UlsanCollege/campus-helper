# Weekly Sprint Packet - Week 7

## Team

**Team Name**: Campus Helper  
**Packet**: Week 7 Packet  
**Sprint Context**: Sprint 2 is the multi-week sprint leading to the Midterm  
**Repository**: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper  
**PM for this Week**: Laxman Bhattarai

> GitHub Issue title to use: **Weekly Sprint Packet — Week 7**

## 1. Demo Link, Updated Script, and Backup Plan

### Demo Link or Current Working Proof

- Repository: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper
- Current working proof: run locally with `npm install` and `npm run dev`
- Build proof: `npm run build` passes locally
- Demo video link: [Add Week 7 demo video or hosted app link]

### Updated 3-Bullet Demo Script

1. User opens Campus Helper, signs in, and lands on the student dashboard.
2. User asks the AI assistant a campus/study question and receives a streamed response with saved history.
3. Admin signs in, opens the admin console, and publishes a campus notice.

### Backup Plan

- Recorded walkthrough video of the student and admin flows.
- Narrated screenshots of login, AI assistant, dashboard, and admin notice publishing.
- GitHub code walkthrough using the README, sprint docs, and issue logs.
- Backup local environment with prepared `.env.local` and demo accounts.

## 2. Midterm Deck Draft Link

- Draft Midterm deck: [Add Google Slides / PowerPoint / PDF link]

The deck should explain:

- problem
- user
- solution
- main demo flow
- what works now
- what comes next

## 3. Midterm Story Spine

**Problem**: Students need one place to manage campus information, academic resources, communication, and support.  
**User**: Ulsan College students, especially students who need quick access to campus workflows and help.  
**Solution**: Campus Helper is a full-stack web app with authentication, AI assistance, schedules, notes, marketplace, lost-and-found, chat, and admin notices.  
**Main demo flow**: Show a student logging in, using the AI assistant, and then show an admin publishing a notice.  
**Proof**: Working Next.js app, MongoDB models, JWT auth, AI streaming chat, admin console, updated docs, and passing build.  
**Roadmap**: Deploy the app, add demo account setup, improve testing, polish remaining module UI, and prepare final presentation evidence.  
**Ask**: We want feedback on whether the Midterm story is focused enough and whether the demo flow clearly proves the project is real.

## 4. Speaker Roles and Handoff Plan

| Section | Speaker |
| --- | --- |
| Opens the presentation | Laxman Bhattarai |
| Explains problem and target user | Kushal Kharka |
| Sets up the solution and demo | Rajim Danwar |
| Runs the live demo | Ujwol Upreti |
| Explains roadmap and closes with ask | Bibek Kunwar |

### Handoff Line

Now that you understand the problem, Rajim will show how Campus Helper solves it through one student dashboard and AI-supported workflow.

## 5. What Works Now / Proof

- README: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/blob/main/README.md
- Project overview: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/blob/main/docs/PROJECT.md
- Sprint 2 plan: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/blob/main/docs/SPRINT_2.md
- Issue log: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/tree/main/docs/Issue
- Week 1-6 sprint packets: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/tree/main/docs/sprints
- Full-stack app commit: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/commit/9e3820a
- Issue log commit: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/commit/9284ab8
- Docs issue-log move commit: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/commit/ab11fe4
- Week 7 packet commit: [Add commit link after pushing this packet]
- Screenshots or demo recording: [Add link]

## 6. Docs Update

Updated or added this week:

- `docs/SPRINT_2.md`
- `docs/sprints/week-7.md`
- `docs/Issue/README.md`
- `README.md`
- `docs/PROJECT.md`

Docs links:

- Sprint 2 plan: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/blob/main/docs/SPRINT_2.md
- Week 7 packet: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/blob/main/docs/sprints/week-7.md
- Issue log: https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/tree/main/docs/Issue

## 7. Board Snapshot

Project board link: [Add GitHub Project board link]

### To Do

| Task | Owner |
| --- | --- |
| Add Midterm deck draft link | Laxman |
| Record backup demo walkthrough | Ujwol |
| Add screenshots to Week 7 packet | Bibek |
| Add individual contribution receipt comments | All members |

### Doing

| Task | Owner |
| --- | --- |
| Prepare Midterm story and speaker script | Kushal |
| Rehearse student and admin demo flow | Rajim |
| Verify demo account and environment variables | Laxman |

### Done

| Task | Owner |
| --- | --- |
| Full-stack app pushed to GitHub | Laxman |
| README professionalized | Laxman |
| Week 1-6 sprint docs updated | Laxman |
| Issue log moved under docs | Laxman |
| Admin and AI workflows implemented | Team |

## 8. Current Risks / Weak Points

- The Midterm deck link is still a placeholder until the team creates and shares the draft.
- The demo could fail if environment variables, MongoDB, Cloudinary, or OpenAI are unavailable.
- The admin demo requires logging out and logging back in after admin role changes so the JWT contains `role: "admin"`.
- The project board snapshot still needs a real link or screenshot.
- The team must keep the demo focused; showing too many modules could make the story confusing.

## 9. Individual Contribution Receipts

Each student must comment on the GitHub Issue with 2-3 receipts.

Suggested receipt format:

```text
Name:

Contributions:
- ...
- ...

Receipts:
- Commit/PR/Issue link:
- Screenshot/demo link:
- Doc update link:
```

Suggested receipt sources:

- Pull requests
- Commits
- Issues closed
- Review comments
- Screenshots with context
- Build output
- Demo video
- Documentation updates

## 10. This Week's Engineering Practice Spine

**Engineering Practice**: Demo reliability + evidence clarity

This packet improves:

- **Demo stability**: focused 3-step student/admin demo flow
- **Backup readiness**: video, screenshots, and code walkthrough plan
- **Speaker clarity**: assigned roles and handoff line
- **Repo proof**: README, Sprint 2 plan, sprint packets, issue logs, and commit links

## Quick Checklist

- [x] Issue title is `Weekly Sprint Packet — Week 7`
- [x] Demo proof included
- [x] Updated 3-bullet demo script included
- [x] Backup plan included
- [ ] Midterm deck draft link included
- [x] Story spine included
- [x] Speaker roles included
- [x] Handoff line included
- [x] Proof links included
- [x] Docs update links included
- [ ] Board snapshot link included
- [x] Risks / weak points included
- [ ] Each student added contribution receipts

