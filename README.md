# Local Services Marketplace

A full-stack web platform that connects customers with local service providers in Kosovo — plumbers, electricians, tutors, cleaners, and more. Customers can browse services, create bookings, and leave reviews. Providers can manage their listings and respond to bookings. Admins have full platform oversight.

---

## Table of Contents

1. [Project Description](#1-project-description)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Getting Started](#4-getting-started)
   - [Prerequisites](#41-prerequisites)
   - [Environment Variables](#42-environment-variables)
   - [Database Setup](#43-database-setup)
   - [Running the Backend](#44-running-the-backend)
   - [Running the Frontend](#45-running-the-frontend)
   - [Running Tests](#46-running-tests)
5. [API Reference](#5-api-reference)
6. [Project Structure](#6-project-structure)
7. [Design Principles](#7-design-principles)
8. [Author](#8-author)

---

## 1. Project Description

**Local Services Marketplace** is a digital platform that increases transparency and reliability in the local services market.

**Core features:**
- Role-based access: **Customer**, **Provider**, **Admin**
- JWT authentication with bcrypt password hashing
- Full CRUD for service listings with category and location filtering
- Booking lifecycle: `pending → confirmed → completed / cancelled`
- Review and rating system
- Dual persistence mode: PostgreSQL database (default) or CSV files

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Backend | Node.js + Express 5 |
| Database | **PostgreSQL** (fully integrated) |
| Authentication | JWT (jsonwebtoken) + bcrypt |
| ORM / Query layer | `pg` (node-postgres) — raw parameterised queries |
| Testing | Jest |
| Version Control | Git + GitHub |
| Documentation | Markdown |

---

## 3. Architecture

The backend uses a **Layered Architecture** with strict separation of concerns:

```
Routes → Controllers → Services → Repositories → Database
```

| Layer | Responsibility |
|---|---|
| **Routes** | Declare API endpoints and apply middleware |
| **Controllers** | Parse HTTP requests, call service methods, send responses |
| **Services** | Business logic and validation (no HTTP awareness) |
| **Repositories** | Data access — all SQL lives here |
| **Models** | Plain data objects (no logic) |
| **Middleware** | JWT verification, role guards, error handling |

The **Repository Pattern** (`IRepository` interface + concrete implementations) allows the entire backend to switch between PostgreSQL and CSV storage by changing a single environment variable (`USE_DB=true/false`). Services never import database libraries directly.

---

## 4. Getting Started

### 4.1 Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v14 or higher, running locally
- `npm` (comes with Node.js)
- Git

### 4.2 Environment Variables

Create a file called `.env` inside the `backend/` directory. You can copy `.env.example` as a starting point:

```bash
cp backend/.env.example backend/.env
```

Then fill in your values:

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the Express server listens on |
| `DB_HOST` | Yes | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | Yes | — | Name of your PostgreSQL database (e.g. `local_services_marketplace`) |
| `DB_USER` | Yes | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | Yes | — | PostgreSQL password for the above user |
| `JWT_SECRET` | **Yes** | — | Long random secret used to sign JWTs. **Never commit this.** |
| `USE_DB` | No | `false` | Set to `true` to use PostgreSQL; `false` to use CSV files |

> **Security note:** `.env` is listed in `.gitignore` and will never be committed to Git.
> **Never share or commit your real `DB_PASSWORD` or `JWT_SECRET`.**
> The values below are illustrative placeholders only — replace every one of them.

Example `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=local_services_marketplace
DB_USER=postgres
DB_PASSWORD=YOUR_REAL_POSTGRES_PASSWORD_HERE
JWT_SECRET=replace-this-with-a-long-random-secret-at-least-32-chars
USE_DB=true
```

### 4.3 Database Setup

1. **Create the database** in PostgreSQL:
   ```sql
   CREATE DATABASE local_services_marketplace;
   ```

2. **Apply the schema** (creates all tables, indexes, and foreign key constraints):
   ```bash
   cd backend
   npm run db:schema
   ```

3. **Verify** the tables were created:
   ```bash
   npm run db:check
   ```
   You should see: `users`, `services`, `bookings`, `reviews`, `categories`, `payments`, and more.

4. **Quick connection smoke test**:
   ```bash
   npm run db:test
   ```

### 4.4 Running the Backend

```bash
cd backend
npm install
node server.js
```

The API will be available at: **http://localhost:5000**

### 4.5 Running the Frontend

```bash
cd frontend
npm install
npm start
```

The React app will open at: **http://localhost:3000**

### 4.6 Running Tests

```bash
cd backend
npm test
```

This runs Jest in verbose mode across all files in `backend/tests/`. Tests use in-memory repository stubs — no database connection is required.

---

## 5. API Reference

All authenticated routes require the header:
```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register as customer or provider |
| `POST` | `/api/auth/login` | No | Login, returns JWT token |

### Services

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/services` | No | List all services (supports `?category=&location=` filters) |
| `GET` | `/api/services/:id` | No | Get a single service by ID |
| `POST` | `/api/services` | Yes (provider) | Create a new service listing |
| `PUT` | `/api/services/:id` | Yes (provider/admin) | Update a service |
| `DELETE` | `/api/services/:id` | Yes (provider/admin) | Delete a service |

### Bookings

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | Yes | Get bookings (filtered by role automatically) |
| `POST` | `/api/bookings` | Yes (customer) | Create a booking |
| `PATCH` | `/api/bookings/:id/status` | Yes (provider/admin) | Update booking status |
| `DELETE` | `/api/bookings/:id` | Yes | Cancel / delete a booking |

**Valid booking statuses:** `pending` → `confirmed` → `completed` or `cancelled`

### Reviews

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/reviews` | No | Get all reviews |
| `POST` | `/api/reviews` | Yes (customer) | Submit a review (rating 1–5) |
| `DELETE` | `/api/reviews/:id` | Yes (admin) | Remove a review |

### Users

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/users` | Yes (admin) | List all users |
| `GET` | `/api/users/:id` | Yes | Get user profile |
| `PUT` | `/api/users/:id` | Yes | Update user profile |

---

## 6. Project Structure

```
local-services-marketplace/
├── frontend/
│   └── src/
│       ├── pages/          # React page components
│       ├── context/        # AuthContext (JWT + user state)
│       └── services/       # API client (api.js)
│
├── backend/
│   ├── config/
│   │   ├── db.js           # PostgreSQL connection pool
│   │   └── schema.sql      # Full database schema
│   ├── controllers/        # HTTP request handlers
│   ├── services/           # Business logic (AuthService, ServiceService, etc.)
│   ├── repositories/       # Data access layer
│   │   ├── IRepository.js  # Abstract interface
│   │   ├── DatabaseRepository.js  # PostgreSQL implementation
│   │   ├── FileRepository.js      # CSV fallback implementation
│   │   └── ...             # Entity-specific repositories
│   ├── routes/             # Express routers
│   ├── middleware/         # JWT auth, role guards, error handler
│   ├── models/             # Plain data model definitions
│   ├── tests/              # Jest unit tests (no real DB needed)
│   ├── container.js        # Dependency Injection container (wires repos → services)
│   ├── app.js              # Express app setup (security headers, CORS, rate limiting)
│   └── server.js           # Server entry point
│
├── docs/
│   ├── architecture.md
│   ├── class-diagram.md
│   ├── project-audit.md       # Audit Report
│   ├── improvement-report.md  # Improvement Sprint Report
│   ├── implementation.md      # Implementation Notes
│   ├── sprint-plan.md         # Sprint Plan
│   ├── sprint-report.md       # Sprint Report
│   └── demo-plan.md           # Demo Readiness Plan
│
├── .gitignore
└── README.md
```

---

## 7. Design Principles

| Principle | How It Is Applied |
|---|---|
| **SRP** (Single Responsibility) | Each layer (controller / service / repository) has exactly one job |
| **OCP** (Open/Closed) | New repository implementations can be added without modifying service code |
| **DIP** (Dependency Inversion) | Services depend on `IRepository`, never on `DatabaseRepository` directly |
| **Repository Pattern** | Abstracts all data access; storage can be swapped via `USE_DB` env flag |
| **Layered Architecture** | Clear data flow: Route → Controller → Service → Repository → DB |

---

## 8. Author

**Devlete Hasani**  
Student, Faculty of Mechanical and Computer Engineering

---
