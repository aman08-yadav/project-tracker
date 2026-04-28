# 🎙️ ProjectHub: Final Presentation Script

**Tip:** Keep this document open on your phone or a secondary screen while you present. 

---

## Slide/Step 1: Introduction & The Problem
**🎯 What to do on screen:** 
Have your project open on the main landing page or login screen. Don't click anything yet.

**🗣️ What to say:**
> "Good morning/afternoon everyone. Today, I am excited to present my project: **ProjectHub - A Team Contribution Tracking System**."
> 
> "In almost every academic or professional group project, evaluating individual contributions is a big challenge. Often, one or two people do most of the work, but everyone in the group gets the same grade. Faculty members lack a transparent way to see who actually contributed."
> 
> "ProjectHub solves this problem. It is a full-stack workspace where students manage tasks and chat, while the system silently monitors their actions in the background to calculate a fair, automated 'Contribution Score'."

---

## Step 2: Architecture & Tech Stack Overview
**🎯 What to do on screen:** 
Briefly show the `README.md` file or a slide showing the tech stack (MongoDB, Node.js, PostgreSQL). 

**🗣️ What to say:**
> "Before diving into the demo, I want to briefly highlight the architecture. I built this completely without heavy frontend frameworks like React to demonstrate a deep understanding of core Vanilla JavaScript and CSS."
>
> "The most unique part of this application is its **Dual-Database Architecture**. I used **MongoDB** for operational data like chat messages and user profiles. However, for the analytics and the contribution leaderboard, I integrated **PostgreSQL via Prisma ORM**. Relational databases are mathematically robust, making my contribution calculations highly accurate and fast."

---

## Step 3: Authentication & Role-Based Access Control
**🎯 What to do on screen:** 
Go back to the browser. Show the Login/Signup page. Log in using a **Student** account.

**🗣️ What to say:**
> "Let's look at the live application. Security and access control are critical here. The system uses secure JWT (JSON Web Tokens) for authentication."
> 
> "We have Role-Based Access Control. This means Students and Faculty see completely different interfaces. Right now, I will log in as a Student. Notice how my dashboard is tailored specifically to the projects I am actively working on."

---

## Step 4: The Kanban Board (Task Management)
**🎯 What to do on screen:** 
Click on one of the active projects to enter the project workspace. Go to the **Tasks** tab. Drag a task from "Pending" to "Completed", or click to complete it.

**🗣️ What to say:**
> "Once inside a project, students have access to an interactive Kanban Board. Here, we can create tasks and track our progress."
> 
> "Watch as I move this task from 'Pending' to 'Completed'. What you don't see is that the backend just logged this action. The server is communicating with our PostgreSQL database to increment my personal 'Tasks Completed' tally. This data will be used later for grading."

---

## Step 5: Real-Time WebSockets Chat
**🎯 What to do on screen:** 
Navigate to the **Chat** tab within the project. Type a message like *"Hey team, I just finished the database schema."* and hit send. 

**🗣️ What to say:**
> "Communication is key in any project. Instead of making students use WhatsApp or Slack, I built a custom Real-Time Chat using **Socket.IO**."
> 
> "When I send a message, it broadcasts instantly to my teammates. Socket.IO places us in isolated 'Rooms', meaning messages sent here are strictly private to this specific project team. And just like completing tasks, active participation in the chat positively impacts the student's final contribution score."

---

## Step 6: File Management
**🎯 What to do on screen:** 
Navigate to the **Files** tab. Upload a sample document or image to the project.

**🗣️ What to say:**
> "Students can also share resources directly on the platform. I implemented secure file uploads. The backend uses strict MIME-type validation to ensure nobody can upload malicious scripts. Sharing helpful resources also adds points to the contribution score."

---

## Step 7: The Faculty View & Leaderboard (The Climax)
**🎯 What to do on screen:** 
Log out of the student account. **Log in using a Faculty/Teacher account.** Navigate to the Leaderboard or Analytics section for that same project.

**🗣️ What to say:**
> "Now for the most important feature. I will log out and log back in as a Faculty member."
> 
> "As a teacher, I don't want to sift through hundreds of chat messages or tasks. I just want to know who did the work. Here is the **Automated Leaderboard**."
> 
> "The backend dynamically calculates scores using a weighted mathematical formula. For example, finishing a task is worth 10 points, uploading a file is worth 5 points, and chatting is worth 1 point. Because my previous student account just completed a task and sent a message, you can see their score has instantly updated at the top of the leaderboard!"

---

## Step 8: Conclusion
**🎯 What to do on screen:** 
Leave the screen on the Leaderboard or return to the main dashboard.

**🗣️ What to say:**
> "In conclusion, ProjectHub bridges the gap between collaborative student work and objective academic grading. By leveraging Vanilla JavaScript on the frontend and an advanced Dual-Database Node.js backend, I was able to build a secure, real-time, and highly functional platform."
> 
> "This concludes my presentation. I would be happy to answer any questions about the code, the database architecture, or the WebSocket implementation. Thank you!"
