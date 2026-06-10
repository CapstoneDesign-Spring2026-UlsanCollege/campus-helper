# Final MVP Demo

## Main User Flow

### Complete User Journey (15-20 minutes)

1. **Landing Page Access**
   - User navigates to Campus Helper landing page.
   - Hero section displays with campus background and feature pills.
   - Two call-to-action buttons: "Login" and "Create account".

2. **Authentication**
   - User clicks "Login" button.
   - Login form appears with email and password fields.
   - User enters credentials: `student@example.com` / `DemoPassword123!`.
   - JWT authentication validates credentials against MongoDB.
   - User is redirected to Student Dashboard.

3. **Student Dashboard**
   - Dashboard loads with personalized greeting.
   - Quick action cards displayed (Notes, Marketplace, AI Assistant, Schedule).
   - Navigation sidebar shows all available modules.
   - Schedule widget displays current semester timetable.

4. **Notes Module (Sharing & Interaction)**
   - User clicks on "Notes" in sidebar.
   - Notes list page displays existing notes with titles, descriptions, and authors.
   - Each note shows a like count and like button (heart icon).
   - User clicks like button on a note.
   - Like count increments in real-time.
   - User can view note details by clicking on note title.
   - **Optional:** Create new note by clicking "Add Note" button.

5. **Marketplace Module (Browsing & Interaction)**
   - User navigates to "Marketplace".
   - Marketplace page displays cards with item listings.
   - Each card shows: product image (from Cloudinary), title, price, seller info, and like count.
   - User clicks like button on marketplace item.
   - Like count updates immediately.
   - User can view item details or contact seller (if implemented).

6. **AI Assistant (Study Support)**
   - User opens "AI Assistant" module.
   - Chat interface displays with message history.
   - User types a campus/study question, e.g., "What are the best study spots on campus?".
   - OpenAI API processes the query and streams response in real-time.
   - Assistant provides detailed, contextual answer.
   - Chat history is persisted in MongoDB for future reference.
   - User can continue conversation with follow-up questions.

7. **Admin Workflow (Notice Management)**
   - User logs out of student account.
   - User logs in with admin account: `admin@example.com` / `AdminPassword123!`.
   - Admin Dashboard loads (accessible only to admin role).
   - User navigates to "Notice Management" or "Create Notice" section.
   - Admin fills out form: title, description, category (e.g., "Library", "Events"), urgency level.
   - Admin clicks "Publish" button.
   - Notice is saved to MongoDB and marked as published.
   - Admin logs out and student logs back in.
   - Student dashboard now displays the newly published notice.
   - Notice appears in the notice board or notification widget.

8. **Responsive Design Check**
   - Browser is resized to mobile width (375px) or developer tools mobile mode is enabled.
   - All elements reflow properly: sidebar collapses to hamburger menu.
   - Dashboard cards stack vertically.
   - Forms and buttons remain clickable and properly sized for touch.
   - Text remains readable at mobile size.

---

## Demo Access

### App Link (Production/Deployed)

- **Deployment Status:** [To be filled after deployment to Vercel/Render]
- **Production URL:** [https://campus-helper-deployment.vercel.app] (example)
- **Live Demo Available:** [Yes / No / Pending]

### Local-Run Option

**For offline or pre-deployment demo:**

```bash
# Clone repository
git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper.git
cd campus-helper

# Install dependencies
npm install

# Configure environment
# Create .env.local with API keys (see DEPLOYMENT_AND_DEMO_PLAN.md)

# Start development server
npm run dev

# Access at http://localhost:3000
```

**System Requirements:**
- Node.js 18+ or 20+
- npm 9+
- Internet connection (for APIs)
- MongoDB Atlas account configured

### Demo Credentials

#### Student Account
```
Email:    student@example.com
Password: DemoPassword123!
Role:     student
```

#### Admin Account
```
Email:    admin@example.com
Password: AdminPassword123!
Role:     admin
```

**Note:** These accounts are pre-configured in the demo MongoDB database. Do not modify or delete them before the presentation.

### Required Data

**Pre-loaded Database Records:**

| Module | Record Count | Details |
|--------|--------------|----------|
| **Notes** | 5 | Sample study notes with titles and descriptions |
| **Marketplace Items** | 8 | Used textbooks, stationery, and campus items |
| **AI Chat History** | 3 | Example conversations showing persistence |
| **Campus Notices** | 2 | Admin-published notices (library hours, exam schedule) |
| **Users** | 12 | Student and admin accounts for testing |

**To Pre-populate Data:**

1. Connect to MongoDB Atlas database.
2. Run seed script (if available): `npm run seed` or `npm run db:seed`.
3. Alternatively, manually insert sample data via MongoDB Atlas UI or import from provided JSON file.

---

## Evidence

### Screenshots

| Feature | Screenshot Filename | Location |
|---------|-------------------|----------|
| **Landing Page** | `01-landing-page.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Login Page** | `02-login-page.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Student Dashboard** | `03-student-dashboard.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Notes Module** | `04-notes-module.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Notes Like Feature** | `05-notes-like.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Marketplace Module** | `06-marketplace.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Marketplace Like Feature** | `07-marketplace-like.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **AI Assistant Chat** | `08-ai-assistant.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Admin Dashboard** | `09-admin-dashboard.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Admin Notice Creation** | `10-admin-notice-creation.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Published Notice on Student Side** | `11-student-notice-board.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |
| **Mobile Responsive View** | `12-mobile-responsive.png` | portfolio-starter/portfolio/04-final-product/screenshots/ |

**How to Capture Screenshots:**
- Use built-in screenshot tool (Windows: Win+Shift+S, Mac: Cmd+Shift+4).
- Ensure no sensitive data (passwords, API keys) is visible.
- Crop to show relevant UI only.
- Save in PNG format at 1920x1080 resolution minimum.

### Video Demo

- **Demo Video Filename:** `Campus-Helper-MVP-Demo.mp4`
- **Location:** `portfolio-starter/portfolio/04-final-product/demo-video/`
- **Duration:** 8-10 minutes
- **Resolution:** 1080p (1920x1080)
- **Format:** MP4 (H.264 codec, AAC audio)
- **Narration:** Optional (recommended to explain each feature as it's shown)
- **File Size:** < 500 MB (for easy sharing)

**Video Content Outline:**
1. Landing page tour (30 seconds)
2. Login flow (30 seconds)
3. Dashboard overview (1 minute)
4. Notes module + like feature (1.5 minutes)
5. Marketplace + like feature (1.5 minutes)
6. AI Assistant in action (2 minutes)
7. Admin console + notice publishing (2 minutes)
8. Mobile responsiveness (30 seconds)
9. Architecture summary (30 seconds)

**How to Record:**
- Use OBS Studio (free), ScreenFlow (Mac), or Camtasia.
- Record at 60fps for smooth playback.
- Include cursor movements and clicks.
- Add annotations/captions if desired (optional).

### Pull Requests (Development Evidence)

**Key PRs to Reference:**

| PR # | Title | Status | Merged | Evidence |
|------|-------|--------|--------|----------|
| #1 | Setup Next.js project structure and authentication | Merged | ✓ | [PR Link] |
| #2 | Implement Student Dashboard and Navigation | Merged | ✓ | [PR Link] |
| #3 | Build Notes Module with CRUD operations | Merged | ✓ | [PR Link] |
| #4 | Create Marketplace Module and item listings | Merged | ✓ | [PR Link] |
| #5 | Add Like feature for Notes and Marketplace | Merged | ✓ | [PR Link] |
| #6 | Integrate OpenAI API for AI Assistant | Merged | ✓ | [PR Link] |
| #7 | Build Admin Console and Notice Management | Merged | ✓ | [PR Link] |
| #8 | Responsive design and mobile optimization | Merged | ✓ | [PR Link] |

**Access:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/pulls

### GitHub Issues

**Key Issues Tracked:**

| Issue # | Title | Status | Resolution |
|---------|-------|--------|------------|
| #1 | Authentication JWT flow implementation | Closed | ✓ Resolved |
| #2 | MongoDB Mongoose schema setup | Closed | ✓ Resolved |
| #3 | Like feature database design | Closed | ✓ Resolved |
| #4 | OpenAI streaming integration | Closed | ✓ Resolved |
| #5 | Cloudinary image upload configuration | Closed | ✓ Resolved |
| #6 | Admin role-based access control | Closed | ✓ Resolved |
| #7 | TypeScript type safety across codebase | Closed | ✓ Resolved |
| #8 | Responsive design mobile optimization | Closed | ✓ Resolved |

**Access:** https://github.com/CapstoneDesign-Spring2026-UlsanCollege/campus-helper/issues

**Note:** See `docs/Issue/` folder for detailed weekly issue logs and resolutions.

---

## Known Demo Limitations

### Feature Limitations

- **Real-time Notifications:** Notifications are not real-time. Notices appear after page refresh or on next login.
- **Live Chat:** Friend-to-friend messaging is not fully implemented. Network module exists but chat requires socket implementation.
- **File Upload for Notes:** Notes currently support text and links only. Direct file attachment is not implemented in this MVP.
- **Search & Filtering:** Advanced search and filtering across all modules are not available. Users can view all items but cannot filter by category, price, or date.
- **Email Notifications:** Email integration is incomplete. Notices do not trigger email alerts.

### Performance Considerations

- **API Response Times:** During peak server load, API responses may take 2-3 seconds instead of <1 second.
- **Large Dataset Handling:** With 1000+ marketplace items or notes, pagination may be needed for optimal performance.
- **Image Loading:** Cloudinary images depend on internet speed. On slow connections, images may load slowly.

### Environment Constraints

- **Offline Mode:** Application requires internet connection. Cannot function completely offline.
- **Browser Compatibility:** Best tested on Chrome and Firefox. Safari and Edge have not been fully tested.
- **Mobile:** Responsive design is implemented, but native mobile app is not available. Web version works on mobile browsers.
- **Admin Role Assignment:** Admins must be manually promoted in MongoDB. No self-registration as admin available.

### Data Privacy

- **Demo Credentials:** Demo accounts are shared. For production, each user should have unique credentials.
- **Sensitive Data:** API keys and database credentials are environment variables. Never commit these to the repository.
- **Cloudinary Media:** Uploaded images are stored in a shared Cloudinary account. For production, use separate accounts per environment.

### API Quotas

- **OpenAI:** Limited API quota for demo. Heavy usage during presentation may exceed limits.
- **Cloudinary:** Free tier has storage and bandwidth limits. Test uploads before demo.
- **MongoDB:** Shared Atlas cluster. High concurrent connections during demo may impact performance.

### Known Bugs (if any)

- **Issue:** AI Assistant sometimes repeats responses if user sends rapid consecutive messages.
  - **Workaround:** Wait 2 seconds between messages.

- **Issue:** Like counts may not update immediately on slow connections.
  - **Workaround:** Refresh page to see updated like counts.

- **Issue:** Admin notice sometimes takes 5-10 seconds to appear on student dashboard.
  - **Workaround:** This is expected due to MongoDB consistency. Refresh or wait briefly.

---

## Demo Success Criteria

✅ **All features load without errors**
✅ **User authentication works smoothly**
✅ **Notes module displays and like feature functions**
✅ **Marketplace shows items and like feature works**
✅ **AI Assistant responds to queries**
✅ **Admin console accessible and notice publishing works**
✅ **Responsive design adapts to mobile view**
✅ **No console errors or warnings during demo**
✅ **Database successfully persists and retrieves data**
✅ **Demo completes within 15-20 minutes**

---

## Post-Demo Checklist

- [ ] Document any issues encountered during demo.
- [ ] Capture attendee feedback and questions.
- [ ] Note performance issues if any.
- [ ] Identify features that impressed the audience.
- [ ] Plan future improvements based on feedback.
- [ ] Update this document with real deployment links (if demo goes live).
- [ ] Archive screenshots and video for project portfolio.
- [ ] Thank presenters and team members.