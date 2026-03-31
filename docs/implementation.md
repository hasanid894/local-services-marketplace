# Implementation Notes

This file describes what I implemented in the project, how it works in practice, and why some choices were made.

## What I built

I used `Service` as the main model and connected everything through the same flow:

`UI -> Service layer -> Repository -> CSV file`

I kept both interfaces active:

- console menu in `backend/ui/menu.js`
- web interface in `frontend/src/App.js`

Both use the same backend/service logic, so the behavior is consistent.

## Service model and data storage

The model is in `backend/models/Service.js` and has these fields:

- `id`
- `providerId`
- `title`
- `description`
- `category`
- `location`
- `price`
- `status`
- `createdAt`

Data is stored in CSV (`backend/data/csv/services.csv`) through a generic file repository (`backend/repositories/FileRepository.js`).

Repository methods used:

- `getAll()`
- `getById(id)`
- `add(entity)`
- `save()`
- `update(id, updatedData)`
- `delete(id)`

Why I kept it this way:

- easy to test without a database
- clear separation between business logic and persistence
- reusable repository for other models too

## Service layer logic

Main logic is in `backend/services/ServiceService.js`.

Core methods:

- `list(filter)`
- `add(data)`
- `findById(id)`

Additional methods:

- `updateService(id, data)`
- `deleteService(id)`

Validation currently enforced:

- title/name cannot be empty
- price must be greater than 0

Filtering supports category/location/provider. Category and location matching are case-insensitive and tolerant (partial text).

The service receives repository via constructor (dependency injection), so I can swap storage later without rewriting service logic.

## API and controller flow

Service endpoints are in `backend/routes/serviceRoutes.js` and `backend/controllers/serviceController.js`:

- `GET /api/services`
- `GET /api/services/:id`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

Controllers call the service, and the service calls repository. No direct file access from UI.

## Console UI

The console menu in `backend/ui/menu.js` supports:

1. list (with optional filter input)
2. add
3. find by id
4. update
5. delete
0. exit

This is useful for quick testing and verifying full CRUD without browser tools.

## Frontend UI

The web interface (`frontend/src/App.js` + `frontend/src/App.css`) supports:

- list services
- filter by category/location
- find by id
- add/update/delete
- visible backend connection status

I also improved the layout so it is easier to use during demos.

## Role behavior (demo-safe RBAC)

Initially, everyone could mutate services because CRUD was the first target.  
After that, I added role restrictions to make behavior closer to a real marketplace.

Middleware: `backend/middleware/authMiddleware.js`

Current demo headers:

- `x-user-role`: `customer`, `provider`, `admin`
- `x-user-id`: numeric id

Rules now:

- `customer`: read-only for services
- `provider`: can create/update/delete only own services
- `admin`: full access

Frontend includes a role/user switcher so this can be tested quickly.

Why this approach:

- keeps implementation simple and transparent
- enforces permissions in backend (not only UI hiding)
- easy to replace later with JWT authentication

## How to run

Backend API:

```bash
cd backend
npm install
npm start
```

Backend console menu:

```bash
cd backend
npm run menu
```

Frontend:

```bash
cd frontend
npm install
npm start
```

Root shortcuts:

```bash
npm run backend
npm run frontend
```

## What to show in screenshots

- console menu with list/add/find/update/delete
- frontend list + filter + add/update/delete form
- role switch behavior (customer vs provider/admin)
- one API CRUD example from Postman/Thunder Client
