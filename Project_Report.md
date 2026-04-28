<div align="center">

# 🚀 ProjectHub: Team Contribution Tracking System
**Comprehensive Academic Project Report**

*A Full-Stack Web Application developed for transparent, real-time collaboration and automated academic evaluation.*

**Submitted by:** Aman Kumar  
**Reg. No:** 12401495  
**Roll No:** 2  
**GitHub Link:** [https://github.com/aman08-yadav/project-tracker](https://github.com/aman08-yadav/project-tracker)  
**Deployed Link:** [https://project-trackerlpu.onrender.com](https://project-trackerlpu.onrender.com)  

</div>

---

## 📑 Table of Contents
1. [Abstract & Problem Statement](#1-abstract--problem-statement)
2. [Core Features](#2-core-features)
3. [Technology Stack & Frameworks](#3-technology-stack--frameworks)
4. [System Architecture & Code Structure](#4-system-architecture--code-structure)
5. [Implementation Highlights](#5-implementation-highlights)
6. [Security & Optimization](#6-security--optimization)
7. [Conclusion & Benefits](#7-conclusion--benefits)

---

## 1. Abstract & Problem Statement

### The Problem
In academic and professional group projects, evaluating individual contributions is traditionally subjective and opaque. Often, a minority of students perform the majority of the work, yet all group members receive identical evaluations. 

### The Solution
**ProjectHub** solves this by providing a unified workspace where students manage tasks, upload files, and chat in real-time. Crucially, the system silently monitors every action—task completions, file uploads, and chat activity—and calculates an automated **Contribution Score**. This provides faculty with a transparent, data-driven "Leaderboard" to grade students fairly based on empirical data.

---

## 2. Core Features

* 🔐 **Multi-Provider Authentication**: Secure login via local Email/Password (JWT), Google OAuth 2.0, and GitHub OAuth.
* 👥 **Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for `student` and `faculty` roles.
* 📋 **Interactive Kanban Board**: Drag-and-drop or click-based task tracking (Pending ➡️ In-Progress ➡️ Completed).
* 💬 **Real-Time Project Rooms**: Live WebSockets chat with typing indicators and online status tracking.
* 📁 **Centralized File Management**: Secure drag-and-drop file uploads tracked per project.
* 🏆 **Automated Analytics & Leaderboard**: Real-time ranking of students based on calculated contribution metrics.

---

## 3. Technology Stack & Frameworks

To demonstrate a deep understanding of core web technologies, the frontend was built without heavy frameworks like React or Angular, while the backend leverages a robust Node.js and MongoDB architecture.

### Frontend (Client-Side)
* **HTML5 & Vanilla CSS3**: Structured with semantic HTML. The UI is designed using a modern **"Dark Glassmorphism"** aesthetic, featuring frosted glass panels, vibrant gradients, and CSS grid/flexbox layouts.
* **Vanilla JavaScript (ES6 Modules)**: Highly modular client-side logic utilizing `async/await`, dynamic DOM manipulation, and the native `fetch` API.

### Backend (Server-Side)
* **Node.js & Express.js**: Provides a robust, lightweight server environment and RESTful API routing.
* **Socket.IO**: Establishes bidirectional WebSocket connections for real-time chat and instant UI updates.
* **Passport.js**: Industry-standard middleware for handling Google and GitHub OAuth 2.0 authentication strategies.

### Database Architecture
* **MongoDB (via Mongoose)**: Used as the primary operational database. Ideal for unstructured and rapidly changing data like Chat Messages, User Profiles, Activity Logs, and hierarchical Project/Task relationships. The database seamlessly handles both application state and analytical data aggregation for the leaderboard.

---

## 4. System Architecture & Code Structure

The backend strictly follows the **MVC (Model-View-Controller)** design pattern to ensure code maintainability.

```text
server/
├── controllers/     # Business logic (Task handling, Analytics math)
├── middleware/      # Security (JWT Auth, Role checking, Error handling)
├── models/          # MongoDB Schemas (User, Project, Task, ActivityLog)
├── routes/          # Express API route definitions
├── sockets/         # Socket.IO room management & event listeners
└── server.js        # Application entry point
```

### Flow of Data
1. **Client Request**: Frontend JS sends a JSON request via `fetch()`.
2. **Middleware**: `authMiddleware.js` intercepts the request, decodes the JWT token, and attaches the user to the request.
3. **Controller**: `taskController.js` creates a new task in MongoDB.
4. **Analytics Trigger**: The controller simultaneously updates the student's activity log in MongoDB to track their contribution.
5. **Real-time Broadcast**: `socketHandler.js` instantly pushes a notification to all other teammates currently online.

---

## 5. Implementation Highlights

### The Contribution Formula
The core of the academic evaluation relies on the analytics engine. When a faculty member views the Leaderboard, the backend dynamically calculates scores using weighted metrics based on the student's activity logs:
```javascript
const contributionScore = Math.round(
  (analytics.tasksCompleted * 10) +  // High weight for finishing work
  (analytics.uploadsCount * 5) +     // Medium weight for sharing resources
  (analytics.activityCount * 1)      // Low weight for general chat/activity
);
```

### Real-Time Isolated Rooms
To ensure privacy between different project teams, Socket.IO utilizes the concept of "Rooms":
```javascript
socket.on('joinProject', (projectId) => {
  socket.join(projectId); // Client joins isolated room
  io.to(projectId).emit('userJoined', user.name); // Broadcasts only to teammates
});
```

---

## 6. Security & Optimization

* **JWT (JSON Web Tokens)**: Stateless authentication ensures the server doesn't need to store session memory, making it highly scalable.
* **Password Hashing**: `bcryptjs` is used to salt and hash all passwords before they enter MongoDB.
* **Multer File Validation**: Uploaded files are strictly filtered by MIME type to prevent malicious script uploads.
* **CORS & Helmet**: Used to secure Express apps by setting various HTTP headers and protecting against cross-site request forgery.

---

## 7. Conclusion & Benefits

**ProjectHub** successfully bridges the gap between collaborative student workflows and objective academic grading. 

**Benefits for Students:**
* Provides a beautiful, lag-free environment to communicate and share files.
* Ensures that hard-working students are explicitly recognized for their efforts.

**Benefits for Faculty:**
* Eliminates the guesswork in group grading.
* Provides empirical, tamper-proof data regarding exactly who contributed what, and when.

By leveraging a strict Vanilla JS frontend with a highly advanced Node.js/MongoDB backend, this project demonstrates full-stack mastery, system architecture design, and a deep understanding of modern web aesthetics.
