<div align="center">
  <h1>🚀 Project Tracker</h1>
  <p><b>Team Contribution Tracking System</b></p>
  <p><i>A Full-Stack Web Application developed for transparent, real-time collaboration and automated academic evaluation.</i></p>
  
  <br />

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Jest-C2132E?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
</div>

<br />

## 📖 About The Project

In academic and professional group projects, evaluating individual contributions is traditionally subjective and opaque. Often, a minority of students perform the majority of the work, yet all group members receive identical evaluations.

**ProjectHub** solves this by providing a unified workspace where students manage tasks, upload files, and chat in real-time. The system monitors every action—task completions, file uploads, and chat activity—and calculates an automated **Contribution Score**. Faculty can review student uploads, assign ranks, and provide feedback through a comprehensive dashboard.

---

## ✨ Core Features

* 🔐 **Secure Authentication**: Login via Email/Password with JWT-based session management and Bcrypt password hashing.
* 👥 **Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for `student` and `faculty` roles.
* 📋 **Interactive Kanban Board**: Drag-and-drop or click-based task tracking (Pending ➡️ In-Progress ➡️ Completed).
* 💬 **Real-Time Project Chat**: Live WebSocket-powered chat rooms with typing indicators.
* 📁 **Centralized File Management**: Secure file uploads with MIME validation, tracked per project.
* 🏆 **Automated Analytics & Leaderboard**: Real-time ranking of students based on calculated contribution metrics.
* 📊 **Faculty Dashboard**: Students progress overview, activity heatmaps, and task completion analytics.
* 🔔 **Persistent Notification System**: Real-time + email notifications for task assignments, completions, and file reviews.
* 📝 **Teacher Review Dashboard**: Faculty can review uploaded files, write remarks, approve/reject with feedback.
* 🏅 **Student Ranking System**: Faculty assigns ranks (A+ to F), scores (0-100), and remarks per student per project.
* 📄 **PDF Export**: Export student rankings as a print-friendly PDF document.
* 🔕 **Notification Preferences**: Per-user toggles for in-app and browser push notifications.
* 🔊 **Notification Sound**: Web Audio API chime for incoming real-time notifications.
* 🛡️ **Rate Limiting**: API abuse protection with express-rate-limit on auth, upload, and general endpoints.

---

## 🔑 Demo Credentials

The database comes pre-seeded with demo accounts. Use these to log in after running `node seed.js`:

| Role | Email | Password | Capabilities |
|------|-------|----------|-------------|
| 👨‍🏫 **Faculty** | `faculty@demo.com` | `faculty123` | Create projects, assign tasks, review files, rank students |
| 🎓 **Student 1** | `student@demo.com` | `student123` | View tasks, upload files, chat, view own rank |
| 🎓 **Student 2** | `student2@demo.com` | `student123` | View tasks, upload files, chat, view own rank |
| 🎓 **Student 3** | `student3@demo.com` | `student123` | View tasks, upload files, chat, view own rank |

### Demo Data Includes
- **2 Projects**: INT 219 Web Project (4 members), CS 301 AI Research (3 members)
- **10 Tasks**: Mix of completed, in-progress, and pending across both projects
- **6 File Records**: Approved, pending, and rejected with faculty remarks
- **9 Notifications**: Task assignments, completions, and file reviews
- **5 Student Rankings**: Grades from A+ to B- with scores and remarks
- **7 Chat Messages**: Sample conversations in both project channels

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [MongoDB Atlas](https://www.mongodb.com/) account (or local MongoDB)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/aman08-yadav/project-tracker.git
   cd project-tracker
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   
   Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   SESSION_SECRET=your_session_secret
   NODE_ENV=development
   CLIENT_URL=http://localhost:5001
   UPLOAD_DIR=uploads
   ```
   
   Optional (for email notifications):
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM=noreply@projecthub.com
   ```

4. **Seed the Database**
   ```bash
   node seed.js
   ```

5. **Start the Application**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   ```
   http://localhost:5001
   ```

---

## 🌐 Deploy to Render

### One-Click Deploy

1. **Push to GitHub** (already done)
   ```bash
   git push origin main
   ```

2. **Create Render Service**
   - Go to [render.com](https://render.com) → **New Web Service**
   - Connect your GitHub repo `aman08-yadav/project-tracker`
   - Render will auto-detect the `render.yaml` blueprint

3. **Set Environment Variables**
   
   In the Render dashboard → **Environment** tab, add:
   
   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `CLIENT_URL` | Your Render service URL (e.g. `https://project-tracker.onrender.com`) |
   | `SMTP_HOST` | _(Optional)_ Your SMTP host for email notifications |
   | `SMTP_PORT` | _(Optional)_ `587` |
   | `SMTP_USER` | _(Optional)_ Your email address |
   | `SMTP_PASS` | _(Optional)_ Your email app password |
   
   > **Note**: `JWT_SECRET` and `SESSION_SECRET` are auto-generated by Render.

4. **Seed Production Database**
   
   After first deploy, open **Render Shell** and run:
   ```bash
   cd /opt/render/project/src/server && node seed.js
   ```

5. **Done!** Your app is live. Auto-deploys on every push to `main`.

### Render Configuration (`render.yaml`)

The project includes a Render blueprint that configures:
- **Build**: `cd server && npm install`
- **Start**: `cd server && node server.js`
- **Health Check**: `/api/v1/health` (pings MongoDB)
- **Auto-Deploy**: Enabled on push to `main`
- **Free Tier**: Works on Render's free plan

---

## 🧪 Testing

Run the unit test suite:

```bash
cd server
npm test
```

**20 tests** covering:
- Auth controller (register, login, duplicate rejection, getMe)
- Task controller (create, delete authorization)
- File controller (getFiles, deleteFile authorization)
- Ranking controller (getMyRank membership check)
- Notification preferences (create defaults, whitelist validation)
- Error middleware (validation errors, duplicate keys, JWT errors)

---

## 🛠️ Technology Stack & Architecture

### Frontend
* **HTML5 & Vanilla CSS3**: Modern "Dark Glassmorphism" aesthetic with responsive grid/flexbox layouts.
* **Vanilla JavaScript (ES6 Modules)**: Modular client-side logic with `async/await`, dynamic DOM manipulation, and native `fetch` API.

### Backend
* **Node.js & Express.js**: RESTful API routing with MVC architecture.
* **MongoDB (via Mongoose)**: NoSQL database for users, projects, tasks, files, notifications, rankings, and activity logs.
* **Socket.IO**: Bidirectional WebSocket connections for real-time chat, notifications, and live UI updates.
* **JWT & Bcrypt**: Stateless token-based authentication with secure password hashing.
* **Nodemailer**: Email notifications for task assignments, completions, and file reviews.
* **express-rate-limit**: API abuse protection on auth, upload, and general endpoints.

---

## 📂 Project Structure

```text
project-tracker/
├── client/                    # Frontend assets
│   ├── css/                   # Stylesheets (main, sidebar, components, responsive)
│   ├── html/                  # Pages (dashboard, tasks, project, analytics, upload, auth)
│   └── js/                    # API client, auth, and UI modules
├── server/                    # Node.js backend
│   ├── controllers/           # Business logic (auth, tasks, projects, files, analytics, notifications, rankings)
│   ├── middleware/            # Auth, role-based access, error handling, rate limiting, logging
│   ├── models/                # Mongoose schemas (User, Project, Task, File, Notification, StudentRank, etc.)
│   ├── routes/                # Express API routing
│   ├── sockets/               # Socket.IO room management and real-time events
│   ├── utils/                 # Email service (Nodemailer)
│   ├── __tests__/             # Jest unit tests
│   ├── seed.js                # Database seeder with demo data
│   ├── server.js              # Application entry point
│   └── package.json           # Server dependencies and scripts
├── render.yaml                # Render deployment blueprint
├── Procfile                   # Heroku deployment config
└── README.md
```

---

## 💡 How It Works (The Contribution Formula)

The leaderboard dynamically calculates scores using weighted metrics:

```javascript
const contributionScore = (tasksCompleted * 10) + (approvedUploads * 5);
```

- **Completed Tasks**: 10 points each (verified by task status)
- **Approved File Uploads**: 5 points each (requires faculty approval)
- **Faculty Rankings**: Additional rank/score assigned directly by faculty

---

## 🔒 Security Measures

* **JWT Authentication**: Stateless, scalable token-based auth with automatic expiry.
* **Bcrypt Hashing**: Secure password storage with salt rounds.
* **Helmet.js**: HTTP security headers to prevent common attacks.
* **CORS Policy**: Strict origin-based request filtering.
* **MIME Validation**: File upload type filtering to prevent malicious scripts.
* **Role Middleware**: Server-side enforcement of faculty/student permissions.
* **Rate Limiting**: API abuse protection (10 auth attempts/15min, 100 API calls/15min, 20 uploads/hour).
* **Input Validation**: express-validator on all mutation endpoints.
* **XSS Protection**: HTML escaping on all user data rendered in the browser.
* **ObjectId Validation**: MongoDB ObjectId validation on all ID parameters.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | Create a new task (on Tasks page) |
| `P` | Go to Projects page |
| `?` | Open Help modal |
| `Esc` | Close any modal or drawer |

---

## 📄 License

This project is open-source.
