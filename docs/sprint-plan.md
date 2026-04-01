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
  - Demo RBAC for services:
    - customer = read-only
    - provider/admin = can create
    - provider = can update/delete only own services
  - Booking and review routes/controllers no longer crash the server (routes exist and export routers)

- What is not working? (list problems/bugs)
  - Demo authentication is header-based (not real login/JWT yet), so roles are not persistent and not secure for production
  - CSV parsing is simple (comma-splitting). If a field contains commas, it can break parsing
  - No automated tests yet (only manual testing through UI/API)
  - Backend must be running separately for frontend to load data (expected, but easy to forget during demos)

- Does the program compile and run? (Yes/No)
  - Yes. Backend starts on port 5000, frontend compiles and runs on port 3000.

## Sprint Plan

### New Feature (what you will build)

- **Booking creation from the UI**
  - **What it does**: A customer can select a service and create a booking request (scheduled date + optional notes). The booking is saved to CSV and becomes visible in a simple bookings list.
  - **How the user interacts**:
    - On the frontend services page, the user clicks “Book” on a service card
    - A small form appears (date + notes) and submits the booking
    - The UI shows a confirmation and refreshes the bookings list
  - **Why this feature**: It extends the marketplace from “just listing services” into an actual workflow (service -> booking), using the same architecture and persistence approach.

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
  - Booking creation flow: service -> booking creation -> stored in CSV -> retrieved via repository

- Which edge cases will you check?
  - adding a service with empty title or price <= 0 (should reject)
  - filtering with different casing (e.g., “education” vs “Education”)
  - update/delete with non-existent id (should return not found / false)
  - booking with missing date (should reject with validation)

## Deadline

- Deadline: Tuesday, April 8, 2026, 08:30
