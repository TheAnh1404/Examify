# Examify - SaaS Examination Management Platform

Examify is an enterprise-grade SaaS online multiple-choice examination management platform. It supports three core roles: **System Administrators**, **Teachers (Instructors)**, and **Students**, providing a complete lifecycle for exam creation, proctoring, and grading.

## Project Overview

*   **Purpose:** To provide a secure and efficient platform for managing online examinations with proctoring features.
*   **Architecture:** Monolith-style codebase with a clear separation between a React frontend and an Express.js backend. The backend utilizes a repository pattern for database abstraction.
*   **Key Tech Stack:**
    *   **Frontend:** React 19, Vite, Tailwind CSS v3, React Router v7, Axios, Lucide React icons.
    *   **Backend:** Node.js (ES Modules), Express.js, JWT Authentication, bcryptjs.
    *   **Database:** Currently uses an in-memory repository structure (mock DB) in the backend, designed to be database-agnostic.

## Getting Started

### Prerequisites
*   Node.js (LTS version recommended)
*   npm

### Building and Running

The project consists of two separate applications that need to be run concurrently.

#### 1. Backend REST API
```bash
cd backend
npm install
npm run dev
```
*   **Port:** 5000 (http://localhost:5000)
*   **API Base Path:** `/api`

#### 2. Frontend React Client
```bash
cd frontend
npm install
npm run dev
```
*   **Port:** Default Vite port (usually http://localhost:5173)

### Key Commands
*   **Backend:**
    *   `npm start`: Runs the server using `node`.
    *   `npm run dev`: Runs the server using `nodemon` for auto-restarts.
*   **Frontend:**
    *   `npm run dev`: Starts the Vite development server.
    *   `npm run build`: Builds the application for production.
    *   `npm run lint`: Runs ESLint for code quality checks.

## Development Conventions

### Backend
*   **Modular Architecture:** Logic is split into `routes`, `controllers`, `middlewares`, and `repositories`.
*   **Repository Pattern:** All data access goes through repository classes (e.g., `UserRepository.js`) found in `backend/src/repositories/`. This abstracts the "in-memory" database and makes it easy to swap for a real database like PostgreSQL or MongoDB.
*   **Authentication:** JWT-based authentication. Use the `auth.middleware.js` to protect routes and `role.middleware.js` for RBAC (Role-Based Access Control).
*   **Standardized Responses:** Use consistent JSON structures for API responses and error handling.

### Frontend
*   **Component Organization:** 
    *   `src/components/common/`: Reusable UI primitives (Buttons, Inputs, Modals, etc.).
    *   `src/components/layout/`: Structural components (Sidebar, Topbar, DashboardLayout).
*   **State Management:** Uses React Context (`AuthContext.jsx`) for global authentication state.
*   **API Service Layer:** All API calls should be routed through the Axios instance in `src/services/api.js`.
*   **Styling:** Utility-first styling with Tailwind CSS. Follow the design tokens and custom configurations in `tailwind.config.js`.

## Key Features & Security
*   **Role-Based Access Control (RBAC):** Distinct dashboards and features for Admin, Teacher, and Student roles.
*   **Browser Proctoring:** Tab-focus loss tracking during exams to discourage cheating.
*   **Anti-Cheat Measures:** The backend scrubs correct answers (`correctOption`) from exam payloads sent to students. Grading is performed strictly server-side.
*   **Immersive Exam UI:** Includes a countdown timer and automatic submission on timeout.

## Demo Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@examify.com` | `admin123` |
| **Teacher** | `teacher@examify.com` | `teacher123` |
| **Student** | `student@examify.com` | `student123` |
