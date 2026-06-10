# Final MVP Scope

## Core User Flow

1. Student registers or logs into Campus Helper.
2. Student accesses the dashboard and navigates campus resources.
3. Student views and shares Notes.
4. Student browses Marketplace listings.
5. Student interacts with content using the Like feature.
6. Student uses the AI Assistant for campus and study-related questions.
7. Admin logs in and publishes campus notices.
8. Users receive updated information through the platform.

---

## Included Features

| Feature | Status | Evidence |
|----------|----------|----------|
| User Authentication (Login/Register) | Working | Login page, JWT authentication, protected routes |
| Student Dashboard | Working | Dashboard screenshots and demo |
| Notes Sharing System | Working | Notes module, CRUD operations |
| Marketplace Module | Working | Marketplace page and item listings |
| Like Feature for Notes | Working | Like button and database updates |
| Like Feature for Marketplace | Working | Like count updates and interaction logs |
| AI Assistant | Working with limitations | AI chat functionality and demo |
| Admin Notice Management | Working | Admin dashboard and notice publishing |
| Responsive User Interface | Working | Mobile and desktop testing |
| MongoDB Database Integration | Working | Database models and API connections |
| REST API Backend | Working | Backend routes and controllers |

---

## Excluded Features

| Feature | Status | Why |
|----------|----------|----------|
| Real-time Notifications | Nice Later | Not required for MVP and limited development time |
| Mobile Application | Nice Later | Focus remained on web platform |
| Advanced Analytics Dashboard | Cut | Lower priority compared to core student features |
| Live Chat Between Students | Incomplete | Requires additional backend and socket implementation |
| Course Registration Integration | Nice Later | Depends on university systems and APIs |
| Email Notification System | Incomplete | Not completed before MVP deadline |
| File Upload for Notes | Incomplete | Basic notes system completed first |
| Advanced Search and Filtering | Nice Later | Core functionality prioritized over advanced filtering |
| Multi-language Support | Nice Later | Outside MVP requirements |
| Production Deployment Automation | Incomplete | Manual deployment preparation completed, automation pending |

---

## MVP Success Criteria

- Users can successfully register and log in.
- Students can access Notes and Marketplace modules.
- Users can interact through Likes.
- AI Assistant provides study and campus support.
- Admins can publish notices.
- Data is stored and retrieved correctly from MongoDB.
- Application runs successfully with a passing production build.
- Core workflows can be demonstrated during presentation.
