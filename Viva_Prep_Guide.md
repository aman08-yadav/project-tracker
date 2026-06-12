# ProjectHub — Viva Preparation Guide

This guide breaks down everything you need to know about your backend in simple terms, plus the exact questions your teacher is likely to ask and how to answer them confidently.

---

## 🧠 Part 1: How Your Backend Works (Simple Explanation)

Your backend follows the **MERN stack** architecture (MongoDB, Express, React/Vanilla JS, Node.js), but using pure HTML/JS for the frontend. It is built using the **MVC Pattern** (Model-View-Controller).

### 1. The Core Technologies Used:
* **Node.js & Express:** The engine that runs your server. Express handles the API routes (e.g., when the frontend asks for `/api/v1/projects`).
* **MongoDB Atlas & Mongoose:** The database. It is hosted in the cloud (Atlas). Mongoose is the tool used to define the structure of your data (Models like `User`, `Project`, `Task`).
* **JSON Web Tokens (JWT):** The security system. When a user logs in, the server gives them a token. The frontend sends this token with every request to prove who the user is.
* **Socket.IO:** The real-time engine. It keeps a constant, open connection between the browser and the server so chat messages appear instantly without refreshing the page.
* **Multer:** The file-handling tool. When a student uploads a file, Multer catches it, saves it to the `/uploads` folder on the server, and saves the file's metadata to MongoDB.

### 2. How the Files are Organized:
* `models/` - Defines the shape of the data (e.g., a Task must have a title, status, and assigned user).
* `controllers/` - The actual logic. (e.g., `taskController.js` has the code to create a task, update a task, or delete it).
* `routes/` - The URLs. This connects a URL (like `/tasks`) to the correct Controller logic.
* `middleware/` - The "bouncers" at the door. `authMiddleware.js` checks if a user is logged in before letting them access data. `roleMiddleware.js` checks if the user is a `faculty` member before letting them delete a project.

---

## 🎯 Part 2: Top Viva Questions & Answers

Here are the hardest questions a teacher might ask, and exactly how you should answer them.

> [!IMPORTANT]
> **Q1. "What happens to the data if the Render server restarts? Is it saved in memory?"**
> **Answer:** "No, the data is completely persistent. The backend connects directly to **MongoDB Atlas**, which is a separate cloud database. Even if the Render server sleeps or restarts, the data is safe in Atlas."

> [!IMPORTANT]
> **Q2. "How did you implement Authentication and Security?"**
> **Answer:** "I used **JWT (JSON Web Tokens)**. When a user logs in, the backend generates a token using a secret key and sends it to the frontend, which stores it in `localStorage`. Every API request sends this token in the Authorization header. On the backend, my `authMiddleware` verifies the token before allowing access to the database."

> [!TIP]
> **Q3. "How does the Leaderboard calculate scores?"**
> **Answer:** "The leaderboard uses a custom algorithm on the backend. It doesn't just trust user input. It fetches the total number of tasks marked 'completed' by a student (worth 10 points each) and the total number of files that a Faculty member has 'approved' (worth 5 points each). It adds these together dynamically."

> [!TIP]
> **Q4. "Explain how the real-time chat works."**
> **Answer:** "I used **Socket.IO** for event-driven, real-time communication. When a user opens a project, the frontend emits a `join:project` event. The backend puts them into a specific 'room' just for that project. When someone sends a message, it is saved to MongoDB first, and then broadcasted only to the users in that specific room."

> [!NOTE]
> **Q5. "How do you handle file uploads?"**
> **Answer:** "I used an npm package called **Multer**. When a file is uploaded, Multer intercepts the multipart form data, saves the physical file to the server's `uploads/` directory, and then the controller saves the file's metadata (original name, size, uploader ID) to MongoDB. The frontend can then download the file via a static route."

> [!CAUTION]
> **Q6. "How did you prevent students from changing things they shouldn't?"**
> **Answer:** "I implemented **Role-Based Access Control (RBAC)**. On the backend, there is a `roleMiddleware` that protects specific routes. For example, only a user with the `faculty` role can create projects, delete tasks, or approve files. If a student tries to send a DELETE request, the backend will block it with a 403 Forbidden error, even if they somehow modified the frontend."

> [!CAUTION]
> **Q7. "Did you implement any form validation or security against XSS?"**
> **Answer:** "Yes, on the frontend I used `maxlength` and `required` attributes to prevent massive data dumps. For security, specifically in the chat, I wrote an `escapeHtml` function that sanitizes user input. It converts characters like `<` and `>` into safe HTML entities so malicious scripts cannot be injected into the chat."

> [!NOTE]
> **Q8. "What is the hardest bug you faced and how did you solve it?"**
> **Answer:** "Managing the **Faculty Approval Workflow** was tricky. Initially, any uploaded file counted towards a student's score. I had to refactor the database schema to add a `status` field to files (pending, approved, rejected), build a custom review route for faculty, and update the leaderboard logic to only count files with an 'approved' status."
