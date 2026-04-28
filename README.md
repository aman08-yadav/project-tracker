<div align="center">
  <h1>🚀 ProjectHub</h1>
  <p><b>Team Contribution Tracking System</b></p>
  <p><i>A Full-Stack Web Application developed for transparent, real-time collaboration and automated academic evaluation.</i></p>
  
  <br />

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
</div>

<br />

## 📖 About The Project

In academic and professional group projects, evaluating individual contributions is traditionally subjective and opaque. Often, a minority of students perform the majority of the work, yet all group members receive identical evaluations.

**ProjectHub** solves this by providing a unified workspace where students manage tasks, upload files, and chat in real-time. Crucially, the system silently monitors every action—task completions, file uploads, and chat activity—and calculates an automated **Contribution Score**. This provides faculty with a transparent, data-driven "Leaderboard" to grade students fairly based on empirical data.

---

## ✨ Core Features

* 🔐 **Secure Authentication**: Login via Email/Password with JWT-based session management and Bcrypt password hashing.
* 👥 **Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for `student` and `faculty` roles.
* 📋 **Interactive Kanban Board**: Drag-and-drop or click-based task tracking (Pending ➡️ In-Progress ➡️ Completed).
* 💬 **Real-Time Project Chat**: Live WebSocket-powered chat rooms with typing indicators.
* 📁 **Centralized File Management**: Secure file uploads with MIME validation, tracked per project.
* 🏆 **Automated Analytics & Leaderboard**: Real-time ranking of students based on calculated contribution metrics.
* 📊 **Faculty Dashboard**: Students progress overview, activity heatmaps, and task completion analytics.

---

## 🛠️ Technology Stack & Architecture

This project was built without heavy frontend frameworks like React or Angular to demonstrate a deep understanding of core web technologies.

### Frontend
* **HTML5 & Vanilla CSS3**: Modern "Dark Glassmorphism" aesthetic with responsive grid/flexbox layouts.
* **Vanilla JavaScript (ES6 Modules)**: Highly modular client-side logic utilizing `async/await`, dynamic DOM manipulation, and native `fetch` API.

### Backend
* **Node.js & Express.js**: Robust server environment and RESTful API routing with MVC architecture.
* **MongoDB (via Mongoose)**: NoSQL document database for storing users, projects, tasks, files, and activity logs.
* **Socket.IO**: Bidirectional WebSocket connections for real-time chat and live UI updates.
* **JWT & Bcrypt**: Stateless token-based authentication with secure password hashing.

---

## 📂 Project Structure

```text
project-tracker/
├── client/              # Frontend assets (HTML, CSS, Vanilla JS)
│   ├── css/             # Stylesheets (main, sidebar, components, responsive)
│   ├── html/            # Pages (dashboard, tasks, project, analytics, etc.)
│   └── js/              # API client, auth, and UI modules
├── server/              # Node.js backend logic
│   ├── controllers/     # Business logic (auth, tasks, projects, analytics)
│   ├── middleware/      # Auth, role-based access, error handling, logging
│   ├── models/          # Mongoose schemas (User, Project, Task, File, ActivityLog)
│   ├── routes/          # Express API routing
│   ├── sockets/         # Socket.IO room management and chat
│   └── server.js        # Application entry point
└── README.md
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [MongoDB Atlas](https://www.mongodb.com/) account (or local MongoDB)

### Installation

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
   Create a `.env` file in the `server` directory:
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

4. **Start the Application**
   ```bash
   cd server
   npm run dev
   ```

---

## 💡 How It Works (The Contribution Formula)

When a faculty member views the Leaderboard, the backend dynamically calculates scores using weighted metrics:

```javascript
const contributionScore = Math.round(
  (analytics.tasksCompleted * 10) +  // High weight for finishing work
  (analytics.uploadsCount * 5) +     // Medium weight for sharing resources
  (analytics.activityCount * 1)      // Low weight for general activity
);
```

---

## 🔒 Security Measures

* **JWT Authentication**: Stateless, scalable token-based auth with automatic expiry.
* **Bcrypt Hashing**: Secure password storage with salt rounds.
* **Helmet.js**: HTTP security headers to prevent common attacks.
* **CORS Policy**: Strict origin-based request filtering.
* **MIME Validation**: File upload type filtering to prevent malicious scripts.
* **Role Middleware**: Server-side enforcement of faculty/student permissions.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
