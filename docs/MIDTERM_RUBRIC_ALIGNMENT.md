# Campus Helper Midterm Rubric Alignment

This document adapts the class **Midterm Rubric** to the current state of **Campus Helper** so the team can prepare a clearer, more believable midterm pitch.

Rubric source:
- [Midterm - Rubric.md](https://github.com/CapstoneDesign-Spring2026-UlsanCollege/capstone-team-startup-documents/blob/main/class%20library/Midterm/Midterm%20-%20Rubric.md)

---

## Project Snapshot

**Project**: Campus Helper  
**Team**: AI Campus Innovators  
**Target context**: Ulsan College student workflows  
**Current product state**: working full-stack Next.js campus platform with authentication, dashboard modules, AI assistant, notes, timetable, marketplace, lost-and-found, chat, notifications, and admin tools  
**Live demo**: [https://ulsan-campus-plus.vercel.app](https://ulsan-campus-plus.vercel.app)

---

## 1. Problem, Users, and Value Proposition — 20 points

### Problem
Students often need multiple disconnected tools to manage campus life:
- schedule and class planning
- study note sharing
- campus notices
- peer communication
- lost-and-found
- student marketplace activity
- quick academic or campus help

This creates friction, slows students down, and makes even basic campus tasks harder than they should be.

### Target users
- Ulsan College students
- new students who are still learning campus workflows
- student communities that need quick sharing and communication
- admins or staff who need to publish official notices

### Why the problem matters
- important student actions are scattered
- context-switching wastes time
- communication and trust are weaker when every function lives in a different place
- new students especially struggle when there is no single guided workspace

### Value proposition
**Campus Helper** brings key student workflows into one authenticated platform:
- AI assistant for study and campus help
- timetable management
- note upload and browsing
- marketplace and lost-and-found posting
- network and direct chat
- admin announcements
- semester-aware academic support

### Midterm framing
For the midterm, the team should describe Campus Helper as:

> A student command center that reduces campus friction by combining study help, communication, academic planning, and campus service workflows in one place.

### What earns a strong score here
- keep the problem specific to student workflow fragmentation
- keep the user definition centered on Ulsan College students
- avoid describing the project as "everything for campus"
- explain why this combination of tools matters together

---

## 2. Product Clarity and Demo Credibility — 25 points

### What the product does
Campus Helper is a full-stack web app where students can:
- sign up and log in
- access a protected dashboard
- use an AI assistant
- upload and preview notes
- manage a timetable
- post to marketplace and lost-and-found
- message other users
- receive notifications

Admins can:
- publish announcements
- manage users
- manage semester and academic data

### Recommended core demo flow
The midterm should focus on one believable student flow, not every feature.

#### Main demo flow
1. Student signs in and lands on the dashboard
2. Student opens **Notes**, previews or downloads a study file, then messages the uploader
3. Student opens **AI Assistant** and asks for study help
4. Admin logs in and publishes a notice to show protected admin capability

**Recommended live demo link**:
- [https://ulsan-campus-plus.vercel.app](https://ulsan-campus-plus.vercel.app)

This works well because it proves:
- authentication
- protected routes
- real student content
- messaging
- AI functionality
- admin control

### Backup demo plan
If the live hosted version fails:
- recorded walkthrough video
- prepared screenshots of the same flow
- local development demo
- repository-backed explanation of the working routes and pages

### What earns a strong score here
- show one clear flow instead of feature-hopping
- explain what is happening while demoing
- avoid trying to show every module in one run
- keep the audience focused on what already works

---

## 3. Evidence of Real Progress and Technical Readiness — 20 points

### What counts as proof in this project
- working Next.js application
- protected authentication flow
- MongoDB-backed models and API routes
- AI chat route with saved history
- note upload, preview, like, and download behavior
- marketplace and lost-and-found flows
- network + direct messaging
- admin tools and notification system
- semester and timetable data models

### Evidence sources already in the repo
- project overview: [PROJECT.md](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/PROJECT.md)
- team agreement: [TEAM_AGREEMENT.md](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/TEAM_AGREEMENT.md)
- demo link: [DEMO_LINK.md](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/DEMO_LINK.md)
- sprint records:
  - [week-1.md](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/sprints/week-1.md)
  - [week-2.md](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/sprints/week-2.md)
  - [week-3.md](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/sprints/week-3.md)
  - [week-4.md](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/sprints/week-4.md)
  - [week-5.md](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/sprints/week-5.md)
  - [week-6.md](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/sprints/week-6.md)
- current deck artifact: [MIDTERM_PRESENTATION.html](/C:/Users/ktmni/.gemini/antigravity/scratch/ulsan-campus-plus/docs/MIDTERM_PRESENTATION.html)

### Technical readiness claims the team can make honestly
- core app compiles and builds
- major student workflows are implemented
- app has a live Vercel deployment
- UI and mobile behavior have been improved substantially
- current work is real and demoable, not only planned

### Good proof to show during midterm
- live deployed URL
- local backup demo
- repository structure
- build/typecheck results
- screenshots of key modules
- pull requests or commits

### Definition of Done mindset to communicate
For this project, a feature is "done enough" for midterm when:
- it works in the app
- it has a believable UI state
- failures are understandable
- it survives refresh/navigation
- the team can demo it clearly

---

## 4. Roadmap and Feasibility — 15 points

### Realistic path from Midterm to Final

#### Before Final
1. stabilize remaining edge cases in auth, uploads, and notifications
2. tighten cross-page consistency and remaining mobile polish
3. improve admin data operations and semester workflows
4. improve documentation, evidence capture, and demo reliability
5. keep deployment healthy and test the full core flow repeatedly

#### Good Final target
A believable Final version is:
- clearly designed
- stable enough to demo live
- backed by real repo evidence
- focused on the strongest workflows, not feature sprawl

### Post-Final ideas
These should be separated from immediate promises:
- campus map integration
- assignment reminders
- advanced AI note summarization
- recommendation systems
- mobile app companion

### What earns a strong score here
- keep near-term priorities small and believable
- separate polish work from speculative expansion
- show that the team knows what still needs tightening

---

## 5. Presentation Quality and Team Participation — 20 points

### Recommended presentation structure
1. title + one-line value proposition
2. problem
3. target users
4. solution overview
5. core demo flow
6. proof of progress
7. roadmap
8. closing ask

### Suggested speaker distribution
- **Speaker 1**: opens, introduces problem and users
- **Speaker 2**: explains the product and its core modules
- **Speaker 3**: runs or narrates the main demo
- **Speaker 4**: explains technical proof and roadmap
- **Speaker 5**: closes with the ask and handles transition into Q&A

### Handoff style
Keep transitions explicit and short:
- "Now that we've defined the student problem, we'll show how Campus Helper solves it."
- "With the product flow established, we'll move into the live demo."
- "After the demo, we'll show the evidence behind what is already working."

### Q&A readiness
The team should be ready to answer:
- what works right now
- what is still rough
- what the main demo proves
- how the project will be strengthened by Final

### What earns a strong score here
- everyone has a visible role
- the slides support the message instead of repeating it
- the team sounds grounded and specific
- the story stays focused on clarity and proof

---

## Recommended Midterm Score Goal

The most realistic target for Campus Helper is the **90-100 range**, but only if the team stays disciplined:
- clear story
- one believable demo
- visible repo-backed proof
- realistic roadmap
- balanced participation

The biggest risk is not lack of work.  
The biggest risk is **showing too much at once and making the project feel less clear than it really is**.

---

## Midterm Checklist for Campus Helper

- clear problem statement tied to student workflow fragmentation
- clearly defined target users
- one-sentence value proposition
- one main demo flow
- backup demo plan
- live proof links
- repo and docs evidence
- realistic Final roadmap
- visible roles for all team members
- closing ask for feedback

---

## Short Version the Team Can Reuse

### Problem
Campus information and student workflows are fragmented across too many tools.

### User
Ulsan College students, especially those who need one place for schedules, notes, communication, and campus help.

### Solution
Campus Helper is a full-stack student dashboard that combines AI assistance, timetable management, note sharing, messaging, campus notices, and student service modules.

### Main demo flow
Student signs in, uses Notes and Messaging, then asks the AI assistant for help; admin publishes a notice.

### Proof
Working app, protected routes, MongoDB-backed features, live deployment, sprint docs, and build-verified code.

### Roadmap
Stabilize core flows, improve consistency and demo reliability, and polish the strongest modules before Final.

### Ask
Feedback on story clarity, demo focus, and whether the current roadmap is believable for Final.
