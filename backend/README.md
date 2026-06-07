# Examify Backend API

This is the RESTful API for the Examify platform, built with Node.js, Express.js, and PostgreSQL using Prisma ORM.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (JSON Web Tokens) & bcryptjs
- **Validation:** Manual validation (Prisma handles schema integrity)

## Getting Started

### 1. Prerequisites

- Node.js (v18+)
- PostgreSQL database

### 2. Installation

```bash
cd backend
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and fill in your details:

```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secure random string.
- `CLIENT_URL`: The URL of your frontend (default: http://localhost:5173).

### 4. Database Setup

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npx prisma generate
```

### 5. Seed Data

Populate the database with default accounts and sample data:

```bash
npm run seed
```

### 6. Run the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:5000/api`.

## Default Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@examify.com` | `123456` |
| **Teacher** | `teacher@examify.com` | `123456` |
| **Student** | `student@examify.com` | `123456` |

## API Overview

- `POST /api/auth/login`: User login
- `GET /api/users`: User management (Admin)
- `GET /api/subjects`: Subject management
- `GET /api/questions`: Question bank (Teacher/Admin)
- `GET /api/exams`: Exam management
- `POST /api/exam-attempts/start`: Start an exam (Student)
- `GET /api/dashboard/admin`: Admin statistics
