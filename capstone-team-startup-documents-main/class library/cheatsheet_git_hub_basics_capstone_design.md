# CHEATSHEET - GitHub Basics (Capstone Design)

This course uses **GitHub as the source of truth**.
All teamwork, planning, documentation, and evidence must live in your **team repository**.

If something is not in GitHub, it **does not count as work done**.

---

# The 5 Tools You Will Use Every Week

You only need to learn **five GitHub tools** for this class.

| Tool | What it does | When you use it |
| --- | --- | --- |
| Repository | The home for your project | Always |
| Issues | Track tasks and work items | Every sprint |
| Branches | Separate work safely | When writing code |
| Pull Requests | Review and merge work | When finishing work |
| Projects (Kanban Board) | Track progress visually | Weekly planning |

---

# 1. Repository (Your Project Home)

Your **repository (repo)** is the central place where your project lives.

Inside the repo you will find:

```text
/docs
/src
.github
README.md
PROJECT.md
TEAM_AGREEMENT.md
```

Important files:

| File | Purpose |
| --- | --- |
| README.md | Explains the project |
| PROJECT.md | Project description and scope |
| TEAM_AGREEMENT.md | Team expectations and rules |
| /docs | Documentation |
| /src | Code |

---

# 2. Issues (Where Work Starts)

**All work begins with an Issue.**

Issues are used to:

- describe tasks
- track problems
- record ideas
- organize sprints

### Example Issue

**Title:**
Implement user login page

**Description:**
Create a simple login page with email and password fields.

**Acceptance Criteria:**

- form displays
- login button works
- basic validation added

### Rule

**No Issue -> No Work**

---

# 3. Branches (Work Safely)

Branches allow you to work on code **without breaking the main project**.

Main branch:

```text
main
```

Feature branches look like:

```text
feature-login
fix-navbar
api-authentication
```

### Typical workflow

```text
main
↓
create branch
↓
write code
↓
open Pull Request
↓
merge into main
```

---

# 4. Pull Requests (Review Work)

A **Pull Request (PR)** is used to merge work from a branch into `main`.

PRs allow teams to:

- review code
- test changes
- discuss improvements
- verify work

### Typical PR process

1. Work on branch
2. Push branch to GitHub
3. Open Pull Request
4. Teammate reviews
5. Merge into `main`

---

# 5. Projects (Kanban Board)

GitHub Projects creates a **visual task board**.

Typical board columns:

```text
To Do
Doing
Done
```

Example board:

| To Do | Doing | Done |
| --- | --- | --- |
| Login page | Navbar fix | Setup repo |
| API endpoint | UI testing | README |

---

# The Weekly Workflow

Every week your team should follow this pattern:

```text
Idea
↓
Issue
↓
Branch
↓
Pull Request
↓
Merge
↓
Demo
```

This produces **receipts** showing your work.

---

# What Counts as Evidence

Each student must post **2-3 receipts** every week.

Examples:

- Pull Request link
- Issue you completed
- Code commit
- Review comment
- Screenshot
- CI test run
- Documentation update

Example receipt comment:

```text
Contribution receipts:

PR:
https://github.com/team/repo/pull/12

Issue completed:
https://github.com/team/repo/issues/9

Review comment:
https://github.com/team/repo/pull/10#discussion
```

---

# Your Weekly Submission (Sprint Packet)

Each team submits **one Issue per week**.

The Sprint Packet includes:

### Demo

- working link or video
- short demo script

### Board Snapshot

- To Do
- Doing
- Done

### Sprint Notes

- what shipped
- what broke
- next sprint plan
- risks

### Individual Receipts

Each team member comments with evidence.

---

# Basic Git Commands (Optional)

If you use Git locally:

Clone repo

```bash
git clone REPO_URL
```

Create branch

```bash
git checkout -b feature-name
```

Add changes

```bash
git add .
```

Commit

```bash
git commit -m "message"
```

Push

```bash
git push origin branch-name
```

---

# Common Mistakes

### Working without an Issue

Every task must have an Issue first.

---

### Editing directly on `main`

Always work in **branches**.

---

### No evidence

If work cannot be linked, it does not count.

---

### Waiting until Friday

You should commit work **throughout the week**.

---

# The Most Important Rule

> If it isn't linked,  
> it didn't happen.

GitHub is the **official record of work** for this class.

Use it for:

- planning
- tracking
- coding
- documenting
- demonstrating