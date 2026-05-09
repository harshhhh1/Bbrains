# 👨‍💻 Developer Guide

Welcome to the Bbrains Developer Guide! This document provides an in-depth look at our architecture, environment setup, database practices, and contribution workflows. Whether you are fixing a bug or adding a new feature, this guide has everything you need.

## 📑 Table of Contents

1. [Environment Variables](#environment-variables)
2. [Architecture & Folder Structure](#architecture--folder-structure)
3. [Database & Prisma Practices](#database--prisma-practices)
4. [Local Development Workflow](#local-development-workflow)
5. [Testing Guidelines](#testing-guidelines)
6. [Contribution Guidelines](#contribution-guidelines)

---

## 🔐 Environment Variables

To run the backend locally, you will need to create a `.env` file in the `server/` directory.

| Variable | Description | Example / Dummy Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for the PostgreSQL database. | `postgresql://user:password@localhost:5432/bbrains` |
| `PG_POOL_MAX` | Maximum number of connections in the PostgreSQL pool. | `10` |
| `JWT_SECRET` | Secret key used to sign JSON Web Tokens. | `my_super_secret_jwt_key_123!` |
| `PORT` | The port the Express server will run on. | `3000` |
| `CLIENT_URL` | The URL of the frontend application (for strict CORS validation). | `http://localhost:3000` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID for payments. | `rzp_test_123` |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key. | `your_razorpay_secret` |
| `SUPABASE_URL` | Supabase URL for realtime channels and auth sync. | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase Service Role Key. | `your_supabase_service_key` |

---

## 🏛️ Architecture & Folder Structure

Bbrains follows a **Modular Monolith** architecture for the backend and a component-driven approach on the frontend.

### Backend Layout (`server/`)
Features are grouped logically into modules to encapsulate concerns.
```text
📁 server/
├── 📁 prisma/           # schema.prisma, migrations folder, and seed.ts
├── 📁 src/
│   ├── 📁 middleware/   # Shared middleware (auth.middleware.js, errorHandler.js)
│   ├── 📁 modules/      # Feature-specific code (e.g., /auth, /market, /academic)
│   │   └── 📁 market/
│   │       ├── market.routes.js       # Express Router
│   │       ├── market.controller.js   # Request parsing, Zod validation, HTTP responses
│   │       └── market.service.js      # Core business logic, Prisma transactions
│   ├── 📁 utils/        # Pure, stateless utilities (response.js, prisma-errors.js)
│   ├── 📁 tests/        # Node.js built-in test suite
│   └── server.js        # Express application entry point (CORS, Socket.io initialization)
```

### Frontend Layout (`client/`)
```text
📁 client/
├── 📁 app/              # Next.js App Router (pages, layouts, route groups)
├── 📁 components/       # Shared UI components (Radix primitives, standard cards)
├── 📁 features/         # Feature-specific complex components (e.g., PremiumAssignment)
├── 📁 services/api/     # Axios API service definitions
└── 📁 lib/              # Shared types (`api.ts`), constants, and utilities
```

---

## 💾 Database & Prisma Practices

Bbrains relies heavily on **Prisma** and **PostgreSQL**. We adhere to the following best practices:

1. **Avoid N+1 Queries**:
   - When updating distinct entities (e.g., stock decrements), aggregate quantities by unique identifier and use `Promise.all`.
   - When checking statuses in loops, batch-fetch records using the `in` operator and use a `Set` or `Map` for O(1) lookups.
2. **Bulk Insertions**:
   - Utilize Prisma 7.6.0's `createMany` with `onConflict` clauses where applicable (e.g., `createNotifications` in `notification.service.js`).
3. **Raw SQL Security**:
   - Strictly avoid `prisma.$queryRawUnsafe`.
   - Use `prisma.$queryRaw` with tagged template literals for automatic parameterization. Use `Prisma.sql` for conditional query fragments.
4. **Transactions**:
   - Critical workflows (like marketplace checkout or wallet transfers) must run inside Prisma transactions to ensure data consistency.

---

## 💻 Local Development Workflow

1. **Install Dependencies**
   Navigate to the `server` directory and run:
   ```bash
   npm install
   ```
2. **Set Up the Database**
   Ensure PostgreSQL is running. Run Prisma migrations to construct the tables, and then run the seed script:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```
   *(Note: The `db:seed` script executes `tsx ./prisma/seed.ts`)*
3. **Start the Express Server**
   Start the application in development mode (using nodemon).
   ```bash
   npm run dev &
   ```

---

## 🧪 Testing Guidelines

We utilize Node.js's built-in `node:test` and `node:assert` modules.
- **Location**: Tests are organized in `server/src/tests/`.
- **Execution**: Run tests directly via node:
  ```bash
  node --test server/src/tests/
  ```
- **Testing Logic**: Isolate pure logic into separate utility files (e.g., `*.util.js`) to allow unit testing without triggering Prisma or third-party SDK side-effects.

---

## 🤝 Contribution Guidelines

### Branch Naming Conventions
- `feature/` - New features (e.g., `feature/gamification-badges`)
- `fix/` - Bug fixes (e.g., `fix/login-crash`)
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks

### PR Formats
Please format your PR titles and descriptions according to the type of work:

- **Security Fixes**:
  - Title: `🔒 [security fix description]`
  - Body must include: `🎯 What`, `⚠️ Risk`, `🛡️ Solution`
- **Performance Optimizations**:
  - Title: `⚡ [description]`
  - Body must include: `💡 What`, `🎯 Why`, `📊 Measured Improvement`
- **Testing Improvements**:
  - Title: `🧪 [testing improvement description]`
  - Body must include: `🎯 What`, `📊 Coverage`, `✨ Result`
- **Code Health**:
  - Title: `🧹 [code health improvement description]`
  - Body must include: `🎯 What`, `💡 Why`, `✅ Verification`, `✨ Result`

### Commits
We follow the conventional commits format:
```text
<type>(<scope>): <short description>
```
Example: `feat(auth): integrate supabase token validation`
