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

## Screenshots to verify 

## Console menu with list/add/find/update/delete:
<img width="1041" height="233" alt="image" src="https://github.com/user-attachments/assets/157cce9e-d78e-42aa-899b-011acc3f06d2" />
For example, when the first option is clicked, here's what is shown in console:
<img width="1056" height="753" alt="image" src="https://github.com/user-attachments/assets/9cb9c280-c854-4393-9c70-69cbd0632a77" />
<img width="1176" height="630" alt="image" src="https://github.com/user-attachments/assets/0977f968-8573-4a00-a819-1ce84a7c9527" />
<img width="1127" height="670" alt="image" src="https://github.com/user-attachments/assets/2313f7bf-a161-41de-8a52-e34c574d0e68" />

Option 2:

<img width="718" height="414" alt="image" src="https://github.com/user-attachments/assets/f531b3c6-20d7-4720-b8e4-4edc325d1a5d" />

Option 3:

<img width="679" height="378" alt="image" src="https://github.com/user-attachments/assets/bd7e9e17-3f13-4020-9f93-1e2a9b259fdc" />

Option 4:

<img width="735" height="412" alt="image" src="https://github.com/user-attachments/assets/60327665-6f07-4b84-9442-6f6eef2b1024" />

Option 5:

<img width="761" height="127" alt="image" src="https://github.com/user-attachments/assets/643eeb6c-affd-4d12-8bfb-671ba2090ff7" />



## Frontend list + filter + add/update/delete form
<img width="991" height="837" alt="image" src="https://github.com/user-attachments/assets/dfb92b72-3d1f-4277-8125-968c5f85cd5d" />
<img width="1034" height="853" alt="image" src="https://github.com/user-attachments/assets/3f0d5b5c-d5a9-4ba5-bd09-bf37a7350a2d" />
<img width="992" height="799" alt="image" src="https://github.com/user-attachments/assets/7024f5bb-487a-4b31-8a95-210ce782fe98" />


## Role switch behavior (customer vs provider/admin)
<img width="1044" height="505" alt="image" src="https://github.com/user-attachments/assets/0c06969d-9e66-4794-9052-26d7df510779" />
<img width="1062" height="836" alt="image" src="https://github.com/user-attachments/assets/f77de987-67c0-4726-87e5-379e4e62aaf4" />
<img width="1024" height="867" alt="image" src="https://github.com/user-attachments/assets/f8e1a756-7f96-46a5-a6b1-4e8c03a33e95" />

Admin can also update/delete all of the existing services, as shown on earlier screenshots.
