<div align="center">

<br/>

```
██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗    ██╗  ██╗██╗   ██╗██████╗
██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝    ██║  ██║██║   ██║██╔══██╗
██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║       ███████║██║   ██║██████╔╝
██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║       ██╔══██║██║   ██║██╔══██╗
██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║       ██║  ██║╚██████╔╝██████╔╝
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝       ╚═╝  ╚═╝ ╚═════╝ ╚═════╝
```

**Track. Collaborate. Evaluate. Together.**

<br/>

[![Node.js](https://img.shields.io/badge/Node.js_18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express_4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.IO_4-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Jest](https://img.shields.io/badge/Jest_30-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

<br/>

[🐛 Report a Bug](https://github.com/aman08-yadav/project-tracker/issues) · [✨ Request a Feature](https://github.com/aman08-yadav/project-tracker/issues) · [📡 API Reference](#-api-reference)

</div>

<br/>

---

## 📋 Table of Contents
- [What is ProjectHub?](#-what-is-projecthub)
- [Features at a Glance](#-features-at-a-glance)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Demo Credentials](#-demo-credentials)
- [Pages & Routes](#-pages--routes)
- [API Reference](#-api-reference)
- [Role-Based Access Control](#-role-based-access-control)
- [Contribution Formula](#-contribution-formula-how-scores-are-calculated)
- [Security Measures](#-security-measures)
- [Testing](#-testing)
- [Deployment](#-deploy-to-render)
- [Keyboard Shortcuts](#️-keyboard-shortcuts)
- [License](#-license)

---

## 🚀 What is ProjectHub?

**ProjectHub** is a full-stack web application built to bring **transparency and fairness** to group project evaluation in academic and professional settings.

In traditional group work, a minority of students often carry the majority of the workload — yet all members receive identical grades. ProjectHub solves this by providing a shared workspace where every action is recorded. Students manage tasks, upload deliverables, and chat in real-time, while the system silently measures each person's contribution and generates a live, data-driven leaderboard.

> **No more free-riders. Just data, accountability, and fair grades.**

Built with a **Vanilla JS + HTML/CSS** frontend and a **Node.js + Express + MongoDB** backend, it features real-time WebSocket communication (Socket.IO), a Kanban task board, a faculty review portal with approval/rejection workflows, automated contribution scoring, PDF rank export, email notifications via Nodemailer, a full Jest test suite, and one-click Render deployment.

---

## ✨ Features at a Glance

| | Feature | What it does |
|---|---|---|
| 🔐 | **Secure Authentication** | JWT-based login with bcrypt password hashing and session management |
| 👥 | **Role-Based Access Control** | Distinct interfaces and API permissions for `student` and `faculty` roles |
| 📋 | **Kanban Task Board** | Click-based task tracking across Pending → In-Progress → Completed stages |
| 💬 | **Real-Time Project Chat** | Live WebSocket chat rooms per project with typing indicators (Socket.IO) |
| 📁 | **File Management** | Secure file uploads with MIME validation, storage, and per-project tracking |
| 🏆 | **Automated Leaderboard** | Live student ranking based on task completions and approved uploads |
| 📊 | **Faculty Analytics Dashboard** | Student progress overview, activity heatmaps, and task completion stats |
| 🔔 | **Notification System** | Real-time in-app + email notifications for task events and file reviews |
| 📝 | **Faculty Review Portal** | Review uploaded files, add remarks, and approve or reject submissions |
| 🏅 | **Student Ranking System** | Faculty assigns grades (A+ to F), scores (0–100), and written remarks |
| 📄 | **PDF Rank Export** | Export all student rankings as a print-friendly PDF document |
| 🔕 | **Notification Preferences** | Per-user toggles for in-app and browser push notification categories |
| 🔊 | **Notification Sound** | Web Audio API chime triggered on incoming real-time notifications |
| 🛡️ | **Rate Limiting** | API abuse protection via express-rate-limit on auth, upload, and general endpoints |
| 🧪 | **Jest Test Suite** | 20 unit tests covering all major controllers and error middleware |

---

## 🛠️ Tech Stack

<details>
<summary><strong>Frontend</strong></summary>

| Technology | Role |
|---|---|
| **HTML5** | Semantic page structure |
| **Vanilla CSS3** | Dark glassmorphism UI, responsive grid/flexbox layouts |
| **Vanilla JavaScript (ES6 Modules)** | `async/await`, dynamic DOM manipulation, native `fetch` API |
| **Socket.IO Client** | Real-time chat and notification updates |
| **Web Audio API** | Notification chime sounds |

</details>

<details>
<summary><strong>Backend</strong></summary>

| Package | Version | Role |
|---|---|---|
| `express` | ^4.19.2 | RESTful API server (MVC architecture) |
| `mongoose` | ^8.4.0 | MongoDB ODM — schemas & queries |
| `socket.io` | ^4.7.5 | Real-time bidirectional WebSocket events |
| `jsonwebtoken` | ^9.0.2 | JWT auth token generation & verification |
| `bcryptjs` | ^2.4.3 | Password hashing with salt rounds |
| `nodemailer` | ^8.0.11 | Email notifications (SMTP) |
| `multer` | ^1.4.5-lts.1 | File upload handling |
| `express-validator` | ^7.1.0 | Input validation on all mutation endpoints |
| `express-rate-limit` | ^7.5.0 | API abuse protection |
| `helmet` | ^7.1.0 | HTTP security headers |
| `cors` | ^2.8.5 | Cross-origin request filtering |
| `morgan` | ^1.10.0 | HTTP request logging |
| `dotenv` | ^16.4.5 | Environment variable config |
| `uuid` | ^10.0.0 | Unique ID generation |
| `jest` | ^30.4.2 | Unit testing framework |
| `nodemon` | ^3.1.4 | Auto-restart in development |

</details>

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          BROWSER                                 │
│                                                                  │
│  HTML5 · Vanilla CSS3 (Dark Glassmorphism) · ES6 Modules         │
│  Native Fetch API · Socket.IO Client · Web Audio API             │
│                                                                  │
│  Pages: Login · Signup · Dashboard · Tasks · Project ·           │
│         Analytics · Upload · 404                                 │
└──────────────────┬───────────────────────────┬───────────────────┘
                   │  HTTP / REST (port 5001)   │  WebSocket (ws://)
┌──────────────────▼───────────────────────────▼───────────────────┐
│                       EXPRESS SERVER                             │
│                                                                  │
│   /api/v1/auth           →  Register · Login · Me                │
│   /api/v1/projects       →  CRUD projects · member management    │
│   /api/v1/tasks          →  CRUD tasks · status updates          │
│   /api/v1/files          →  Upload · list · review · delete      │
│   /api/v1/rankings       →  Get rank · assign rank (faculty)     │
│   /api/v1/analytics      →  Leaderboard · contribution stats     │
│   /api/v1/notifications  →  List · mark read · preferences       │
│   /api/v1/users          →  User profile · listing               │
│   /api/v1/health         →  Health check (pings MongoDB)         │
│                                                                  │
│   Middleware: requireAuth (JWT) · requireRole (RBAC)             │
│               Helmet · CORS · Rate Limiter · Morgan · Multer     │
│                                                                  │
│   Sockets: chat rooms · typing events · notification push        │
└──────────────────────────────┬───────────────────────────────────┘
                               │  Mongoose ODM
┌──────────────────────────────▼───────────────────────────────────┐
│                           MONGODB                                │
│                                                                  │
│  Collections: Users · Projects · Tasks · FileMetadata            │
│               Notifications · NotificationPreferences            │
│               StudentRank · ActivityLog · ChatMessage            │
│                                                                  │
│  Seeded via seed.js with 2 projects, 10 tasks, 4 users           │
│  Production: MongoDB Atlas via MONGODB_URI env variable          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
project-tracker/
│
├── 📄 render.yaml                  # Render deployment blueprint
├── 📄 Procfile                     # Heroku deployment config
│
├── 📁 client/                      # ── FRONTEND ──────────────────────────────────
│   ├── css/                        #   Stylesheets
│   │   └── (main, sidebar,         #     Dark glassmorphism theme, components,
│   │        components, responsive)#     responsive breakpoints
│   ├── html/                       #   Application pages
│   │   ├── index.html              #     Landing / redirect page
│   │   ├── login.html              #     JWT login form
│   │   ├── signup.html             #     Student & faculty registration
│   │   ├── dashboard.html          #     Main hub — projects, leaderboard, stats
│   │   ├── tasks.html              #     Kanban board with real-time updates
│   │   ├── project.html            #     Project detail view + real-time chat
│   │   ├── analytics.html          #     Contribution charts & heatmaps
│   │   ├── upload.html             #     File upload + faculty review portal
│   │   ├── oauth-callback.html     #     OAuth redirect handler
│   │   └── 404.html                #     Not-found page
│   └── js/                         #   JavaScript modules
│       ├── api.js                  #     Centralized fetch-based API client
│       ├── auth.js                 #     Token management & auth state
│       ├── ui.js                   #     DOM manipulation, modals, Socket.IO events
│       └── types.js                #     Shared JS type helpers
│
└── 📁 server/                      # ── BACKEND ───────────────────────────────────
    ├── server.js                   #   App entry point — Express + Socket.IO + DB
    ├── seed.js                     #   DB seeder: 4 users, 2 projects, 10 tasks
    ├── package.json                #   Scripts & dependencies
    ├── .env.example                #   Environment variable template
    │
    ├── controllers/                #   Business logic
    │   ├── authController.js       #     Register, login, getMe
    │   ├── projectController.js    #     CRUD projects, member management
    │   ├── taskController.js       #     CRUD tasks, status transitions
    │   ├── fileController.js       #     Upload, list, review, delete files
    │   ├── rankingController.js    #     Get rank, assign rank (faculty only)
    │   ├── analyticsController.js  #     Leaderboard, contribution scores
    │   ├── notificationController.js         #  List, mark-read notifications
    │   ├── notificationPreferencesController.js  # Per-user notification toggles
    │   └── userController.js       #     User profile & listing
    │
    ├── middleware/                 #   Express middleware
    │   ├── auth.js                 #     JWT verification (requireAuth)
    │   ├── requireRole.js          #     Role guard (requireRole)
    │   ├── errorHandler.js         #     Global error handler
    │   ├── rateLimiter.js          #     Rate limiting config
    │   └── logger.js               #     Morgan HTTP request logger
    │
    ├── models/                     #   Mongoose schemas
    │   ├── User.js                 #     name, email, password, role
    │   ├── Project.js              #     title, description, members, faculty
    │   ├── Task.js                 #     title, status, assignee, projectId, deadline
    │   ├── FileMetadata.js         #     filename, uploader, projectId, status, remarks
    │   ├── StudentRank.js          #     student, project, grade, score, remarks (faculty)
    │   ├── Notification.js         #     type, message, recipient, read status
    │   ├── NotificationPreferences.js  # Per-user in-app & push toggles
    │   ├── ActivityLog.js          #     User action audit trail
    │   └── ChatMessage.js          #     Real-time chat message persistence
    │
    ├── routes/                     #   Express routers
    │   ├── authRoutes.js           #     POST /register, /login · GET /me
    │   ├── projectRoutes.js        #     GET/POST/PUT/DELETE /projects
    │   ├── taskRoutes.js           #     GET/POST/PUT/DELETE /tasks
    │   ├── fileRoutes.js           #     POST /upload · GET/PUT/DELETE /files
    │   ├── rankingRoutes.js        #     GET /rankings · POST /assign (faculty)
    │   ├── analyticsRoutes.js      #     GET /leaderboard · /contribution
    │   ├── notificationRoutes.js   #     GET /notifications · PUT /read
    │   ├── notificationPreferencesRoutes.js  # GET/PUT /preferences
    │   └── userRoutes.js           #     GET /users · /me
    │
    ├── sockets/                    #   Socket.IO logic
    │   └── socketHandler.js        #     Room join/leave, chat events, notification push
    │
    ├── utils/                      #   Utility helpers
    │   └── emailService.js         #     Nodemailer transporter & email templates
    │
    └── __tests__/                  #   Jest unit tests
        └── controllers.test.js     #     20 tests across all major controllers
```

---

## ⚙️ Getting Started

### Prerequisites

| Tool | Minimum Version | Download |
|---|---|---|
| Node.js | 18.x | [nodejs.org](https://nodejs.org/) |
| npm | 9.x | Included with Node.js |
| MongoDB | 6.x | [mongodb.com](https://www.mongodb.com/try/download/community) |

> **Tip:** You can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier) instead of a local install — just paste your connection string into `MONGODB_URI`.

---

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/aman08-yadav/project-tracker.git
cd project-tracker

# 2. Install server dependencies
cd server
npm install

# 3. Copy the environment template
cp .env.example .env
```

---

## 🔧 Environment Variables

Open `server/.env` and configure:

```env
# ─── Required ──────────────────────────────────────────────────────────────────

# MongoDB connection string (Atlas or local)
MONGODB_URI=your_mongodb_connection_string

# Secret used to sign JWT tokens — use any long random string
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Express session secret
SESSION_SECRET=your_session_secret_here

# Server port
PORT=5001

# Environment
NODE_ENV=development

# Frontend URL (used for CORS and self-referential links)
CLIENT_URL=http://localhost:5001

# Upload directory
UPLOAD_DIR=uploads

# ─── Optional (Email Notifications) ───────────────────────────────────────────

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@projecthub.com
```

---

### Run the App

```bash
# Seed the database with demo data first
node seed.js

# Start in development mode (auto-restart with nodemon)
npm run dev
```

Open **[http://localhost:5001](http://localhost:5001)** in your browser. ✅

```bash
# Other commands
npm start    # Run with node (production)
npm test     # Run Jest test suite
npm run seed # Re-seed the database
```

---

## 🔑 Demo Credentials

After running `node seed.js`, the database is populated with the following accounts and sample data:

| Role | Email | Password | What you can do |
|------|-------|----------|-----------------|
| 👨‍🏫 **Faculty** | `faculty@demo.com` | `faculty123` | Create projects, assign tasks, review & rank student files, export PDF |
| 🎓 **Student 1** | `student@demo.com` | `student123` | View & complete tasks, upload files, chat, view own contribution score |
| 🎓 **Student 2** | `student2@demo.com` | `student123` | View & complete tasks, upload files, chat, view own contribution score |
| 🎓 **Student 3** | `student3@demo.com` | `student123` | View & complete tasks, upload files, chat, view own contribution score |

### Pre-Seeded Demo Data
- **2 Projects**: INT 219 Web Project (4 members) · CS 301 AI Research (3 members)
- **10 Tasks**: Mix of Pending, In-Progress, and Completed tasks across both projects
- **6 File Records**: With Approved, Pending, and Rejected statuses and faculty remarks
- **9 Notifications**: Task assignments, task completions, and file review alerts
- **5 Student Rankings**: Grades ranging A+ to B- with scores and written remarks
- **7 Chat Messages**: Sample conversations seeded in both project chat channels

---

## 📄 Pages & Routes

| Page | URL | Access | Description |
|---|---|---|---|
| Landing | `/` | Public | Redirect page (to login or dashboard) |
| Login | `/html/login.html` | Public | JWT authentication form |
| Sign Up | `/html/signup.html` | Public | Student & faculty registration |
| Dashboard | `/html/dashboard.html` | Auth | Project overview, leaderboard, contribution KPIs |
| Tasks | `/html/tasks.html` | Auth | Kanban board — Pending / In-Progress / Completed |
| Project | `/html/project.html` | Auth | Project detail view with real-time chat |
| Analytics | `/html/analytics.html` | Auth | Contribution charts, heatmaps, activity stats |
| Upload | `/html/upload.html` | Auth | File upload (student) + review portal (faculty) |
| 404 | `/html/404.html` | — | Not-found page |

---

## 📡 API Reference

Base URL: `http://localhost:5001/api/v1`

### ❤️ Health — `/api/v1/health`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | ❌ | Returns `{ status: "ok" }` + MongoDB ping |

### 🔐 Auth — `/api/v1/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register a new user (student or faculty) |
| `POST` | `/login` | ❌ | Authenticate and receive a JWT token |
| `GET` | `/me` | ✅ | Get the currently authenticated user's profile |

### 📁 Projects — `/api/v1/projects`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List all projects the user is a member of |
| `POST` | `/` | ✅ Faculty | Create a new project and assign members |
| `GET` | `/:id` | ✅ | Get a single project's details |
| `PUT` | `/:id` | ✅ Faculty | Update project details or member list |
| `DELETE` | `/:id` | ✅ Faculty | Delete a project and all its data |

### ✅ Tasks — `/api/v1/tasks`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List tasks (filterable by project) |
| `POST` | `/` | ✅ Faculty | Create a new task and assign to a student |
| `PUT` | `/:id` | ✅ | Update task status or details |
| `DELETE` | `/:id` | ✅ Faculty | Delete a task |

### 📁 Files — `/api/v1/files`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/upload` | ✅ Student | Upload a file submission for a project |
| `GET` | `/` | ✅ | List file submissions (filtered by project) |
| `PUT` | `/:id/review` | ✅ Faculty | Approve or reject a file with remarks |
| `DELETE` | `/:id` | ✅ | Delete a file (own files or faculty) |

### 🏅 Rankings — `/api/v1/rankings`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/my-rank` | ✅ Student | Get your own rank & score for a project |
| `GET` | `/` | ✅ Faculty | List all student rankings for a project |
| `POST` | `/assign` | ✅ Faculty | Assign/update a student's grade, score & remarks |

### 📊 Analytics — `/api/v1/analytics`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/leaderboard` | ✅ | Get ranked contribution scores for a project |
| `GET` | `/contribution` | ✅ | Get individual breakdown (tasks + uploads) |

### 🔔 Notifications — `/api/v1/notifications`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | List all notifications for the current user |
| `PUT` | `/:id/read` | ✅ | Mark a notification as read |
| `GET` | `/preferences` | ✅ | Get user notification preferences |
| `PUT` | `/preferences` | ✅ | Update notification preference toggles |

### 👤 Users — `/api/v1/users`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ Faculty | List all users (for project member assignment) |
| `GET` | `/me` | ✅ | Get current user's full profile |

> All protected routes require the header: `Authorization: Bearer <your_jwt_token>`

---

## 🔒 Role-Based Access Control

ProjectHub uses a **two-tier** RBAC system enforced on both the **frontend** (JS route guards) and the **backend** (`requireRole` middleware):

| Role | Access Level | Permissions |
|------|-------------|-------------|
| 👨‍🏫 **FACULTY** | Full administrative access | Create & manage projects · Assign tasks to students · Review & approve/reject file submissions · Assign grades, scores & remarks · View all analytics & leaderboards · Export PDF rankings |
| 🎓 **STUDENT** | Project-scoped participant access | View assigned projects & tasks · Update own task status · Upload file submissions · View own contribution score & rank · Participate in real-time project chat · Manage notification preferences |

---

## 💡 Contribution Formula — How Scores Are Calculated

The leaderboard dynamically calculates each student's contribution score using weighted metrics:

```javascript
const contributionScore = (tasksCompleted * 10) + (approvedUploads * 5);
```

| Action | Points | Condition |
|---|---|---|
| Task Completed | **+10 pts** | Task status updated to `completed` |
| File Upload Approved | **+5 pts** | Faculty reviews and approves the submission |
| Faculty Grade | Separate A+ → F | Directly assigned by faculty per project |

> Scores update in real-time on the leaderboard as students complete tasks and faculty approve submissions.

---

## 🔐 Security Measures

| Layer | Mechanism | Detail |
|---|---|---|
| **Auth** | JWT tokens | Stateless, auto-expiring tokens (`JWT_EXPIRES_IN`) |
| **Passwords** | bcryptjs | Secure salt-round hashing |
| **Headers** | Helmet.js | Prevents XSS, clickjacking, MIME-sniffing |
| **CORS** | Strict origin | Only `CLIENT_URL` origin is permitted |
| **File Uploads** | MIME validation | Blocks non-whitelisted file types |
| **Roles** | `requireRole` middleware | Server-side faculty/student enforcement |
| **Rate Limiting** | express-rate-limit | 10 auth attempts/15min · 100 API calls/15min · 20 uploads/hour |
| **Input** | express-validator | All create/update endpoints are validated |
| **XSS** | HTML escaping | All user data is escaped before DOM rendering |
| **IDs** | ObjectId validation | MongoDB ID params validated before DB queries |

---

## 🧪 Testing

Run the full Jest unit test suite:

```bash
cd server
npm test
```

**20 tests** across all critical paths:

| Controller | Tests |
|---|---|
| Auth Controller | Register, login, duplicate email rejection, getMe |
| Task Controller | Create task, delete authorization check |
| File Controller | Get files, delete authorization check |
| Ranking Controller | getMyRank project membership validation |
| Notification Preferences | Create default preferences, whitelist validation |
| Error Middleware | Validation errors, duplicate key errors, JWT errors |

---

## 🌐 Deploy to Render

### Prerequisites
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works)
- A [Render](https://render.com) account connected to your GitHub

### Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create a Web Service on Render**
   - Go to [render.com](https://render.com) → **New Web Service**
   - Connect the repo `aman08-yadav/project-tracker`
   - Render auto-detects the `render.yaml` blueprint

3. **Set Environment Variables** in the Render dashboard → **Environment** tab:

   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `CLIENT_URL` | Your Render URL (e.g. `https://project-tracker.onrender.com`) |
   | `SMTP_HOST` | *(Optional)* Your SMTP host |
   | `SMTP_PORT` | *(Optional)* `587` |
   | `SMTP_USER` | *(Optional)* Your email address |
   | `SMTP_PASS` | *(Optional)* Your email app password |

   > **Note**: `JWT_SECRET` and `SESSION_SECRET` are auto-generated by Render if not set.

4. **Seed the Production Database** via Render Shell:
   ```bash
   cd /opt/render/project/src/server && node seed.js
   ```

5. **Done!** The app is live and auto-deploys on every push to `main`.

### Render Blueprint (`render.yaml`)

| Setting | Value |
|---|---|
| **Build Command** | `cd server && npm install` |
| **Start Command** | `cd server && node server.js` |
| **Health Check** | `GET /api/v1/health` |
| **Auto-Deploy** | Enabled on push to `main` |
| **Plan** | Works on Render's free tier |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | Create a new task (on Tasks page) |
| `P` | Go to Projects page |
| `?` | Open Help modal |
| `Esc` | Close any open modal or drawer |

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

<div align="center">

<br/>

Built with 💙 by [**Aman Kumar**](https://github.com/aman08-yadav)

*If this project helped you, consider giving it a ⭐ — it means a lot!*

<br/>

</div>
