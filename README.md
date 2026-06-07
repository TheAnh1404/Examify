# Examify — SaaS Examination Management Platform

Examify is an enterprise-grade SaaS online multiple-choice examination management platform supporting three core roles: **System Administrators**, **Teachers (Instructors)**, and **Students**.

---

## Workspace Structure

```
examify/
├── backend/            # Express.js REST API with in-memory SQLite-ready repositories
└── frontend/           # React + Vite client styled with custom Tailwind CSS v3 tokens
```

---

## Pre-seeded Credentials (Quick Sign-in)

For ease of testing and evaluation, the database is pre-populated with the following user accounts. Select them from the **"Demo Quick-Fill Credentials"** box on the login screen to instantly load the dashboard:

| Role | Email | Password | Features / Clearance |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@examify.com` | `admin123` | Global user CRUD, system aggregates, database stats |
| **Teacher / Instructor** | `teacher@examify.com` | `teacher123` | Build exams, edit questions, gradebook analytics, proctor logs |
| **Student** | `student@examify.com` | `student123` | Take tests, visual proctor timer, review scoring keys |

---

## Key Tech Features

1. **Database-Agnostic Repositories**: The backend uses an in-memory repository structure (`UserRepository`, `ExamRepository`, `SubmissionRepository`). If you switch to PostgreSQL, only these repository files need query updates; all controller routers remain identical.
2. **Proctored Browser Proctoring**: The student exam takers include tab-focus loss tracking. Toggling away from the exam tab fires warnings and increments proctor logs, which are visible to teachers in the gradebook.
3. **Immersive Countdown Timer**: The student exam environment has an interactive clock that alerts students when time is running short and automatically submits current answers if the clock hits `00:00`.
4. **Anti-Cheat Payload Scrubbing**: If a student requests exam details before starting, the backend scrubs all `correctOption` indexes from the API response so answers cannot be inspected in DevTools. Grading occurs strictly server-side.

---

## Running the Application

Ensure you have [Node.js](https://nodejs.org/) installed.

### 1. Launch the Backend REST API
Open a terminal in the root workspace, navigate to `/backend`, install dependencies, and start the development server:
```bash
cd backend
npm install
npm run dev
```
*The server will start listening on port `5000` (http://localhost:5000).*

### 2. Launch the Frontend React Client
Open a second terminal, navigate to `/frontend`, install dependencies, and start the Vite server:
```bash
cd frontend
npm install
npm run dev
```
*Vite will start the client, usually on http://localhost:5173.*
