# Deployment and Demo Plan

## Primary Demo Plan

### Demo Flow (15-20 minutes)

1. **Landing Page** (30 seconds)
   - Open Campus Helper in a web browser.
   - Show the hero page with feature pills and branding.

2. **Authentication** (1 minute)
   - Log in using a student demo account.
   - Show successful JWT authentication and dashboard redirect.

3. **Student Dashboard** (1 minute)
   - Demonstrate the central dashboard with quick action cards.
   - Show schedule/timetable widget.
   - Point out navigation sidebar with all available modules.

4. **Notes Module** (2 minutes)
   - Navigate to the Notes section.
   - Show existing notes.
   - Demonstrate note creation (optional, if time permits).
   - Show the Like functionality and like count updates.
   - Explain MongoDB persistence.

5. **Marketplace Module** (2 minutes)
   - Navigate to Marketplace.
   - Show item listings with images (Cloudinary-backed).
   - Demonstrate the Like feature on marketplace items.
   - Explain the CRUD operations.

6. **AI Assistant** (2 minutes)
   - Open the AI Assistant chat interface.
   - Ask a campus-related question (e.g., "What are the best places to study on campus?").
   - Show OpenAI streaming response in real-time.
   - Mention chat history persistence in MongoDB.

7. **Admin Console** (2 minutes)
   - Log out of student account.
   - Log in using an admin demo account.
   - Navigate to Admin Dashboard (`/dashboard/admin`).
   - Create and publish a campus notice (e.g., "Library extends hours for exam season").
   - Show that the notice appears on the student-facing notice board.

8. **Responsive Design** (1 minute)
   - Resize browser or show mobile view.
   - Demonstrate responsive layout on mobile/tablet screens.

9. **Architecture Overview** (1 minute)
   - Briefly explain the tech stack:
     - **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion.
     - **Backend:** Next.js API routes, Express-like routing.
     - **Database:** MongoDB with Mongoose ODM.
     - **AI:** OpenAI provider via AI SDK v6.
     - **Auth:** JWT access/refresh token flow with bcrypt hashing.
     - **Uploads:** Cloudinary for media management.
   - Show the system architecture diagram if available.

---

## Required Devices, Accounts, or Services

### Physical Devices
- **Presentation Laptop:** Primary machine with project installed and environment configured.
- **Presentation Display:** Projector or external monitor for audience viewing (min. 1920x1080 resolution recommended).
- **Internet Connection:** Stable, high-bandwidth connection (for API calls and streaming).
- **Backup Laptop:** Alternative device with project pre-configured (in case of primary device failure).
- **Mobile Device (optional):** Phone or tablet to demonstrate responsive design.

### GitHub Accounts
- **Demo Team Account:** For showing repository access and sprint documentation.
- **Personal Accounts:** Each team member's account for commit attribution.

### User Accounts (Demo)

#### Student Demo Account
```
Email: student@example.com
Password: [Secure password - store in secure location]
Role: student
```

#### Admin Demo Account
```
Email: admin@example.com
Password: [Secure password - store in secure location]
Role: admin
```

### External Services & API Keys
| Service | Purpose | Status |
|---------|---------|--------|
| **MongoDB Atlas** | Cloud database hosting | ✓ Required |
| **OpenAI API** | AI Assistant (GPT-4 or GPT-3.5-turbo) | ✓ Required |
| **Cloudinary** | Image and file upload storage | ✓ Required |
| **GitHub Repository** | Source code and version control | ✓ Required |
| **Deployment Platform** | Production hosting (Vercel/Render) | Optional for demo |
| **Redis (ioredis)** | Rate limiting and optional caching | Optional |

### Deployment Platform Options
- **Vercel:** Recommended (native Next.js support, one-click deployment from GitHub).
- **Render:** Alternative Node.js hosting.
- **Railway:** Alternative Node.js hosting.
- **Local Development Server:** For offline demo capability (`npm run dev`).

---

## Demo Data

### Student Account

```
Email: student@example.com
Password: DemoPassword123!
Name: Demo Student
Class: 2026-1
```

**Pre-populated Data:**
- 3 sample notes in the Notes module.
- 5 sample marketplace items.
- 2 AI chat history entries.
- 1 campus notice from admin.

### Admin Account

```
Email: admin@example.com
Password: AdminPassword123!
Name: Campus Admin
Role: admin (verified in MongoDB)
```

**Pre-populated Data:**
- 3 previously published notices.
- User management dashboard with 10+ user records.
- Analytics overview.

### Sample Demo Queries for AI Assistant

1. "What are the best study spots on Ulsan College campus?"
2. "How do I approach preparing for mid-term exams?"
3. "What clubs are available for new students?"
4. "How can I improve my time management as a student?"

---

## Environment Configuration for Demo

### Required Environment Variables

Create a `.env.local` file with the following (do not commit to repository):

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campus-helper

# AI & LLM Services
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
GOOGLE_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...

# File Upload
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Authentication
JWT_ACCESS_SECRET=your-secret-key-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-key-here-min-32-chars

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000

# Email (optional for demo)
SMTP_USER=...
SMTP_PASS=...

# Redis (optional - rate limiting will be skipped without it)
REDIS_URL=redis://localhost:6379
```

### Setup Checklist

- [ ] Clone repository: `git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper.git`
- [ ] Install dependencies: `npm install`
- [ ] Configure `.env.local` with all API keys and secrets.
- [ ] Start development server: `npm run dev`
- [ ] Verify application loads at `http://localhost:3000`.
- [ ] Test login with student and admin accounts.
- [ ] Pre-load demo data in MongoDB.
- [ ] Test all demo features (notes, marketplace, AI, admin).
- [ ] Clear browser cache and cookies.
- [ ] Create user accounts if needed: navigate to `/signup`.

---

## Pre-Demo Testing Checklist

### Functionality Tests
- [ ] Login/logout works smoothly.
- [ ] Student dashboard loads without errors.
- [ ] Notes module displays and allows likes.
- [ ] Marketplace module displays items and likes.
- [ ] AI Assistant responds to queries with streaming.
- [ ] Admin console loads and displays notices.
- [ ] Admin can create and publish a new notice.
- [ ] Notice appears on student-facing notice board.
- [ ] Responsive layout works on mobile view.

### Performance Tests
- [ ] Page load time < 3 seconds.
- [ ] API response time < 2 seconds.
- [ ] No console errors or warnings.
- [ ] No authentication token expiry during demo.

### Browser Compatibility
- [ ] Chrome (latest version) - **Primary**.
- [ ] Firefox (latest version) - **Backup**.
- [ ] Safari (if demoing on Mac).

### Network & API Tests
- [ ] MongoDB connection is stable.
- [ ] OpenAI API quota is sufficient.
- [ ] Cloudinary upload works (test with an image).
- [ ] JWT tokens refresh correctly.

---

## Demo Contingency Plans

### Issue: API Key Expired or Quota Exceeded

**Prevention:**
- Check API quotas 24 hours before demo.
- Have backup API keys ready.

**Recovery:**
- Switch to backup API key in `.env.local`.
- Restart development server: `npm run dev`.
- Test AI Assistant before resuming demo.

### Issue: MongoDB Connection Fails

**Prevention:**
- Verify MongoDB connection string is correct.
- Test connection 1 hour before demo.

**Recovery:**
- Check network connectivity.
- Restart development server.
- If persists, switch to backup laptop with pre-configured environment.

### Issue: Development Server Crashes

**Prevention:**
- Run quality gates before demo: `npm run lint && npm run typecheck && npm run build`.

**Recovery:**
- Restart development server: `npm run dev`.
- If issue persists, switch to backup laptop.
- Have a pre-built production build ready to deploy to Vercel as fallback.

### Issue: Network Unavailable

**Prevention:**
- Ensure stable internet before demo starts.

**Recovery:**
- Have screenshots of key features saved.
- Use pre-recorded demo video as fallback.
- Show GitHub repository and code walkthrough instead.

### Issue: Cloudinary Uploads Fail

**Prevention:**
- Test image upload before demo.
- Pre-upload sample images to Cloudinary.

**Recovery:**
- Have placeholder images ready.
- Skip image upload portion and show existing images.

---

## Demo Video & Screenshots

### Key Screenshots to Capture (before demo day)

1. **Landing Page** – Hero section with feature pills.
2. **Login Page** – Clean authentication UI.
3. **Student Dashboard** – Full dashboard with all widgets.
4. **Notes Module** – Notes list with like counts.
5. **Marketplace** – Item cards with like functionality.
6. **AI Assistant** – Chat interface with response.
7. **Admin Dashboard** – Notice management UI.
8. **Mobile View** – Responsive design on smartphone.

### Demo Video (Optional but Recommended)

- **Duration:** 5-10 minutes.
- **Content:** Full walkthrough of all MVP features.
- **Format:** MP4 or WebM.
- **Resolution:** 1080p minimum.
- **Storage:** Have on USB drive and cloud storage (Google Drive, GitHub).
- **Fallback:** Play video if live demo fails.

---

## Post-Demo Documentation

### Evidence to Document

- [ ] **Live Demo Log:** Note time, features shown, and any issues encountered.
- [ ] **Screenshots:** Capture from actual demo.
- [ ] **Attendee Feedback:** Record questions and comments from audience.
- [ ] **QA Notes:** Any bugs or unexpected behaviors.
- [ ] **Improvements:** List feature requests or refinements suggested.

### Demo Reflection (after presentation)

Document in a separate file:
- What went well.
- What challenges arose.
- How they were resolved.
- Lessons learned for future demos.

---

## Presentation Talking Points

### Opening (30 seconds)
*"Campus Helper is a full-stack web application designed to centralize student workflows at Ulsan College. We're solving the problem of scattered campus tools by creating a single, intelligent command center for students."*

### Middle (2 minutes)
*"You can see here that we've built authentication, a student dashboard, note sharing, a marketplace, AI-assisted learning, and an admin console for campus notifications. All data is stored in MongoDB, and we're using OpenAI for our AI Assistant."*

### Closing (30 seconds)
*"Our MVP is fully functional, has been tested across browsers, and demonstrates a real-world student workflow. We're proud of how we've integrated modern technologies to create a practical platform."*

---

## Success Metrics for Demo

✓ **All core features demonstrated** without errors.
✓ **User can complete end-to-end flows** (login → dashboard → interact → logout).
✓ **AI Assistant responds** with meaningful answers.
✓ **Admin notice creation works** and appears on student side.
✓ **Responsive design** works on resized browser.
✓ **Code is clean** – no console errors or warnings.
✓ **Audience questions** are answered confidently.
✓ **Demo completes** within allocated time (15-20 minutes).