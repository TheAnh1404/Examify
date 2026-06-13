# Repository Guidelines

## Project Structure & Module Organization

Examify is split into two JavaScript applications. `frontend/` contains the React 19 + Vite client; organize UI by role under `src/pages/{admin,teacher,student}`, reusable UI under `src/components`, API calls under `src/services`, and static assets under `public/`. `backend/` contains the Express API. Requests flow through `src/routes` to `src/controllers`, then `src/services` and `src/repositories`; shared middleware, configuration, and utilities have dedicated folders. PostgreSQL models, migrations, and seed data live in `backend/prisma/`. Root-level `cli.js` provides developer diagnostics, while `postman/` stores API workspace resources.

## Build, Test, and Development Commands

Install dependencies separately with `npm install --prefix backend` and `npm install --prefix frontend`.

- `npm run dev:backend`: start the API with nodemon on port 5000.
- `npm run dev:frontend`: start the Vite client, normally on port 5173.
- `npm --prefix frontend run lint`: run ESLint across frontend JS/JSX.
- `npm --prefix frontend run build`: create a production frontend build.
- `npm --prefix backend run prisma:migrate`: apply development migrations.
- `npm --prefix backend run prisma:generate`: regenerate Prisma Client.
- `npm --prefix backend run seed`: load demo data.
- `npm run cli -- status`: check API health and active ports.

## Coding Style & Naming Conventions

Use ES modules, single quotes, and two-space indentation. Follow the surrounding file's semicolon style and keep imports grouped near the top. React components and page files use PascalCase (`QuestionBank.jsx`); variables and functions use camelCase. Backend layer files use lowercase domain names with descriptive suffixes, such as `auth.controller.js` and `exam.routes.js`. Keep controllers thin and place business rules in services.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. Before submitting, run frontend lint and build, verify `GET /api/health`, and manually exercise affected admin, teacher, or student flows. When adding tests, use `*.test.js` or `*.test.jsx`, colocate them with the covered module, and add the corresponding npm test script.

## Commit & Pull Request Guidelines

History uses short, action-oriented commit subjects. Prefer specific imperative messages such as `auth: validate reset tokens` over vague summaries. Pull requests should describe behavior changes, list verification commands, identify new environment variables or Prisma migrations, link relevant issues, and include screenshots for UI changes.

## Security & Configuration

Copy `backend/.env.example` to `backend/.env`; never commit secrets or production database URLs. Replace the development JWT fallback in production. Commit Prisma migration files whenever the schema changes.
