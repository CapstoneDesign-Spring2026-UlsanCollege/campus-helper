# Campus Helper - Interactive Workflow Flowcharts
> 📚 **Complete guide to all major workflows in the Campus Helper application**
---
## 📑 Table of Contents
1. [User Registration Flow](#1-user-registration-flow)
2. [User Login & Token Refresh](#2-user-login--token-refresh)
3. [AI Assistant Chat Flow](#3-ai-assistant-chat-flow)
4. [Notes Upload & Browsing](#4-notes-upload--browsing)
5. [Direct Chat Messaging](#5-direct-chat-messaging)
6. [Marketplace & Lost & Found](#6-marketplace--lost--found)
7. [Admin Console Workflows](#7-admin-console-workflows)
---
## 1. User Registration Flow
### Overview
User registration process with frontend validation, password hashing, JWT token generation, and cookie storage.
### Flowchart
```
                            ╔════════════════════╗
                            ║      START         ║
                            ╚═════════╤══════════╝
                                      │
                                      ▼
                            ┌────────────────────┐
                            │  User Navigates    │
                            │   to /signup       │
                            └─────────╤──────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │    Render Signup Form           │
                    │ • Email input                   │
                    │ • Password field                │
                    │ • Confirm password              │
                    │ • Name input                    │
                    └─────────────╤───────────────────┘
                                  │
                                  ▼
                        ┌──────────────────────┐
                        │  User Fills Form     │
                        │  & Clicks Submit     │
                        └──────────╤───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Frontend Validation         │
                    │ • Email format valid         │
                    │ • Password strong enough     │
                    │ • Passwords match            │
                    │ • All fields required        │
                    └─────────────┬────────────────┘
                                  │
                        ┌─────────┴──────────┐
                        │                    │
                    ✗ INVALID          ✓ VALID
                        │                    │
                        ▼                    ▼
                  ┌─────────────┐   ┌──────────────────────┐
                  │ Show Error  │   │ POST /api/auth/      │
                  │ Toast       │   │ signup               │
                  └─────────────┘   │                      │
                                    │ Body: {              │
                                    │   email,             │
                                    │   password,          │
                                    │   name               │
                                    │ }                    │
                                    └──────────┬───────────┘
                                               │
                                ┌──────────────▼────────────────┐
                                │  Backend: Signup Handler      │
                                │                               │
                                │ 1. Validate input schema      │
                                │ 2. Check if user exists       │
                                │ 3. Hash password (bcrypt)     │
                                │ 4. Create User in MongoDB     │
                                └──────────────┬────────────────┘
                                               │
                                ┌──────────────▼────────────────┐
                                │  User Already Exists?         │
                                └─────┬──────────────────────┬──┘
                                      │                      │
                                  YES │                  NO │
                                      ▼                      ▼
                            ┌────────────────────┐  ┌──────────────────────┐
                            │ Return 409         │  │ Generate JWT Tokens: │
                            │ Email already      │  │ • Access (15 min)    │
                            │ exists             │  │ • Refresh (7 days)   │
                            └────────────────────┘  │                      │
                                      │             │ jwt.sign({userId,    │
                                      │             │   role}, secret)     │
                                      │             └──────────┬───────────┘
                                      │                        │
                                      │             ┌──────────▼────────────┐
                                      │             │ Set HTTP-only Cookies │
                                      │             │ (Secure flag enabled) │
                                      │             └──────────┬────────────┘
                                      │                        │
                                      └────────────┬───────────┘
                                                   │
                                    ┌──────────────▼────────────┐
                                    │ Return 201 Created        │
                                    │ {                         │
                                    │   success: true,          │
                                    │   user: {                 │
                                    │     id, email, name,      │
                                    │     role: 'student'       │
                                    │   },                      │
                                    │   tokens: {               │
                                    │     accessToken,          │
                                    │     refreshToken          │
                                    │   }                       │
                                    │ }                         │
                                    └──────────────┬────────────┘
                                                   │
                                    ┌──────────────▼────────────┐
                                    │ Frontend: Store tokens    │
                                    │ & Redirect to /dashboard  │
                                    └──────────────┬────────────┘
                                                   │
                                            ╔══════▼══════╗
                                            ║   SUCCESS   ║
                                            ╚═════════════╝
```
### Key Components
| Component | Details |
|-----------|---------|
| **Endpoint** | `POST /api/auth/signup` |
| **Frontend** | Form validation, error handling |
| **Backend** | User creation, token generation |
| **Database** | MongoDB User collection |
| **Security** | Bcrypt (10 salt rounds), JWT signing |
| **Tokens** | Access token (15 min), Refresh token (7 days) |
| **Storage** | HTTP-only cookies |
### Security Features
- ✅ Password strength validation (client + server)
- ✅ Bcrypt hashing with 10 salt rounds
- ✅ HTTP-only cookies prevent XSS
- ✅ Duplicate email check
- ✅ JWT signature verification
- ✅ Role-based access (defaults to "student")
---
## 2. User Login & Token Refresh
### Overview
Authentication flow with rate limiting, password verification, JWT token generation, and automatic token refresh mechanism.
### Login Flowchart
```
                            ╔════════════════════╗
                            ║      START         ║
                            ╚═════════╤══════════╝
                                      │
                                      ▼
                            ┌────────────────────┐
                            │  User Navigates    │
                            │   to /login        │
                            └─────────╤──────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │    Render Login Form            │
                    │ • Email input                   │
                    │ • Password field                │
                    │ • Remember Me checkbox          │
                    └─────────────╤───────────────────┘
                                  │
                                  ▼
                        ┌──────────────────────┐
                        │  User Enters Email   │
                        │  & Password          │
                        └──────────╤───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Frontend Validation         │
                    │ • Email not empty            │
                    │ • Password not empty         │
                    │ • Email format valid         │
                    └─────────────┬────────────────┘
                                  │
                        ┌─────────┴──────────┐
                        │                    │
                    ✗ INVALID          ✓ VALID
                        │                    │
                        ▼                    ▼
                  ┌─────────────┐   ┌──────────────────────┐
                  │ Show Error  │   │ POST /api/auth/login │
                  │ Toast       │   │                      │
                  └─────────────┘   │ Body: {              │
                                    │   email,             │
                                    │   password           │
                                    │ }                    │
                                    └──────────┬───────────┘
                                               │
                        ┌──────────────────────▼──────────────────┐
                        │  Backend: Rate Limiting Check           │
                        │  (Redis-backed)                         │
                        │                                         │
                        │  redis.get(`login:${email}`)           │
                        │  Max attempts: 5 per 15 minutes        │
                        └────────────┬─────────────────────┬──────┘
                                     │                     │
                              EXCEEDED│              ALLOWED│
                                     ▼                     ▼
                            ┌────────────────┐  ┌──────────────────┐
                            │ 429: Too Many  │  │ Query User by    │
                            │ Requests       │  │ Email from DB    │
                            │ Try again later│  │                  │
                            └────────────────┘  │ User.findOne({   │
                                     │          │   email: email   │
                                     │          │ })               │
                                     │          └────────┬─────────┘
                                     │                   │
                                     │        ┌──────────┴──────────┐
                                     │        │                     │
                                     │    FOUND               NOT FOUND
                                     │        │                     │
                                     │        ▼                     ▼
                                     │   ┌──────────────────┐  ┌──────────────┐
                                     │   │ Compare Password │  │ 401: Invalid │
                                     │   │ with bcrypt      │  │ Credentials  │
                                     │   │                  │  │              │
                                     │   │ bcrypt.compare() │  │ Increment    │
                                     │   └────────┬─────────┘  │ failed count │
                                     │            │            └──────────────┘
                                     │   ┌────────┴────────┐
                                     │   │                 │
                                     │   PASSWORD      PASSWORD
                                     │   MATCHES       WRONG
                                     │   │                 │
                                     │   ▼                 ▼
                                     │ ┌────────┐    ┌───────────┐
                                     │ │ ✓ OK   │    │ Increment │
                                     │ └───┬────┘    │ failed    │
                                     │     │         │ count     │
                                     │     │         │ Return    │
                                     │     │         │ 401 Error │
                                     │     │         └───────────┘
                                     │     │              │
                                     └─────┴──────┬───────┘
                                                  │
                                  ┌───────────────▼──────────────┐
                                  │ Generate JWT Tokens          │
                                  │                              │
                                  │ Access Token (15 minutes):   │
                                  │ {userId, role}              │
                                  │                              │
                                  │ Refresh Token (7 days):     │
                                  │ {userId, role}              │
                                  └───────────────┬──────────────┘
                                                  │
                                  ┌───────────────▼──────────────┐
                                  │ Set HTTP-only Cookies        │
                                  │ accessToken cookie           │
                                  │ refreshToken cookie          │
                                  │ (Secure flag set)            │
                                  └───────────────┬──────────────┘
                                                  │
                                  ┌───────────────▼──────────────┐
                                  │ Return 200 OK with tokens    │
                                  └───────────────┬──────────────┘
                                                  │
                                            ╔══════▼══════╗
                                            ║   SUCCESS   ║
                                            ╚═════════════╝
```
### Token Refresh Flowchart
```
    Access Token Expires (after 15 minutes)
                │
                ▼
    ┌────────────────────────────┐
    │ Client makes API request   │
    │ with expired access token  │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ API returns 401 response   │
    │ Token expired              │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Client checks for refresh  │
    │ token in cookies           │
    └────────────┬───────────────┘
                 │
       ┌─────────┴──────────┐
       │                    │
    EXISTS               NOT EXISTS
       │                    │
       ▼                    ▼
  ┌──────────────┐   ┌──────────────────┐
  │ POST /api/   │   │ Redirect to      │
  │ auth/refresh │   │ /login           │
  │              │   │ Session expired  │
  │ Body: {      │   └──────────────────┘
  │   refresh    │
  │   token      │
  │ }            │
  └────────┬─────┘
           │
           ▼
  ┌────────────────────────────┐
  │ Backend: verify JWT        │
  │ signature of refresh token │
  └────────┬───────────────────┘
           │
       ┌───┴────┐
       │         │
    VALID    INVALID
       │         │
       ▼         ▼
  ┌────────┐  ┌──────────────────┐
  │ Extract │  │ Return 401       │
  │ userId  │  │ Invalid token    │
  │ & role  │  │ Must login again │
  └───┬────┘  └──────────────────┘
      │
      ▼
  ┌────────────────────────────┐
  │ Verify user still exists   │
  │ in MongoDB                 │
  └────────┬───────────────────┘
           │
       ┌───┴────┐
       │         │
    EXISTS   NOT FOUND
       │         │
       ▼         ▼
  ┌────────┐  ┌──────────────────┐
  │ ✓ OK   │  │ Return 401       │
  └───┬────┘  │ User deleted     │
      │       │ Must login again │
      │       └──────────────────┘
      │
      ▼
  ┌────────────────────────────┐
  │ Generate NEW Access Token  │
  │ (Refresh token unchanged)  │
  │                            │
  │ jwt.sign(                  │
  │   {userId, role},          │
  │   JWT_ACCESS_SECRET,       │
  │   {expiresIn: '15m'}       │
  │ )                          │
  └────────┬───────────────────┘
           │
           ▼
  ┌────────────────────────────┐
  │ Return 200 OK              │
  │ {                          │
  │   success: true,           │
  │   accessToken: newToken    │
  │ }                          │
  └────────┬───────────────────┘
           │
           ▼
  ┌────────────────────────────┐
  │ Frontend: Update token in  │
  │ cookies/headers            │
  │                            │
  │ Retry original request     │
  │ with new access token      │
  └────────┬───────────────────┘
           │
           ▼
  ┌────────────────────────────┐
  │ Original request succeeds  │
  └────────┬───────────────────┘
           │
       ╔═══▼═══╗
       ║SUCCESS║
       ╚═══════╝
```
### Key Features
| Feature | Details |
|---------|---------|
| **Rate Limiting** | Max 5 attempts per 15 minutes (Redis) |
| **Password Security** | bcrypt.compare() for verification |
| **Access Token** | 15 minutes expiry for security |
| **Refresh Token** | 7 days expiry for convenience |
| **Token Storage** | HTTP-only cookies (XSS protection) |
| **Auto-Refresh** | Client-side refresh on 401 errors |
| **Token Verification** | JWT signature & user existence check |
---
## 3. AI Assistant Chat Flow
### Overview
Real-time AI-powered chat with streaming responses, file upload support, and persistent conversation history.
### Flowchart
```
                            ╔════════════════════╗
                            ║      START         ║
                            ╚═════════╤══════════╝
                                      │
                                      ▼
                            ┌────────────────────┐
                            │  User Navigates    │
                            │  to /dashboard/ai  │
                            └─────────╤──────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │  GET /api/ai/chat                   │
                    │  Load ChatHistory from MongoDB      │
                    │  (previous conversations)           │
                    └─────────────╤───────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────────────┐
                    │  Render Chat Interface           │
                    │ • Message list (history)         │
                    │ • Input box                      │
                    │ • File upload button             │
                    │ • Send button                    │
                    │ • Clear history option           │
                    └──────────────╤───────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  User Types Message  │
                        │  +/- Selects File    │
                        │  (PDF, DOC, IMAGE)   │
                        └──────────╤───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Frontend Validation         │
                    │ • Message not empty          │
                    │ • File size < 10MB (if file) │
                    │ • File type allowed          │
                    └─────────────┬────────────────┘
                                  │
                        ┌─────────┴──────────┐
                        │                    │
                    ✗ INVALID          ✓ VALID
                        │                    │
                        ▼                    ▼
                  ┌─────────────┐   ┌──────────────────────┐
                  │ Show Error  │   │ If file selected:    │
                  │ Toast       │   │ POST /api/upload     │
                  └─────────────┘   │ (Cloudinary)         │
                                    │                      │
                                    │ Get secure URL       │
                                    └──────────┬───────────┘
                                               │
                                ┌──────────────▼────────────────┐
                                │  Create request body:         │
                                │  {                            │
                                │    message: text,             │
                                │    fileUrl: (if file),        │
                                │    fileName: (if file)        │
                                │  }                            │
                                └──────────────┬────────────────┘
                                               │
                            ┌──────────────────▼──────────────────┐
                            │  POST /api/ai/chat                  │
                            │  (with Authorization header)        │
                            │  Bearer <accessToken>               │
                            └──────────────┬───────────────────┬──┘
                                           │                   │
                                       ✓ OK│              ERROR│
                                           ▼                   ▼
                            ┌────────────────────────────┐  ┌────────────┐
                            │ Backend: Verify JWT        │  │ Return 500 │
                            │ 1. Extract userId          │  │ Error      │
                            │ 2. Validate input schema   │  └────────────┘
                            │ 3. Get ChatHistory for user│
                            │ 4. Add user message        │
                            │ 5. Call OpenAI/Gemini API  │
                            └──────────────┬─────────────┘
                                           │
                            ┌──────────────▼──────────────────┐
                            │  Streaming Response             │
                            │  Content-Type: text/event-stream│
                            │                                 │
                            │  Send tokens incrementally      │
                            │  Frontend receives in real-time │
                            └──────────────┬──────────────────┘
                                           │
                            ┌──────────────▼──────────────────┐
                            │  Frontend: Display Response     │
                            │                                 │
                            │ • Accumulate tokens            │
                            │ • Show typing indicator        │
                            │ • Update chat UI progressively │
                            │ • Display message as it arrives│
                            └──────────────┬──────────────────┘
                                           │
                            ┌──────────────▼──────────────────┐
                            │  When stream ends:             │
                            │                                 │
                            │ • Collect full AI response     │
                            │ • Mark message complete        │
                            │ • Stop typing indicator        │
                            └──────────────┬──────────────────┘
                                           │
                            ┌──────────────▼──────────────────┐
                            │  Save to ChatHistory           │
                            │                                 │
                            │  Add AI response to messages    │
                            │  ChatHistory.updateOne()        │
                            │  Persist to MongoDB             │
                            └──────────────┬──────────────────┘
                                           │
                            ┌──────────────▼──────────────────┐
                            │  Frontend: Ready for next msg   │
                            │                                 │
                            │ • Clear input box              │
                            │ • Re-enable send button        │
                            │ • Scroll to latest message     │
                            │ • Show message count           │
                            └──────────────┬──────────────────┘
                                           │
                                    ╔══════▼══════╗
                                    ║   SUCCESS   ║
                                    ╚═════════════╝
```
### Key Features
| Feature | Details |
|---------|---------|
| **Providers** | OpenAI (gpt-4) primary, Google Gemini fallback |
| **Streaming** | Real-time token delivery (AI SDK v6) |
| **File Support** | PDF, DOC, PPTX, images with Cloudinary |
| **History** | Persistent MongoDB ChatHistory collection |
| **API Endpoint** | `POST /api/ai/chat` (streaming response) |
| **Security** | JWT authentication required |
| **Max File Size** | 10MB per file |
---
## 4. Notes Upload & Browsing
### Overview
Study materials management system with file uploads to Cloudinary, like/save functionality, and full-text search.
### Browsing Notes Flowchart
```
                                  START
                                    │
                                    ▼
                          ┌────────────────────┐
                          │ User navigates to  │
                          │ /dashboard/notes   │
                          └─────────╤──────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │ GET /api/notes       │
                        │ (fetch all notes)    │
                        │ with pagination      │
                        └──────────╤───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Backend Query:               │
                    │                              │
                    │ Note.find()                  │
                    │   .populate('author')        │
                    │   .sort({createdAt: -1})    │
                    │   .limit(20)                │
                    │   .skip(offset)              │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Return 200 with notes array  │
                    │ {                            │
                    │   notes: [                   │
                    │     {id, title, author,     │
                    │      fileUrl, likes, views} │
                    │   ],                         │
                    │   total, pages               │
                    │ }                            │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Frontend: Render Notes Grid  │
                    │                              │
                    │ • Card per note              │
                    │ • Thumbnail preview          │
                    │ • Title & author             │
                    │ • Like count button          │
                    │ • View/Download icons        │
                    │ • Pagination controls        │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┬───────────────┐
                    │              │               │
                 CLICK          CLICK            CLICK
                 VIEW            LIKE            DOWNLOAD
                    │              │               │
                    ▼              ▼               ▼
            ┌──────────────┐  ┌──────────┐  ┌──────────────┐
            │ GET /api/    │  │ POST /   │  │ GET /api/    │
            │ notes/[id]/  │  │ api/     │  │ notes/[id]/  │
            │ view         │  │ notes/   │  │ download     │
            │              │  │ [id]/    │  │              │
            │ Increment    │  │ like     │  │ Stream file  │
            │ view count   │  │          │  │ from         │
            │ Display      │  │ Add user │  │ Cloudinary   │
            │ content      │  │ to likes │  │ Trigger      │
            │              │  │ Update   │  │ browser      │
            │              │  │ count    │  │ download     │
            └──────────────┘  └──────────┘  └──────────────┘
```
### Uploading Notes Flowchart
```
                                  START
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │ User clicks          │
                        │ "Upload Note"        │
                        └──────────╤───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Show upload modal dialog     │
                    │ • Title input field          │
                    │ • Description textarea       │
                    │ • File picker button         │
                    │ • Upload button              │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ User fills form &    │
                        │ selects file         │
                        │ (PDF, DOC, PPTX)     │
                        └──────────╤───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Frontend validation          │
                    │ • Title not empty            │
                    │ • File selected              │
                    │ • File size < 10MB           │
                    │ • File type allowed          │
                    └─────────────┬────────────────┘
                                  │
                        ┌─────────┴──────────┐
                        │                    │
                    ✗ INVALID          ✓ VALID
                        │                    │
                        ▼                    ▼
                  ┌─────────────┐   ┌──────────────────┐
                  │ Show Error  │   │ POST /api/upload │
                  │ Toast       │   │ (Cloudinary)     │
                  └─────────────┘   │                  │
                                    │ Upload file      │
                                    │ to Cloudinary    │
                                    │                  │
                                    │ Get secure URL   │
                                    └──────────┬───────┘
                                               │
                        ┌──────────────────────┴──────────────────┐
                        │                                         │
                    ✗ ERROR                              ✓ SUCCESS
                        │                                         │
                        ▼                                         ▼
                ┌─────────────────┐              ┌────────────────────────┐
                │ Show error      │              │ POST /api/notes        │
                │ "Upload failed" │              │ (Create note record)   │
                │ Try again       │              │                        │
                └─────────────────┘              │ Body: {                │
                        │                        │   title,               │
                        │                        │   description,         │
                        │                        │   fileUrl (from upload)│
                        │                        │ }                      │
                        │                        └──────────┬─────────────┘
                        │                                   │
                        │                    ┌──────────────▼──────────┐
                        │                    │                         │
                        │                ERROR│             ✓ SUCCESS
                        │                    │                         │
                        │            ┌─────────────┐   ┌──────────────┐
                        │            │ Return 500  │   │ Create Note  │
                        │            │ Database    │   │ in MongoDB   │
                        │            │ Error       │   │              │
                        │            └─────────────┘   │ Note.create({
                        │                    │         │   title,     │
                        │                    │         │   author,    │
                        │                    │         │   fileUrl,   │
                        │                    │         │   likes: 0,  │
                        │                    │         │   views: 0   │
                        │                    │         │ })           │
                        │                    │         └──────────┬───┘
                        │                    │                    │
                        └────────────────────┼────────────────────┘
                                             │
                        ┌────────────────────▼────────────────┐
                        │ Frontend success message:           │
                        │ "Note published!"                   │
                        │ "Added to library"                  │
                        │                                     │
                        │ Close upload modal                  │
                        │ Refresh notes gallery               │
                        │ Show new note in list               │
                        └────────────────────┬────────────────┘
                                             │
                                       ╔═════▼═════╗
                                       ║  SUCCESS  ║
                                       ╚═══════════╝
```
### Key Features
| Feature | Details |
|---------|---------|
| **Browse** | GET /api/notes with pagination |
| **Upload** | POST /api/notes with file to Cloudinary |
| **Like** | POST /api/notes/[id]/like |
| **View** | GET /api/notes/[id]/view (increment counter) |
| **Download** | GET /api/notes/[id]/download |
| **Storage** | Cloudinary for files, MongoDB for metadata |
| **Max File** | 10MB per note |
---
## 5. Direct Chat Messaging
### Overview
Peer-to-peer real-time messaging with unread counts, read status tracking, and contact management.
### Flowchart
```
                            ╔════════════════════╗
                            ║      START         ║
                            ╚═════════╤══════════╝
                                      │
                                      ▼
                            ┌────────────────────┐
                            │  User Navigates to │
                            │  /dashboard/chat   │
                            └─────────╤──────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │  GET /api/chat/contacts         │
                    │  Fetch friends list             │
                    │  with unread count              │
                    └─────────────╤───────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────────┐
                    │  Render Contacts List:       │
                    │ • Show all friends           │
                    │ • Unread badges              │
                    │ • Online/offline status      │
                    │ • Last message preview       │
                    │ • Last message time          │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  User clicks contact │
                        │  to open chat        │
                        └──────────╤───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  GET /api/chat?contactId=[id]│
                    │  Fetch message history       │
                    │  (last 50 messages)          │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Render Chat Thread:         │
                    │ • Show all messages          │
                    │ • Left align: received       │
                    │ • Right align: sent          │
                    │ • Show timestamps            │
                    │ • Show read status           │
                    │ • Enable input box           │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Mark all messages as read   │
                    │  (user opened chat)          │
                    │                              │
                    │  Update Message.read = true  │
                    │  for unread messages         │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  User types message  │
                        │  in input box        │
                        └──────────╤───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Frontend validation         │
                    │ • Message not empty          │
                    │ • Trim whitespace            │
                    └─────────────┬────────────────┘
                                  │
                        ┌─────────┴──────────┐
                        │                    │
                    EMPTY              ✓ VALID
                        │                    │
                        ▼                    ▼
                  ┌─────────────┐   ┌──────────────────────┐
                  │ Don't send  │   │ Clear input box      │
                  │ message     │   │ Show typing...       │
                  └─────────────┘   │ indicator            │
                                    │                      │
                                    │ POST /api/chat       │
                                    │                      │
                                    │ Body: {              │
                                    │   content,           │
                                    │   recipientId        │
                                    │ }                    │
                                    └──────────┬───────────┘
                                               │
                                ┌──────────────┴───────────────┐
                                │                              │
                            ✗ ERROR                      ✓ SUCCESS
                                │                              │
                                ▼                              ▼
                        ┌──────────────┐         ┌──────────────────────┐
                        │ Show error   │         │ Create Message       │
                        │ toast        │         │ in MongoDB           │
                        │ "Failed to   │         │                      │
                        │ send"        │         │ Message.create({     │
                        │              │         │   sender: userId,    │
                        │ Keep message │         │   recipient:         │
                        │ for retry    │         │   recipientId,       │
                        └──────────────┘         │   content,           │
                                │               │   timestamp,         │
                                │               │   read: false        │
                                │               │ })                   │
                                │               └────────┬─────────────┘
                                │                        │
                                │                        ▼
                                │              ┌──────────────────────┐
                                │              │ Return 201 Created   │
                                │              │ with message object  │
                                │              └────────┬─────────────┘
                                │                       │
                                └──────────┬────────────┘
                                           │
                            ┌──────────────▼──────────────┐
                            │ Frontend updates UI:        │
                            │ • Add message to thread     │
                            │ • Show in chat window       │
                            │ • Align to right (sent)     │
                            │ • Clear input box           │
                            │ • Remove typing...          │
                            │ • Scroll to bottom          │
                            │ • Show timestamp            │
                            └──────────────┬──────────────┘
                                           │
                            ┌──────────────▼──────────────┐
                            │ Backend notifies recipient  │
                            │ (optional real-time):       │
                            │                              │
                            │ • Recipient sees unread ↑   │
                            │ • Toast notification        │
                            │ • Message in contacts list  │
                            └──────────────┬──────────────┘
                                           │
                            ┌──────────────▼──────────────┐
                            │ Periodic polling (optional):│
                            │ GET /api/chat/unread        │
                            │ Updates unread badges       │
                            │ Every 5 seconds             │
                            └──────────────┬──────────────┘
                                           │
                                    ╔══════▼══════╗
                                    ║   SUCCESS   ║
                                    ╚═════════════╝
```
### Key Features
| Feature | Details |
|---------|---------|
| **Endpoints** | GET /api/chat/contacts, GET /api/chat, POST /api/chat |
| **Unread Count** | GET /api/chat/unread (polling) |
| **Message Status** | read/unread tracking |
| **Contact List** | Friends with last message preview |
| **Online Status** | Real-time or polling-based |
| **Persistence** | MongoDB Message collection |
| **Max Messages** | 50 loaded per chat thread |
---
## 6. Marketplace & Lost & Found
### Overview
Community commerce system with two workflows: marketplace for buying/selling and lost & found for lost items.
### Marketplace Flowchart
```
          ╔═══════════════════════╗        ╔═══════════════════════╗
          ║   CREATE LISTING      ║        ║   BROWSE ITEMS        ║
          ╚═════════╤═════════════╝        ╚════════════╤══════════╝
                    │                                   │
                    ▼                                   ▼
        ┌─────────────────────┐              ┌──────────────────┐
        │ Click "Create       │              │ GET /api/market  │
        │ Listing" button     │              │ Fetch all items  │
        └────────────┬────────┘              └────────┬─────────┘
                     │                               │
                     ▼                               ▼
        ┌──────────────────────┐          ┌──────────────────┐
        │ Show form modal      │          │ Render grid of   │
        │ • Title             │          │ marketplace cards│
        │ • Description       │          │ • Image          │
        │ • Price             │          │ • Price          │
        │ • Category          │          │ • Seller name    │
        │ • Image upload      │          └────────┬─────────┘
        └────────────┬────────┘                   │
                     │                        ┌───┴─────────┐
                     ▼                        │             │
        ┌──────────────────────┐      CLICK ITEM      CLICK SELLER
        │ User fills form &    │      DETAILS         PROFILE
        │ selects image        │        │                  │
        └────────────┬────────┘        ▼                  ▼
                     │        ┌──────────────────┐  ┌──────────────┐
                     ▼        │ Show item        │  │ Show seller  │
        ┌──────────────────────┐        │ details      │ profile page │
        │ Validation:          │        │ & seller info│ • Other items│
        │ • Title              │        │ • Contact    │ • Ratings    │
        │ • Price > 0          │        │   button     │ • Chat link  │
        │ • Image selected     │        └──────────────┘  └──────────────┘
        │ • Image < 5MB        │
        └────────────┬────────┘
                     │
           ┌─────────┴──────────┐
           │                    │
       ✗ INVALID          ✓ VALID
           │                    │
           ▼                    ▼
     ┌──────────┐     ┌──────────────────┐
     │Show error│     │POST /api/upload  │
     └──────────┘     │Upload image to   │
           │          │Cloudinary        │
           │          └────────┬─────────┘
           │                   │
           │        ┌──────────┴─────────┐
           │        │                    │
           │    ✗ ERROR          ✓ SUCCESS
           │        │                    │
           │        ▼                    ▼
           │   ┌──────────┐      ┌──────────────────┐
           │   │Show error│      │GET Cloudinary URL│
           │   └──────────┘      │                  │
           │        │            │POST /api/market  │
           │        │            │                  │
           │        │            │Create MarketItem │
           │        │            │in MongoDB        │
           │        │            │                  │
           │        │            │MarketItem.create(│
           │        │            │  {title, price,  │
           │        │            │   imageUrl,      │
           │        │            │   seller: userId │
           │        │            │  })              │
           │        │            └────────┬─────────┘
           │        │                     │
           └────────┼─────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Frontend success msg │
         │ "Listing posted!"    │
         │                      │
         │ Close modal          │
         │ Refresh market page  │
         │ Show new item        │
         └────────────┬─────────┘
                      │
                 ╔════▼════╗
                 ║ SUCCESS ║
                 ╚═════════╝
```
### Lost & Found Flowchart
```
                                START
                                  │
                                  ▼
                        ┌──────────────────┐
                        │ Click "Report    │
                        │ Lost" button     │
                        └────────┬─────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Show lost item form      │
                    │ • Item name              │
                    │ • Description            │
                    │ • Location lost          │
                    │ • Category               │
                    │ • Photo upload           │
                    │ • Date lost              │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ User fills form  │
                        │ & uploads photo  │
                        └────────┬─────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Frontend validation      │
                    │ • All fields filled      │
                    │ • Image selected/valid   │
                    │ • Date reasonable        │
                    └────────────┬─────────────┘
                                 │
                       ┌─────────┴──────────┐
                       │                    │
                   ✗ INVALID          ✓ VALID
                       │                    │
                       ▼                    ▼
                 ┌──────────┐     ┌──────────────────┐
                 │Show error│     │POST /api/upload  │
                 └──────────┘     │Upload photo      │
                       │          │to Cloudinary     │
                       │          └────────┬─────────┘
                       │                   │
                       │        ┌──────────┴─────────┐
                       │        │                    │
                       │    ✗ ERROR          ✓ SUCCESS
                       │        │                    │
                       │        ▼                    ▼
                       │   ┌──────────┐      ┌──────────────────┐
                       │   │Show error│      │POST /api/lost-   │
                       │   └──────────┘      │found             │
                       │        │            │                  │
                       │        │            │Create LostItem:  │
                       │        │            │ {itemName,       │
                       │        │            │  description,    │
                       │        │            │  location,       │
                       │        │            │  photoUrl,       │
                       │        │            │  status: 'lost'} │
                       │        │            └────────┬─────────┘
                       │        │                     │
                       └────────┼─────────────────────┘
                                │
                        ┌───────▼────────┐
                        │                │
                    ✗ ERROR        ✓ SUCCESS
                        │                │
                        ▼                ▼
                  ┌──────────────┐  ┌──────────────────┐
                  │Return 500    │  │Return 201        │
                  │Create failed │  │Created           │
                  └──────────────┘  │                  │
                        │           │Post visible to  │
                        │           │other students   │
                        │           └────────┬────────┘
                        │                    │
                        │        ┌──────────▼─────────┐
                        │        │ Other users can:   │
                        │        │ • Search posts     │
                        │        │ • Filter by        │
                        │        │   location         │
                        │        │ • View details     │
                        │        │ • Contact poster   │
                        │        │ • Mark as found    │
                        │        └────────────────────┘
                        │
                        └─ End with error OR SUCCESS
```
### Key Features
| Feature | Details |
|---------|---------|
| **Marketplace** | POST /api/market, GET /api/market |
| **Lost & Found** | POST /api/lost-found, GET /api/lost-found |
| **Image Upload** | Cloudinary-backed, 5MB max |
| **Search** | Query by location, item name, category |
| **Contact** | Direct messaging with poster/seller |
| **Status Tracking** | active/completed for marketplace, lost/found for items |
---
## 7. Admin Console Workflows
### Overview
Protected admin-only routes for publishing announcements and managing users.
### Admin Access Flowchart
```
                            ╔════════════════════╗
                            ║      START         ║
                            ╚═════════╤══════════╝
                                      │
                                      ▼
                            ┌────────────────────┐
                            │  User Navigates to │
                            │ /dashboard/admin   │
                            └─────────╤──────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │  Backend: Verify Admin Access   │
                    │  (src/lib/admin-auth.ts)        │
                    │                                 │
                    │ 1. Extract JWT from cookies    │
                    │ 2. Verify JWT signature        │
                    │ 3. Check user.role === "admin" │
                    │ 4. If not admin → 403          │
                    └─────────────┬───────────────────┘
                                  │
                        ┌─────────┴──────────┐
                        │                    │
                    NOT ADMIN         ✓ IS ADMIN
                        │                    │
                        ▼                    ▼
                  ┌─────────────┐   ┌──────────────────────┐
                  │ 403:        │   │ Render Admin         │
                  │ Forbidden   │   │ Dashboard with:      │
                  │             │   │ • Announcements      │
                  │ Redirect to │   │ • User Management    │
                  │ /dashboard  │   │ • Timetable Config   │
                  │ Show error: │   │ • Academic Events    │
                  │ "Access     │   │ • Bus Schedules      │
                  │  denied"    │   │ • Analytics          │
                  └─────────────┘   └──────────┬───────────┘
                                               │
                                    ┌──────────┴──────────┐
                                    │                     │
                                 SELECT                 SELECT
                                ANNOUNCE.              USERS
                                    │                     │
                                    ▼                     ▼
```
### Publishing Announcements Flowchart
```
                        ┌─────────────────────────┐
                        │ Admin clicks "Publish   │
                        │ Announcement" button    │
                        └────────────┬────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────┐
                    │ Show announcement form:    │
                    │ • Title input              │
                    │ • Content (rich text)      │
                    │ • Image upload (optional)  │
                    │ • Publish date             │
                    │ • Target audience filter   │
                    └────────────┬───────────────┘
                                 │
                                 ▼
                        ┌──────────────────────┐
                        │ Admin fills form     │
                        │ & optionally uploads │
                        │ image                │
                        └────────────┬─────────┘
                                     │
                                     ▼
                    ┌────────────────────────────┐
                    │ Frontend validation        │
                    │ • Title not empty          │
                    │ • Content not empty        │
                    │ • Image valid (optional)   │
                    └────────────┬───────────────┘
                                 │
                       ┌─────────┴──────────┐
                       │                    │
                   ✗ INVALID          ✓ VALID
                       │                    │
                       ▼                    ▼
                 ┌──────────┐     ┌──────────────────┐
                 │Show error│     │If image: POST    │
                 └──────────┘     │/api/upload       │
                       │          │Get Cloudinary URL│
                       │          └────────┬─────────┘
                       │                   │
                       │        ┌──────────┴─────────┐
                       │        │                    │
                       │    ✗ ERROR          ✓ SUCCESS
                       │        │                    │
                       │        ▼                    ▼
                       │   ┌──────────┐      ┌──────────────────┐
                       │   │Show error│      │POST /api/admin/  │
                       │   └──────────┘      │announcements     │
                       │        │            │                  │
                       │        │            │Body: {           │
                       │        │            │  title,          │
                       │        │            │  content,        │
                       │        │            │  imageUrl        │
                       │        │            │}                 │
                       │        │            │                  │
                       │        │            │Backend:          │
                       │        │            │1. Verify admin   │
                       │        │            │2. Validate input │
                       │        │            │3. Create         │
                       │        │            │   Announcement   │
                       │        │            │4. Create         │
                       │        │            │   Notifications  │
                       │        │            │   for all users  │
                       │        │            └────────┬─────────┘
                       │        │                     │
                       │        │            ┌────────┴──────┐
                       │        │            │               │
                       │        │        ✗ ERROR      ✓ SUCCESS
                       │        │            │               │
                       │        │            ▼               ▼
                       │        │    ┌──────────────┐  ┌──────────────┐
                       │        │    │Return 500    │  │Return 201    │
                       │        │    │Error         │  │Created       │
                       │        │    └──────────────┘  │              │
                       │        │            │        │Create        │
                       │        │            │        │Notification  │
                       │        │            │        │for each user │
                       └────────┼────────────┴────────┴──────────────┘
                                │
                        ┌───────▼────────┐
                        │ Frontend:      │
                        │ • Success msg  │
                        │ • Close form   │
                        │ • Refresh list │
                        │ • Show new     │
                        │   announcement │
                        └────────┬───────┘
                                 │
                        ┌────────▼────────┐
                        │ All students:   │
                        │ • Toast notify  │
                        │ • Notification  │
                        │   badge update  │
                        │ • View in /     │
                        │   dashboard/    │
                        │   notifications │
                        └────────┬───────┘
                                 │
                            ╔════▼════╗
                            ║ SUCCESS ║
                            ╚═════════╝
```
### User Management Flowchart
```
                        ┌─────────────────────┐
                        │ GET /api/admin/     │
                        │ users               │
                        │                     │
                        │ Backend:            │
                        │ 1. Verify admin     │
                        │ 2. Query all users  │
                        │ 3. Paginate results │
                        └────────────┬────────┘
                                     │
                                     ▼
                    ┌────────────────────────────┐
                    │ Frontend: Render user list │
                    │                            │
                    │ • Search/filter bar        │
                    │ • User rows with:          │
                    │   - Email                  │
                    │   - Name                   │
                    │   - Role (student/admin)   │
                    │   - Status (active/suspend)│
                    │   - Actions:               │
                    │     • View profile         │
                    │     • Make admin           │
                    │     • Remove admin         │
                    │     • Suspend              │
                    │     • Activate             │
                    │     • Delete               │
                    └────────────┬───────────────┘
                                 │
                    ┌────────────┬───────────────┐
                    │            │               │
              MAKE ADMIN    REMOVE ADMIN    SUSPEND
                    │            │               │
                    ▼            ▼               ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ PUT /api/admin/  │  │ PUT /api/admin/  │
        │ users/[id]       │  │ users/[id]       │
        │                  │  │                  │
        │ {role: 'admin'}  │  │ {role: 'student'}
        │                  │  │                  │
        │ Backend:         │  │ Backend:         │
        │ 1. Verify admin  │  │ 1. Verify admin  │
        │ 2. Find user     │  │ 2. Find user     │
        │ 3. Update role   │  │ 3. Update role   │
        │ 4. Save to DB    │  │ 4. Save to DB    │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ Return 200 OK    │  │ Return 200 OK    │
        │ with updated user│  │ with updated user│
        │                  │  │                  │
        │ User is now admin│  │ User no longer   │
        │ Must re-login to │  │ admin privileges │
        │ see admin panel  │  │ Must re-login    │
        └────────┬─────────┘  └────────┬─────────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │ Frontend:           │
                 │ • Update user list  │
                 │ • Show success toast│
                 │ • Update role badge │
                 │ • Notify user to    │
                 │   re-login          │
                 └────────┬────────────┘
                          │
                     ╔════▼════╗
                     ║ SUCCESS ║
                     ╚═════════╝
```
### Key Features
| Feature | Details |
|---------|---------|
| **Admin Check** | Route protected by user.role === "admin" |
| **Endpoints** | /api/admin/* (all admin routes) |
| **Announcements** | POST /api/admin/announcements |
| **Users** | GET /api/admin/users, PUT /api/admin/users/[id] |
| **Security** | JWT verification + role check on every request |
| **Notifications** | Auto-created when announcements published |
---
## Color Legend
```
┌─────────────────────────────────────────────┐
│            FLOWCHART SYMBOLS                │
├─────────────────────────────────────────────┤
│ ╔═══╗  Green    = Start / End / Success     │
│ ╚═══╝                                       │
│                                              │
│ ┌───┐  Blue     = Process / Action          │
│ └───┘                                       │
│                                              │
│  ◇   Orange    = Decision Point             │
│  ◇   ◇                                      │
│                                              │
│ ┌───┐  Purple   = Data / API Endpoint       │
│ └───┘                                       │
│                                              │
│ ┌───┐  Red      = Error / Exception         │
│ └───┘                                       │
│                                              │
│  ─►  Arrow     = Flow Direction             │
│                                              │
│ ✓    Check     = Success Path               │
│ ✗    Cross     = Error Path                 │
└─────────────────────────────────────────────┘
```
---
## API Endpoints Reference
### Authentication
```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - Login with rate limiting
POST   /api/auth/logout              - Logout
POST   /api/auth/refresh             - Refresh access token
POST   /api/auth/forgot-password     - Request password reset
POST   /api/auth/reset-password      - Reset password
GET    /api/auth/profile             - Get current user
```
### AI & Chat
```
POST   /api/ai/chat                  - Send message to AI (streaming)
GET    /api/chat/contacts            - List chat contacts
GET    /api/chat                     - Fetch message history
POST   /api/chat                     - Send direct message
GET    /api/chat/unread              - Get unread count
```
### Content Management
```
GET    /api/notes                    - List all notes
POST   /api/notes                    - Upload new note
GET    /api/notes/[id]/view          - View note
POST   /api/notes/[id]/like          - Like note
GET    /api/notes/[id]/download      - Download note
GET    /api/market                   - List marketplace items
POST   /api/market                   - Create listing
DELETE /api/market/[id]              - Delete listing
GET    /api/lost-found               - List lost items
POST   /api/lost-found               - Report lost item
PUT    /api/lost-found/[id]          - Update status
```
### Timetable & Events
```
GET    /api/timetable                - Get user schedule
POST   /api/timetable                - Create/update schedule
GET    /api/semesters                - List semesters
GET    /api/academic-events          - List campus events
GET    /api/bus-schedules            - List bus schedules
```
### Social
```
GET    /api/friends                  - List friends & suggestions
POST   /api/friends                  - Send friend request
PUT    /api/friends/[id]             - Accept/reject request
DELETE /api/friends/[id]             - Remove friend
```
### General
```
POST   /api/upload                   - Upload file to Cloudinary
GET    /api/notifications            - List announcements
```
### Admin
```
POST   /api/admin/announcements      - Publish announcement
GET    /api/admin/users              - List all users
PUT    /api/admin/users/[id]         - Update user role
POST   /api/admin/semesters          - Create semester
POST   /api/admin/timetable-templates - Set course templates
POST   /api/admin/academic-events    - Create event
POST   /api/admin/bus-schedules      - Add bus route
```
---
## Security Checklist
- ✅ **Password Hashing**: bcrypt with 10 salt rounds
- ✅ **JWT Tokens**: Signed with secret keys, short expiry (15m access, 7d refresh)
- ✅ **HTTP-only Cookies**: Prevent XSS attacks
- ✅ **Rate Limiting**: Redis-backed login attempt limiting (5 attempts/15 min)
- ✅ **Admin Verification**: Check role on every admin-only route
- ✅ **File Upload**: Proxy through server-side API, whitelist MIME types
- ✅ **Input Validation**: Zod schema validation on all inputs
- ✅ **CORS**: Configure trusted origins
- ✅ **Environment Variables**: Never commit secrets
- ✅ **Token Refresh**: Automatic token refresh on 401 responses
---
## Database Models
| Model | Collection | Purpose |
|-------|-----------|---------|
| **User** | users | User accounts & authentication |
| **ChatHistory** | chathistories | AI conversation history |
| **Message** | messages | Direct peer-to-peer messages |
| **Friendship** | friendships | User connections |
| **Note** | notes | Study materials |
| **Timetable** | timetables | Student schedules |
| **MarketItem** | marketitems | Marketplace listings |
| **LostItem** | lostitems | Lost & found posts |
| **Announcement** | announcements | Admin notices |
| **Notification** | notifications | User notifications |
| **Semester** | semesters | Academic periods |
| **SemesterTimetableTemplate** | semestertimetabletemplates | Course templates |
| **AcademicEvent** | academicevents | Campus events |
| **BusSchedule** | busschedules | Transportation |
---
## Summary
This guide covers all 7 major workflows in Campus Helper:
1. **Signup** - User registration with validation and token generation
2. **Login** - Authentication with rate limiting and token refresh
3. **AI Chat** - Streaming responses with history persistence
4. **Notes** - File upload and note management
5. **Direct Chat** - Peer-to-peer messaging
6. **Marketplace** - Community commerce system
7. **Admin** - Announcements and user management
Each workflow shows:
- **Complete flowchart** with decision points and error handling
- **Key components** and technical details
- **API endpoints** used
- **Database operations**
- **Security measures**
