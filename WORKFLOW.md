# Campus Helper - Detailed Project Workflow

## Project Overview

**Campus Helper** is a full-stack smart campus platform for Ulsan College students, built with Next.js 16, React 19, MongoDB, and AI integration. It centralizes student workflows including AI assistance, schedules, notes, marketplace posts, lost-and-found, friend networking, direct chat, and admin notices in one responsive web application.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React 19)                    │
│            Next.js 16 App Router with TypeScript            │
│         Tailwind CSS + Framer Motion + Lucide Icons         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─ Authentication Layer (JWT-based)
                   ├─ Client-side API Client
                   └─ Component Library
                   
┌──────────────────────────────────────────────────────────────┐
│                    Backend API Routes                        │
│              Next.js Server-side Route Handlers              │
│  Authentication | Business Logic | Database Operations      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─ JWT Token Management & Validation
                   ├─ Admin Role Verification
                   ├─ Rate Limiting (Redis-based)
                   └─ File Upload Management (Cloudinary)
                   
┌──────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│              MongoDB + Mongoose ORM                          │
│              Redis (Optional Cache/Rate Limit)              │
└──────────────────────────────────────────────────────────────┘
                   │
                   └─ External Services:
                      ├─ OpenAI (AI Assistant)
                      ├─ Google Gemini (AI Alternative)
                      ├─ Cloudinary (File Uploads)
                      └─ Email Service (SMTP)
```

---

## Core Data Models

### 1. **User Model** (`src/models/User.ts`)
- Stores student/admin account information
- Fields: email, password (hashed), name, profile photo, role, friends list
- Authentication: JWT tokens, password hashing with bcrypt
- Roles: "student" (default), "admin"

### 2. **ChatHistory Model** (`src/models/ChatHistory.ts`)
- Persists AI assistant conversation history
- Fields: userId, messages array, timestamps
- Supports file attachments in messages

### 3. **Message Model** (`src/models/Message.ts`)
- Direct peer-to-peer chat messages between students
- Fields: sender, recipient, content, timestamp, read status
- Tracks unread message count

### 4. **Friendship Model** (`src/models/Friendship.ts`)
- Manages student connections and networking
- Fields: user1, user2, status (pending/accepted), createdAt
- Supports friend discovery and connection management

### 5. **Note Model** (`src/models/Note.ts`)
- Study materials upload and browsing
- Fields: title, content, author, cloudinary URL, likes, timestamps
- Supports file attachments and like system

### 6. **Timetable Model** (`src/models/Timetable.ts`)
- Student schedule management
- Fields: userId, semester, courses, weekly schedule grid
- Linked to semester templates for consistency

### 7. **MarketItem Model** (`src/models/MarketItem.ts`)
- Campus marketplace posts
- Fields: title, description, price, image, seller, createdAt
- Campus commerce functionality

### 8. **LostItem Model** (`src/models/LostItem.ts`)
- Lost and found system
- Fields: title, description, location, image, poster, status, timestamps
- Helps students recover lost items

### 9. **Announcement Model** (`src/models/Announcement.ts`)
- Admin-published notifications to students
- Fields: title, content, author (admin), image, timestamps
- Admin-only creation and management

### 10. **Semester/Academic Models**
- **Semester**: Academic periods (e.g., Spring 2026, Fall 2025)
- **SemesterTimetableTemplate**: Default course templates per semester
- **AcademicEvent**: Campus events (exams, holidays)
- **BusSchedule**: Campus transportation schedule

### 11. **Notification Model** (`src/models/Notification.ts`)
- System notifications for user activities
- Fields: recipient, type, message, read status, timestamps

---

## Authentication & Authorization Flow

### User Registration Flow
```
signup/page.tsx (UI)
         ↓
POST /api/auth/signup
         ↓
1. Validate input (email format, password policy)
2. Check if user exists in MongoDB
3. Hash password with bcrypt (salt rounds: 10)
4. Create new User document
5. Return JWT tokens (access + refresh)
         ↓
Store tokens in HTTP-only cookies
         ↓
Redirect to /dashboard
```

### Login Flow
```
login/page.tsx (UI)
         ↓
POST /api/auth/login
         ↓
1. Find user by email
2. Compare password with hashed password
3. If Redis available: Check rate limiting (max 5 attempts/15 min)
4. Generate JWT tokens (access: 15m, refresh: 7d)
5. Return tokens in secure cookies
         ↓
Set cookies & redirect to /dashboard
```

### Token Refresh Flow
```
Access token expires (15 minutes)
         ↓
Client detects 401 response
         ↓
POST /api/auth/refresh (with refresh token)
         ↓
1. Verify refresh token signature
2. Extract userId and role
3. Generate new access token
         ↓
Return new access token
```

### Protected Routes
```
src/lib/server-auth.ts
         ↓
1. Extract JWT from cookies
2. Verify signature using JWT_ACCESS_SECRET
3. Decode token to get userId and role
4. Attach user info to request
5. Grant/deny access based on role
```

### Admin Authorization
```
src/lib/admin-auth.ts
         ↓
1. Call server-auth verification
2. Check if user.role === "admin"
3. Allow access to admin-only routes
4. Example: /dashboard/admin, /api/admin/*
```

---

## User Workflows

### 1. Dashboard & Navigation
```
Entry: GET /dashboard
         ↓
src/app/dashboard/layout.tsx (Protected)
         ↓
├─ AppLayout (shared wrapper)
│  ├─ Navbar (top navigation)
│  ├─ Sidebar (desktop nav)
│  └─ MobileNav (mobile nav)
│
└─ Route-specific page.tsx
   ├─ /dashboard (home/overview)
   ├─ /dashboard/ai (AI assistant)
   ├─ /dashboard/timetable (schedule)
   ├─ /dashboard/notes (study materials)
   ├─ /dashboard/chat (direct messaging)
   ├─ /dashboard/network (friend discovery)
   ├─ /dashboard/market (marketplace)
   ├─ /dashboard/lost-found (lost & found)
   ├─ /dashboard/notifications (announcements)
   └─ /dashboard/admin (admin console - admin only)
```

**Navigation Configuration**: `src/lib/navigation.ts`
- Centralized menu item definitions
- Prevents sidebar/mobile nav drift
- Links mapped consistently across all screen sizes

---

### 2. AI Assistant Workflow
```
User accesses: /dashboard/ai
         ↓
Frontend: React component with chat interface
         ↓
User types message + optionally uploads file
         ↓
POST /api/ai/chat
         ↓
Backend Processing:
1. Verify authentication (JWT)
2. Handle file upload if present (Cloudinary)
3. Save conversation to ChatHistory in MongoDB
4. Send message to OpenAI/Google Gemini API
         ↓
Streaming Response:
- Use AI SDK v6 streaming
- Real-time message display
- Save response to ChatHistory
         ↓
Display in chat UI with history persistence
```

**Providers Supported**:
- OpenAI (Primary) - `@ai-sdk/openai`
- Google Gemini (Alternative) - `@ai-sdk/google`

---

### 3. Timetable & Schedule Management
```
User accesses: /dashboard/timetable
         ↓
GET /api/timetable (fetch user's current schedule)
         ↓
Display Schedule UI:
1. Get current semester
2. Fetch Timetable document for user + semester
3. Render weekly grid with courses
         ↓
User Actions:
├─ Add/edit course → PUT/POST to /api/timetable
├─ View template → GET /api/semesters (current semester)
└─ Switch semester → GET /api/semesters/{id}/timetable

Admin Actions (/dashboard/admin):
├─ Create semester template → POST /api/admin/semesters
├─ Set course templates → POST /api/admin/timetable-templates
└─ Manage academic events → POST /api/admin/academic-events
```

**Data Flow**:
```
Semester (e.g., "Spring 2026")
   ↓
SemesterTimetableTemplate (default courses)
   ↓
Student copies/customizes → Timetable (personal schedule)
```

---

### 4. Notes & Study Materials
```
User accesses: /dashboard/notes
         ↓
GET /api/notes (list all notes)
         ↓
Display Notes Gallery:
1. Fetch all Note documents
2. Show title, author, preview, like count
         ↓
User Actions:
├─ Upload note:
│  POST /api/notes
│  1. Upload file to Cloudinary
│  2. Save Note with URL reference
│  3. Return to gallery
│
├─ View note:
│  GET /api/notes/[id]/view
│  1. Fetch Note by ID
│  2. Display content
│  3. Increment view count
│
├─ Like note:
│  POST /api/notes/[id]/like
│  1. Add current user to likes array
│  2. Update Like count
│
├─ Save note:
│  POST /api/notes/[id]/save
│  1. Add note ID to user's saved collection
│  2. Create notification
│
└─ Download note:
   GET /api/notes/[id]/download
   1. Stream file from Cloudinary
   2. Trigger browser download
```

**File Upload Pipeline**:
```
User selects file
   ↓
Frontend validation (type, size)
   ↓
POST /api/upload (Cloudinary proxy)
   ↓
Backend uploads to Cloudinary
   ↓
Return secure URL
   ↓
Save URL in MongoDB Note document
```

---

### 5. Campus Chat (Direct Messaging)
```
User accesses: /dashboard/chat
         ↓
GET /api/chat/contacts (list friends)
         ↓
Display Contacts:
1. Fetch all Friendship documents where user is party
2. Show online/offline status
3. Display unread message count
         ↓
User selects contact:
   ↓
GET /api/chat (fetch message history)
   ↓
Display Chat Thread:
1. Load Message documents between users
2. Sort by timestamp
3. Mark as read
         ↓
User sends message:
   ↓
POST /api/chat
   ↓
1. Create Message document
2. Save sender, recipient, content, timestamp
3. Emit real-time notification (if WebSocket enabled)
4. Update unread count
         ↓
Recipient gets notification
         ↓
Unread count polled periodically:
   GET /api/chat/unread
   ↓
Display badge with count
```

**Message States**:
- Unread (just received)
- Read (user viewed)
- Delivered (confirmed by server)

---

### 6. Friend Network & Discovery
```
User accesses: /dashboard/network
         ↓
GET /api/friends (fetch friend suggestions)
         ↓
Display Network:
1. List current friends (Friendship status = "accepted")
2. Show pending requests (status = "pending")
3. Show suggested users (not yet connected)
         ↓
User Actions:
├─ Send friend request:
│  POST /api/friends
│  ↓
│  1. Create Friendship (status: "pending")
│  2. Send notification to recipient
│  3. Add to recipient's pending list
│
├─ Accept/reject request:
│  PUT /api/friends/{id}
│  ↓
│  1. Update Friendship status
│  2. If accepted: enable direct chat
│  3. Send notification
│
└─ Remove friend:
   DELETE /api/friends/{id}
   ↓
   1. Delete Friendship document
   2. Notify both users
```

---

### 7. Campus Marketplace
```
User accesses: /dashboard/market
         ↓
GET /api/market (list all marketplace items)
         ↓
Display Marketplace:
1. Fetch all MarketItem documents
2. Show product cards (image, title, price, seller)
3. Sort by newest/price
         ↓
User Actions:
├─ Create listing:
│  POST /api/market
│  ↓
│  1. Upload product image (Cloudinary)
│  2. Create MarketItem
│  3. Set seller as current user
│
├─ View item details:
│  GET /api/market/[id]
│  ↓
│  1. Fetch MarketItem
│  2. Show seller contact info
│
├─ Contact seller:
│  → Redirect to chat with seller
│
└─ Remove listing (own items):
   DELETE /api/market/[id]
   ↓
   1. Verify user is seller
   2. Delete MarketItem
   3. Cleanup Cloudinary file
```

---

### 8. Lost & Found System
```
User accesses: /dashboard/lost-found
         ↓
GET /api/lost-found (list all posts)
         ↓
Display Posts:
1. Fetch all LostItem documents
2. Filter by status (lost/found)
3. Show location, description, image
         ↓
User Actions:
├─ Post lost item:
│  POST /api/lost-found
│  ↓
│  1. Upload item photo (Cloudinary)
│  2. Create LostItem (status: "lost")
│  3. Include location and description
│
├─ Search posts:
│  GET /api/lost-found?query=phone&location=library
│  ↓
│  1. Full-text search in MongoDB
│
├─ Mark as found:
│  PUT /api/lost-found/[id]
│  ↓
│  1. Update LostItem status to "found"
│  2. Contact original poster
│
└─ View details & contact:
   1. Display item info
   2. Chat with poster
```

---

### 9. Admin Console Workflow
```
User (with role: "admin") accesses: /dashboard/admin
         ↓
Admin checks:
1. JWT includes role: "admin"
2. User model has role: "admin"
3. Route is protected by admin-auth
         ↓
Display Admin Dashboard:
├─ User Management
├─ Announcement Publishing
├─ Timetable/Semester Management
├─ Bus Schedule Management
└─ Analytics/Reports
         ↓
Admin Actions:
├─ Publish Announcement:
│  POST /api/admin/announcements
│  ↓
│  1. Create Announcement document
│  2. Set author to current admin user
│  3. Broadcast to all users
│  4. Create Notification for each student
│
├─ Manage Users:
│  GET/PUT /api/admin/users
│  ↓
│  1. List all users
│  2. Promote/demote admin status
│  3. Update user records
│  4. Suspend/activate accounts
│
├─ Configure Timetable:
│  POST /api/admin/timetable-templates
│  ↓
│  1. Create semester
│  2. Set default course templates
│  3. Allow students to select courses
│
├─ Manage Academic Events:
│  POST /api/admin/academic-events
│  ↓
│  1. Create exams, holidays, events
│  2. Link to semester
│  3. Display on student calendars
│
└─ Configure Bus Schedule:
   POST /api/admin/bus-schedules
   ↓
   1. Add bus routes
   2. Set departure/arrival times
   3. Display on student dashboard
```

---

## API Route Architecture

### Authentication Routes
```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - Login (with rate limiting)
POST   /api/auth/logout              - Logout
POST   /api/auth/refresh             - Refresh access token
POST   /api/auth/forgot-password     - Request password reset
POST   /api/auth/reset-password      - Reset password with token
GET    /api/auth/profile             - Get current user profile
```

### AI Routes
```
POST   /api/ai/chat                  - Send message to AI (streaming)
```

### Student Dashboard Routes
```
GET    /api/notes                    - List all notes
POST   /api/notes                    - Upload new note
GET    /api/notes/[id]/view          - View note
POST   /api/notes/[id]/like          - Like/unlike note
POST   /api/notes/[id]/save          - Save note
GET    /api/notes/[id]/download      - Download note file

GET    /api/timetable                - Get user's schedule
POST   /api/timetable                - Create/update schedule
GET    /api/semesters                - List semesters
GET    /api/academic-events          - List campus events
GET    /api/bus-schedules            - List bus schedules

GET    /api/chat/contacts            - List chat contacts
GET    /api/chat                     - Fetch message history
POST   /api/chat                     - Send direct message
GET    /api/chat/unread              - Get unread message count

GET    /api/friends                  - List friends & suggestions
POST   /api/friends                  - Send friend request
PUT    /api/friends/[id]             - Accept/reject request
DELETE /api/friends/[id]             - Remove friend

GET    /api/market                   - List marketplace items
POST   /api/market                   - Create listing
DELETE /api/market/[id]              - Delete listing

GET    /api/lost-found               - List lost items
POST   /api/lost-found               - Post lost item
PUT    /api/lost-found/[id]          - Update lost item status

GET    /api/notifications            - List announcements

POST   /api/upload                   - Upload file to Cloudinary
```

### Admin Routes
```
POST   /api/admin/announcements      - Publish announcement
GET    /api/admin/users              - List all users
PUT    /api/admin/users/[id]         - Update user (promote to admin, etc.)

POST   /api/admin/semesters          - Create semester
PUT    /api/admin/semesters/[id]     - Update semester

POST   /api/admin/timetable-templates - Set default course templates
PUT    /api/admin/timetable-templates/[id] - Update templates

POST   /api/admin/academic-events    - Create campus event
PUT    /api/admin/academic-events/[id] - Update event

POST   /api/admin/bus-schedules      - Add bus route
PUT    /api/admin/bus-schedules/[id] - Update route
```

---

## Frontend Component Structure

### Layout Components (`src/components/layout/`)
```
AppLayout.tsx
  ├─ Navbar.tsx          - Top navigation bar
  ├─ Sidebar.tsx         - Desktop sidebar navigation
  ├─ MobileNav.tsx       - Mobile-responsive navigation
  └─ CinematicBackground.tsx - Background effects

```

### UI Components (`src/components/ui/`)
```
Button.tsx             - Reusable button component
Input.tsx              - Form input component
Card.tsx               - Card container component
Avatar.tsx             - User profile avatar
```

### Media Components (`src/components/media/`)
```
StudioHero.tsx         - Hero section on landing page
CommandHero.tsx        - Dashboard command bar
MediaGallery.tsx       - Gallery for notes/media
```

### Page Components (`src/app/*/page.tsx`)
- Each route has its own page component
- Uses AppLayout wrapper for consistency
- Handles data fetching and state management

---

## Styling & Design System

### Global Styles
- **File**: `src/app/globals.css`
- **Framework**: Tailwind CSS v4 with PostCSS
- **Design Tokens**: Defined in `@theme` section

### Fonts
- **Display**: Playfair Display (via `next/font`)
- **UI Text**: DM Sans (via `next/font`)
- Loaded in `src/app/layout.tsx`

### Configuration
- **Tailwind**: `tailwind.config.ts`
- **PostCSS**: `postcss.config.mjs`
- **TypeScript**: `tsconfig.json`

### Animation
- **Framework**: Framer Motion v12
- Used for smooth transitions and effects

### Icons
- **Library**: Lucide React icons
- Consistent icon set across UI

---

## Utility & Helper Functions

### Authentication
- `src/lib/auth.ts` - JWT token generation, password hashing
- `src/lib/server-auth.ts` - Server-side auth verification
- `src/lib/admin-auth.ts` - Admin role verification

### Database
- `src/lib/mongoose.ts` - MongoDB connection management
- Handles connection pooling and error handling

### External Services
- `src/lib/cloudinary.ts` - File upload configuration
- `src/lib/redis.ts` - Redis client initialization
- `src/lib/notifications.ts` - Notification utility functions

### Security & Validation
- `src/lib/password-policy.ts` - Password strength requirements
- `src/lib/env.ts` - Environment variable validation
- `src/lib/utils.ts` - General utility functions

### Client API
- `src/lib/client-api.ts` - Axios-like client for API calls
- Handles request/response interceptors
- Token refresh logic

---

## Data Flow Diagrams

### Request → Response Flow
```
User Action (UI)
    ↓
Client API Call (src/lib/client-api.ts)
    ↓
Send request with JWT in headers/cookies
    ↓
Next.js API Route Handler (/api/*)
    ↓
├─ Verify JWT & extract user info
├─ Validate input
├─ Business logic processing
├─ MongoDB query/update
└─ Return response
    ↓
Client processes response
    ↓
UI updates with new data
    ↓
Toast notification on success/error
```

### File Upload Flow
```
User selects file (UI)
    ↓
POST /api/upload
    ↓
Backend receives file
    ↓
Upload to Cloudinary
    ↓
Get secure URL from Cloudinary
    ↓
Return URL to client
    ↓
Client saves URL to MongoDB (in Note/MarketItem/etc.)
    ↓
Display file in UI with Cloudinary URL
```

### Authentication Token Flow
```
User logs in
    ↓
Generate JWT tokens
    ↓
├─ Access token (15 min expiry)
└─ Refresh token (7 day expiry)
    ↓
Store in HTTP-only cookies
    ↓
On each API request:
├─ Include access token in Authorization header
└─ If expired, use refresh token to get new access token
    ↓
Admin checks:
1. Verify JWT signature
2. Extract userId and role
3. Check if role == "admin"
4. Grant/deny access
```

---

## External Service Integration

### OpenAI Integration
- **Library**: `@ai-sdk/openai`
- **Purpose**: AI Assistant chat completions
- **Configuration**: API key from environment variables
- **Streaming**: Real-time response streaming to client
- **Storage**: Conversation history saved to MongoDB

### Google Gemini Integration
- **Library**: `@ai-sdk/google`
- **Purpose**: Alternative AI provider
- **Configuration**: API key from environment variables
- **Fallback**: Can switch between OpenAI and Gemini

### Cloudinary Integration
- **Purpose**: File upload and storage
- **Configuration**: Cloud name, API key, API secret
- **Endpoints**: Upload new files, delete files, transform images
- **Security**: Server-side upload proxy to prevent direct access

### Email Service (SMTP)
- **Purpose**: Password reset emails
- **Configuration**: SMTP credentials (user, password)
- **Service**: Nodemailer integration
- **Flow**: Send reset link to user email

### Redis Integration (Optional)
- **Library**: ioredis
- **Purpose**: Rate limiting, caching
- **Configuration**: `REDIS_URL` environment variable
- **Rate Limiting**: Prevent brute-force login attempts
- **Fallback**: Works without Redis in development

---

## Deployment Workflow

### Development
```
npm run dev
    ↓
Runs Next.js dev server on http://localhost:3000
Uses webpack with hot reload
Connects to local MongoDB and optional local Redis
```

### Quality Checks
```
npm run lint    → ESLint code quality check
npm run typecheck → TypeScript type checking
npm run build   → Production build compilation
```

### Production Deployment

#### Option 1: Vercel
```
1. Connect GitHub repository to Vercel
2. Auto-detect Next.js framework
3. Configure environment variables
4. Set NEXT_PUBLIC_APP_URL to production domain
5. Deploy (automatic on push to main)
```

#### Option 2: Self-hosted
```
1. npm run build
2. npm run start
3. Expose on port 3000 (default)
4. Configure reverse proxy (Nginx/Apache)
5. Set all required environment variables
```

#### Option 3: Docker
```
1. Create Dockerfile based on Node.js runtime
2. COPY package.json and run npm install
3. COPY src and run npm run build
4. CMD npm run start
5. Build and push to Docker registry
6. Deploy on container orchestration platform
```

---

## Environment Variables Checklist

### Database & Cache
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/campus
REDIS_URL=redis://localhost:6379 (optional, for rate limiting)
```

### AI Providers
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
GOOGLE_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

### File Upload
```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Authentication
```
JWT_ACCESS_SECRET=your-long-random-string-for-access-token
JWT_REFRESH_SECRET=your-long-random-string-for-refresh-token
```

### Email
```
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Application URLs
```
NEXT_PUBLIC_APP_URL=http://localhost:3000 (dev) or https://your-domain.com (prod)
APP_URL=http://localhost:3000 (for server-side operations)
```

---

## Security Best Practices

1. **Password Hashing**: bcrypt with salt rounds 10
2. **JWT Tokens**: Signed with secret keys, short expiry (15 min access, 7 day refresh)
3. **HTTP-only Cookies**: Prevent XSS attacks on tokens
4. **Rate Limiting**: Redis-backed login attempt limiting
5. **Environment Variables**: Never commit secrets, use `.env.local`
6. **Admin Verification**: Check role on every admin-only route
7. **File Upload**: Proxy through server-side API, whitelist MIME types
8. **CORS**: Configure trusted origins
9. **Input Validation**: Zod schema validation on all inputs
10. **Password Policy**: Enforce minimum complexity

---

## Development Workflow

### Setup
```bash
npm install                    # Install dependencies
cp .env.example .env.local     # Create local environment file
npm run dev                    # Start dev server
```

### During Development
```bash
npm run typecheck              # Check TypeScript errors
npm run lint                   # Check code style
npm run dev                    # Hot reload server
```

### Before Committing
```bash
npm run lint                   # Fix linting issues
npm run typecheck              # Verify types
npm run build                  # Test production build
```

### Deployment Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] All environment variables set
- [ ] MongoDB connection verified
- [ ] Cloudinary credentials valid
- [ ] AI provider API keys working
- [ ] SMTP configuration correct
- [ ] Redis URL configured (production only)
- [ ] JWT secrets set to strong values
- [ ] NEXT_PUBLIC_APP_URL matches production domain

---

## Common Tasks & Workflows

### Adding a New Feature
```
1. Create new Mongoose model if needed (src/models/)
2. Add API route handler (src/app/api/[feature]/)
3. Create frontend page component (src/app/dashboard/[feature]/)
4. Add navigation link to src/lib/navigation.ts
5. Test with npm run dev
6. Run quality checks
7. Commit and push
```

### Adding Admin-only Feature
```
1. Add feature to API route with admin-auth check
2. Create admin page in src/app/dashboard/admin/
3. Verify role in route handler
4. Test with admin user account
5. Ensure non-admins get 403 Forbidden
```

### Debugging Production Issues
```
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Check MongoDB connection status
4. Review API route error handling
5. Enable verbose logging if needed
6. Monitor frontend console for errors
```

### Performance Optimization
```
1. Use Next.js Image component for media
2. Implement pagination for large lists
3. Cache frequently-accessed data with Redis
4. Compress files before Cloudinary upload
5. Use TypeScript strict mode to catch bugs early
```

---

## Summary

**Campus Helper** follows a modern full-stack Next.js architecture with:
- **Frontend**: React 19 with Tailwind CSS and Framer Motion
- **Backend**: Next.js API routes with MongoDB and JWT authentication
- **AI**: Streaming chat with OpenAI/Gemini
- **Files**: Cloudinary-backed uploads
- **Security**: bcrypt passwords, JWT tokens, admin role verification
- **Scalability**: Redis caching, efficient MongoDB queries, CDN for media

The workflow enables students to access campus services (AI assistant, schedules, notes, chat, marketplace) through one authenticated platform, while admins manage content and user accounts through a protected console.
