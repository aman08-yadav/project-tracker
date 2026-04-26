🚀 ProjectHub
Team Contribution Tracking System

A Full-Stack Web Application developed for transparent, real-time collaboration and automated academic evaluation.


Node.js Express.js MongoDB PostgreSQL Socket.io

📖 About The Project
In academic and professional group projects, evaluating individual contributions is traditionally subjective and opaque. Often, a minority of students perform the majority of the work, yet all group members receive identical evaluations.

ProjectHub solves this by providing a unified workspace where students manage tasks, upload files, and chat in real-time. Crucially, the system silently monitors every action—task completions, file uploads, and chat activity—and calculates an automated Contribution Score. This provides faculty with a transparent, data-driven "Leaderboard" to grade students fairly based on empirical data.

✨ Core Features
🔐 Multi-Provider Authentication: Secure login via local Email/Password (JWT), Google OAuth 2.0, and GitHub OAuth.
👥 Role-Based Access Control (RBAC): Distinct interfaces and permissions for student and faculty roles.
📋 Interactive Kanban Board: Drag-and-drop or click-based task tracking (Pending ➡️ In-Progress ➡️ Completed).
💬 Real-Time Project Rooms: Live WebSockets chat with typing indicators and online status tracking.
📁 Centralized File Management: Secure drag-and-drop file uploads tracked per project.
🏆 Automated Analytics & Leaderboard: Real-time ranking of students based on calculated contribution metrics.
🛠️ Technology Stack & Architecture
This project was built without heavy frontend frameworks like React or Angular to demonstrate a deep understanding of core web technologies, while the backend leverages a cutting-edge dual-database architecture.

Frontend
HTML5 & Vanilla CSS3: Modern "Dark Glassmorphism" aesthetic with responsive grid/flexbox layouts.
Vanilla JavaScript (ES6 Modules): Highly modular client-side logic utilizing async/await, dynamic DOM manipulation, and native fetch API.
Backend
Node.js & Express.js: Robust server environment and RESTful API routing.
Socket.IO: Bidirectional WebSocket connections for real-time chat and UI updates.
Passport.js: Handling Google and GitHub OAuth 2.0 strategies.
Dual-Database Architecture
MongoDB (via Mongoose): Primary operational database. Ideal for unstructured and rapidly changing data like Chat Messages, User Profiles, and Tasks.
PostgreSQL (via Prisma ORM): Analytics Engine. Relational DB used for numerical aggregations, ensuring the Leaderboard and Contribution calculations are mathematically robust. (Utilizes @neondatabase/serverless WebSockets to bypass firewalls).
📂 Project Structure
project-tracker/
├── client/          # Frontend assets (HTML, CSS, Vanilla JS)
├── server/          # Node.js backend logic
│   ├── config/      # Database connection logic
│   ├── controllers/ # Business logic (Tasks, Analytics)
│   ├── middleware/  # Security (JWT, Role checking)
│   ├── models/      # MongoDB Schemas
│   ├── prisma/      # PostgreSQL Schema
│   ├── routes/      # API routing
│   ├── sockets/     # Socket.IO room management
│   └── server.js    # Entry point
└── start-live-server.bat # Quick start script
🚀 Getting Started
Follow these steps to set up the project locally.

Prerequisites
Node.js (v16+)
MongoDB (Local or Atlas)
PostgreSQL (or Neon Database)
Installation
Clone the repository
git clone https://github.com/yourusername/project-tracker.git
cd project-tracker
Install Server Dependencies
cd server
npm install
Configure Environment Variables
Create a .env file in the server directory and add the following:
PORT=5000
MONGO_URI=your_mongodb_connection_string
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret

# OAuth Credentials (Optional but recommended)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
Initialize Prisma (PostgreSQL)
cd server
npx prisma generate
npx prisma db push
Start the Application
You can either run the server manually:
cd server
npm run dev

Or use the provided batch script from the root directory:
./start-live-server.bat
💡 How It Works (The Contribution Formula)
The core of the academic evaluation relies on the PostgreSQL analytics engine. When a faculty member views the Leaderboard, the backend dynamically calculates scores using weighted metrics:

const contributionScore = Math.round(
  (analytics.tasksCompleted * 10) +  🚀 ProjectHub
Team Contribution Tracking System

A Full-Stack Web Application developed for transparent, real-time collaboration and automated academic evaluation.


Node.js Express.js MongoDB PostgreSQL Socket.io

📖 About The Project
In academic and professional group projects, evaluating individual contributions is traditionally subjective and opaque. Often, a minority of students perform the majority of the work, yet all group members receive identical evaluations.

ProjectHub solves this by providing a unified workspace where students manage tasks, upload files, and chat in real-time. Crucially, the system silently monitors every action—task completions, file uploads, and chat activity—and calculates an automated Contribution Score. This provides faculty with a transparent, data-driven "Leaderboard" to grade students fairly based on empirical data.

✨ Core Features
🔐 Multi-Provider Authentication: Secure login via local Email/Password (JWT), Google OAuth 2.0, and GitHub OAuth.
👥 Role-Based Access Control (RBAC): Distinct interfaces and permissions for student and faculty roles.
📋 Interactive Kanban Board: Drag-and-drop or click-based task tracking (Pending ➡️ In-Progress ➡️ Completed).
💬 Real-Time Project Rooms: Live WebSockets chat with typing indicators and online status tracking.
📁 Centralized File Management: Secure drag-and-drop file uploads tracked per project.
🏆 Automated Analytics & Leaderboard: Real-time ranking of students based on calculated contribution metrics.
🛠️ Technology Stack & Architecture
This project was built without heavy frontend frameworks like React or Angular to demonstrate a deep understanding of core web technologies, while the backend leverages a cutting-edge dual-database architecture.

Frontend
HTML5 & Vanilla CSS3: Modern "Dark Glassmorphism" aesthetic with responsive grid/flexbox layouts.
Vanilla JavaScript (ES6 Modules): Highly modular client-side logic utilizing async/await, dynamic DOM manipulation, and native fetch API.
Backend
Node.js & Express.js: Robust server environment and RESTful API routing.
Socket.IO: Bidirectional WebSocket connections for real-time chat and UI updates.
Passport.js: Handling Google and GitHub OAuth 2.0 strategies.
Dual-Database Architecture
MongoDB (via Mongoose): Primary operational database. Ideal for unstructured and rapidly changing data like Chat Messages, User Profiles, and Tasks.
PostgreSQL (via Prisma ORM): Analytics Engine. Relational DB used for numerical aggregations, ensuring the Leaderboard and Contribution calculations are mathematically robust. (Utilizes @neondatabase/serverless WebSockets to bypass firewalls).
📂 Project Structure
project-tracker/
├── client/          # Frontend assets (HTML, CSS, Vanilla JS)
├── server/          # Node.js backend logic
│   ├── config/      # Database connection logic
│   ├── controllers/ # Business logic (Tasks, Analytics)
│   ├── middleware/  # Security (JWT, Role checking)
│   ├── models/      # MongoDB Schemas
│   ├── prisma/      # PostgreSQL Schema
│   ├── routes/      # API routing
│   ├── sockets/     # Socket.IO room management
│   └── server.js    # Entry point
└── start-live-server.bat # Quick start script
🚀 Getting Started
Follow these steps to set up the project locally.

Prerequisites
Node.js (v16+)
MongoDB (Local or Atlas)
PostgreSQL (or Neon Database)
Installation
Clone the repository
git clone https://github.com/aman08-yadav/project-tracker.git
cd project-tracker
Install Server Dependencies
cd server
npm install
Configure Environment Variables
Create a .env file in the server directory and add the following:
PORT=5000
MONGO_URI=your_mongodb_connection_string
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret

# OAuth Credentials (Optional but recommended)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
Initialize Prisma (PostgreSQL)
cd server
npx prisma generate
npx prisma db push
Start the Application
You can either run the server manually:
cd server
npm run dev

Or use the provided batch script from the root directory:
./start-live-server.bat
💡 How It Works (The Contribution Formula)
The core of the academic evaluation relies on the PostgreSQL analytics engine. When a faculty member views the Leaderboard, the backend dynamically calculates scores using weighted metrics:

const contributionScore = Math.round(
  (analytics.tasksCompleted * 10) +  // High weight for finishing work
  (analytics.uploadsCount * 5) +     // Medium weight for sharing resources
  (analytics.activityCount * 1)      // Low weight for general chat/activity
);
🔒 Security Measures
Stateless JWT Auth: High scalability without server-side session memory.
Bcrypt Hashing: Secure password storage in MongoDB.
Network Resilience: Neon Serverless HTTP/WS adapters bypass academic firewall restrictions.
MIME Validation: Strict filtering on uploaded files to prevent malicious scripts.
📄 License
This project is open-source and available under the MIT License.
  (analytics.uploadsCount * 5) +     // Medium weight for sharing resources
  (analytics.activityCount * 1)      // Low weight for general chat/activity
);
🔒 Security Measures
Stateless JWT Auth: High scalability without server-side session memory.
Bcrypt Hashing: Secure password storage in MongoDB.
Network Resilience: Neon Serverless HTTP/WS adapters bypass academic firewall restrictions.
MIME Validation: Strict filtering on uploaded files to prevent malicious scripts.
📄 License
This project is open-source and available under the MIT License.
