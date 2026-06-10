# Final Architecture

## Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | React.js, Next.js, TypeScript |
| Styling | Tailwind CSS, CSS Modules |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT (JSON Web Token) |
| AI Integration | OpenAI API |
| Image Storage | Cloudinary |
| Version Control | Git & GitHub |
| Deployment | Vercel / Render (or deployment platform used by team) |

---

# Main Folders

| Folder | Purpose |
|----------|----------|
| `/frontend` | Contains the client-side React/Next.js application |
| `/frontend/src/components` | Reusable UI components |
| `/frontend/src/pages` | Main application pages and routes |
| `/frontend/src/services` | API communication and utility functions |
| `/backend` | Contains server-side application logic |
| `/backend/routes` | API route definitions |
| `/backend/controllers` | Request handling and business logic |
| `/backend/models` | MongoDB database schemas |
| `/backend/middleware` | Authentication and request validation |
| `/docs` | Project documentation and sprint reports |
| `/docs/sprints` | Weekly sprint packets |
| `/docs/Issue` | Weekly issue logs |

---

# Main Components, Routes, or Endpoints

| Item | Purpose |
|---------|---------|
| Login Page | User authentication |
| Register Page | New account creation |
| Dashboard | Main student landing page |
| Notes Module | Share and manage study notes |
| Marketplace Module | Buy and sell items within campus |
| AI Assistant | Answer campus and study-related questions |
| Admin Dashboard | Administrative management functions |
| Notices Module | Publish and manage campus announcements |
| Like System | Allows users to like notes and marketplace posts |
| `/api/auth/login` | User login endpoint |
| `/api/auth/register` | User registration endpoint |
| `/api/notes` | Notes CRUD operations |
| `/api/marketplace` | Marketplace CRUD operations |
| `/api/notices` | Notice management endpoints |
| `/api/likes` | Like functionality endpoints |

---

# Data Model

### User

| Field | Type |
|---------|---------|
| _id | ObjectId |
| name | String |
| email | String |
| password | String (hashed) |
| role | String (student/admin) |
| createdAt | Date |

### Notes

| Field | Type |
|---------|---------|
| _id | ObjectId |
| title | String |
| content | String |
| author | User Reference |
| likes | Number |
| createdAt | Date |

### Marketplace Item

| Field | Type |
|---------|---------|
| _id | ObjectId |
| title | String |
| description | String |
| price | Number |
| seller | User Reference |
| likes | Number |
| createdAt | Date |

### Notice

| Field | Type |
|---------|---------|
| _id | ObjectId |
| title | String |
| content | String |
| createdBy | Admin Reference |
| createdAt | Date |

---

# External Services

| Service | Purpose |
|----------|----------|
| MongoDB Atlas | Cloud database hosting |
| OpenAI API | AI assistant functionality |
| Cloudinary | Image upload and storage |
| GitHub | Source code management |
| Vercel / Render | Application deployment |

---

# Diagram

```text
+-------------------+
|      Student      |
+---------+---------+
          |
          v
+-------------------+
|     Frontend      |
| React / Next.js   |
+---------+---------+
          |
          v
+-------------------+
|      Backend      |
| Node.js / Express |
+---------+---------+
          |
   +------+------+
   |             |
   v             v
+---------+   +---------+
| MongoDB |   | OpenAI  |
| Database|   |   API   |
+---------+   +---------+
      |
      v
+--------------+
| Cloudinary   |
| Image Store  |
+--------------+

          ^
          |
+---------+---------+
|      Admin        |
+-------------------+
```

## Architecture Summary

Campus Helper follows a full-stack client-server architecture. Users interact with a React/Next.js frontend, which communicates with an Express.js backend through REST APIs. The backend manages authentication, business logic, and database operations using MongoDB. External services such as OpenAI and Cloudinary provide AI assistance and image storage capabilities. JWT authentication secures protected routes and administrative functions.
