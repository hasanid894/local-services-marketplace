# Sprint 2 Plan — Hasan
Date: April 1, 2026

## Current State

- What is currently working? (list every feature that works)
  - Services CRUD end-to-end using CSV storage (Repository -> Service -> API/UI)
  - `FileRepository` supports `getAll`, `getById`, `add`, `save`, `update`, `delete`
  - Initial service records exist in `backend/data/csv/services.csv`
  - Service business logic: list/filter, add with validation (title not empty, price > 0), find by id
  - Console menu UI for services: list (with filters), add, find, update, delete (`backend/ui/menu.js`)
  - Web API endpoints for services: `GET/POST/PUT/DELETE` plus `GET /api/services/:id`
  - Frontend UI for services: list, filter, find-by-id, add/update/delete, backend connection status (`frontend/src/App.js`)
  - Role-based behavior for services (demo version):
    - customer = read-only for services
    - provider/admin = can create/update/delete
    - provider = restricted to own services
  - Booking and review routes/controllers no longer crash the server (routes exist and export routers)

- What is not working? (list problems/bugs)
  - Authentication is still a demo approach (header-based). No real login/JWT flow yet, so roles are not persistent or secure
  - CSV parsing is simple (comma-splitting). If a field contains commas, it can break parsing
  - No automated tests yet (only manual testing through UI/API)
  - Backend must be running separately for frontend to load data (expected, but easy to forget during demos)
  - Bookings/Reviews exist as models/services/routes but are not yet connected to the frontend with a complete user flow
  - No verified provider profiles yet (just `providerId` ownership logic)

- Does the program compile and run? (Yes/No)
  - Yes. Backend starts on port 5000, frontend compiles and runs on port 3000.

## Sprint Plan

### New Feature (what you will build)

- **Database-ready persistence layer (DatabaseRepository skeleton + migration path)**
  - **What it does**: Add a new repository implementation (planned PostgreSQL) while keeping the existing service/controller logic unchanged.
  - **How the user interacts**: No UI change required at first; the goal is to be able to switch persistence using configuration (CSV now, DB later).
  - **Concrete deliverables**
    - Create `DatabaseRepository` (skeleton) that implements `IRepository`
    - Add a configuration switch (example: `USE_DB=true/false`) to decide which repository to instantiate
    - Keep `ServiceService` and controllers unchanged (DIP/OCP) and only swap the repository instance
  - **Why this feature**: The README describes PostgreSQL as the planned database. This step prepares that migration without breaking the current working CRUD flow.

### Error Handling (what you will add)

- Which parts of the program can currently crash?
  - CSV read/parse issues if a row is malformed or empty lines appear
  - API requests from frontend can fail (backend down, network issue, non-JSON error responses)
  - Invalid IDs (non-numeric, not found) during find/update/delete can cause confusing behavior

- How will you handle them? (list 3 specific cases)
  - **Case 1: malformed CSV line**
    - skip invalid rows during load and continue running (log error server-side)
  - **Case 2: frontend fetch fails**
    - show a clear UI message (“Backend offline” / “Request failed”) and keep UI usable
  - **Case 3: invalid/not-found IDs**
    - return consistent `404` with message from backend; frontend shows the message and does not silently fail

### Tests (what you will test)

- Which methods will you test?
  - `FileRepository.getAll`, `getById`, `add`, `update`, `delete` (using a temporary test CSV file)
  - `ServiceService.add` validation rules
  - Repository swapping: run the same service methods against `FileRepository` and `DatabaseRepository` (stub) to confirm contract compatibility

- Which edge cases will you check?
  - adding a service with empty title or price <= 0 (should reject)
  - filtering with different casing (e.g., “education” vs “Education”)
  - update/delete with non-existent id (should return not found / false)
  - repository selection misconfiguration (e.g., `USE_DB=true` but connection missing) should fail with a clear startup error instead of crashing mid-request

## Deadline

- Deadline: Tuesday, April 8, 2026, 08:30
