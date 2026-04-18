# Improvement Report — Local Services Marketplace

**Author:** Devlete Hasani  
**Date:** 18 April 2026  
**Assignment:** Project Audit & Improvement Sprint — Part 2

---

## Overview

This report documents **all 7 weaknesses** identified in `project-audit.md` and the improvements implemented to address each one. All changes are committed to the GitHub repository and can be verified by running `npx jest --verbose` in the `backend/` directory (**36/36 tests pass**).

---

## Improvement 1 — Fixed and Expanded the Test Suite
*(addresses Weakness 1)*

**Category:** Code structure / reliability

### The Problem Before

`backend/tests/serviceService.test.js` called method names that do not exist on the real `ServiceService` class:

| Test called | Real method name |
|---|---|
| `svc.add()` | `svc.createService()` |
| `svc.list()` | `svc.getAllServices()` |
| `svc.findById()` | `svc.getServiceById()` |

Every test crashed immediately with `TypeError: svc.add is not a function`. All tests were also synchronous, but the service is async — so even with correct names, `expect` would run before Promises resolved. There were also no tests at all for `AuthService` (the most security-sensitive part of the system).

### What Was Changed

- `serviceService.test.js` rewritten: correct method names, `async/await`, 14 tests total
- `authService.test.js` created: 10 tests covering register, login, duplicate email, admin role downgrade, wrong password

### Why the New Version Is Better

Tests that call non-existent methods are actively misleading — they create a false sense of coverage. Fixed tests fail loudly on real regressions, providing genuine protection when code changes.

---

## Improvement 2 — Dependency Injection Container
*(addresses Weakness 2)*

**Category:** Code structure / architecture

### The Problem Before

Every controller created its own service and repository at the top level:

```js
// bookingController.js — BEFORE
const repo           = createBookingRepository();
const bookingService = new BookingService(repo);
```

This is repeated in all 5 controller files. The controller owns its dependencies, making it impossible to swap them without editing the controller itself. Changing the storage mode in one controller does not propagate to others — each must be updated individually.

### What Was Changed

Created `backend/container.js` — a single file that instantiates all repositories and services once and exports them:

```js
// container.js
const userRepository    = createUserRepository();
const bookingRepository = createBookingRepository();
// ...
const authService    = new AuthService(userRepository);
const bookingService = new BookingService(bookingRepository);
// ...
module.exports = { authService, bookingService, ... };
```

All 5 controllers now import their pre-built service:

```js
// bookingController.js — AFTER
const { bookingService } = require('../container');
// controller functions are now pure HTTP handlers — zero wiring code
```

### Why the New Version Is Better

The container is the single source of truth for how the application is wired. To switch all controllers from PostgreSQL to CSV mode, only `container.js` needs to change. Controllers are now pure HTTP handlers with no construction logic, which makes them shorter, clearer, and easier to test by mocking the container.

---

## Improvement 3 — Fixed Status Value Mismatch Between Frontend and Backend
*(addresses Weakness 3)*

**Category:** Reliability / correctness

### The Problem Before

The database `CHECK` constraint and `BookingService` both enforce:  
`'pending' | 'confirmed' | 'completed' | 'cancelled'`

But `BookingsPage.js` used `'Pending'`, `'Approved'`, `'Rejected'`, `'Completed'` — values that do not exist in the DB. Every status badge was grey, every action button returned a `400 Bad Request`, and the booking lifecycle was completely non-functional.

### What Was Changed

`STATUS_COLORS`, all `b.status ===` comparisons, and all `handleStatus()` calls in `BookingsPage.js` updated to use the exact lowercase values the API and DB accept.

### Why the New Version Is Better

The entire booking workflow now actually functions end-to-end. This fix is not cosmetic — it determines whether the core feature of the platform works at all.

---

## Improvement 4 — Fixed Booking Form UX (No More Raw ID Inputs)
*(addresses Weakness 4)*

**Category:** UI flow / usability

### The Problem Before

```jsx
<input placeholder="Service ID *" type="number" ... />
<input placeholder="Provider ID *" type="number" ... />
```

Real users don't know internal database IDs. This is a fundamental UI design error — it breaks the booking flow for anyone who doesn't know the internal structure of the database.

### What Was Changed

`BookingsPage.js` now handles two flows:

1. **Arrived via "Book" button** (from Services page) — `serviceId` and `providerId` are pre-filled via `location.state`. The form shows a read-only confirmation label ("Service #3 — booked from the Services page") instead of number inputs. The user only picks a date and adds notes.

2. **Direct navigation** (no state) — Instead of showing empty number inputs, the page shows a clear guidance message with a link to the Services page: *"To book a service, go to the Services page and click the Book button on any listing."*

### Why the New Version Is Better

The normal booking user journey (browse → click Book → confirm date → submit) now works without requiring any knowledge of internal IDs. The raw number inputs never appear in the normal flow.

---

## Improvement 5 — Security Headers, Rate Limiting, and CORS Restriction
*(addresses Weakness 5)*

**Category:** Reliability / basic security

### The Problem Before

`app.js` only had:
```js
app.use(cors());       // allowed requests from any origin
app.use(express.json());
// no security headers at all
```

No protection against brute-force login attacks, no HTTP security headers, CORS open to every domain.

### What Was Changed

Installed `helmet` and `express-rate-limit`. Updated `app.js`:

```js
app.use(helmet());  // ~15 security headers: X-Frame-Options, HSTS, CSP, etc.

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15-minute window
  max: 10,                    // max 10 requests per IP
  message: { error: 'Too many attempts. Please wait 15 minutes and try again.' },
});
```

Rate limiter applied to `/api/auth` in `server.js` — limits login and register attempts to 10 per 15 minutes per IP.

### Why the New Version Is Better

`helmet()` adds security headers that browsers use to block clickjacking, MIME-type sniffing, and other common attacks. The rate limiter directly prevents brute-force password attacks — without it, an attacker can try thousands of passwords per minute. CORS restriction ensures only the known frontend origin can make cross-origin requests.

---

## Improvement 6 — SQL Column Whitelist in DatabaseRepository.update()
*(addresses Weakness 6)*

**Category:** Code structure / basic security

### The Problem Before

```js
// DatabaseRepository.update() — BEFORE
const setClauses = entries.map(([col], i) => `${col} = $${i + 1}`).join(', ');
```

Column names were inserted directly into SQL without validation. SQL values can be parameterised (preventing injection), but SQL column names cannot — they must be trusted. Any key in `updatedData` would appear verbatim in the query string.

### What Was Changed

`DatabaseRepository` now accepts an `allowedCols` Set in its constructor. The `update()` method filters all entries against this whitelist before building the query. Unknown columns are dropped with a warning:

```js
// AFTER — in update()
entries = entries.filter(([col]) => this._allowedCols.has(col));
// Unknown columns logged and discarded — never reach SQL
```

Each concrete repository passes its own set:
```js
const BOOKING_ALLOWED_COLS = new Set([
  'user_id', 'service_id', 'provider_id',
  'scheduled_date', 'status', 'total_price',
]);
super('bookings', mapRow, INSERT_COLS, toDbRow, BOOKING_ALLOWED_COLS);
```

### Why the New Version Is Better

The base class now has explicit protection rather than relying on every subclass to correctly pre-translate keys. An unknown column name reaching the query would cause a PostgreSQL error at best, or a security vulnerability at worst. The whitelist ensures this cannot happen regardless of what `updatedData` contains.

---

## Improvement 7 — NotificationService Connected (No Longer Dead Code)
*(addresses Weakness 7)*

**Category:** Code structure / documentation

### The Problem Before

`NotificationService.js` existed with 4 well-defined methods but was never imported anywhere. Any developer reading the codebase would assume notifications are implemented, only to discover the service is completely disconnected. Its docblock was written in Albanian and gave no guidance on how to upgrade to a real transport.

### What Was Changed

1. **Connected in `container.js`**: `notificationService = new NotificationService()` is instantiated and exported alongside all other services.

2. **Wired in controllers**:
   - `authController.register()` → calls `notificationService.notifyUserRegistered(user)` after successful registration
   - `bookingController.createBooking()` → calls `notificationService.notifyBookingCreated(booking)`
   - `bookingController.updateBookingStatus()` → calls `notificationService.notifyBookingStatusChanged(updated)`

3. **Docblock updated** to clearly state the current implementation (console-logger stub), explain that this is intentional for the demo phase, and give exact instructions for upgrading to a real transport (nodemailer, Twilio, Firebase).

### Why the New Version Is Better

The service is no longer dead code — it executes on every registration and booking event. The console logs provide real observability during development (you can see events as they happen in the server terminal). The upgraded docblock means a future developer knows exactly what to change to add real email/SMS notifications.

---

## Final Test Results

```
Test Suites: 3 passed, 3 total
Tests:       36 passed, 36 total
Time:        1.5 s
```

All 36 tests pass across `serviceService.test.js`, `authService.test.js`, and `fileRepository.test.js`. No existing tests were broken by any of the 7 improvements.

---

## What Still Remains Weak in the Project

1. **No CI/CD pipeline.** There is no GitHub Actions workflow to run the test suite automatically on every push. A developer can push broken code without running tests first.

2. **No integration or end-to-end tests.** All tests use in-memory stubs. A bug at the controller or repository layer (e.g., wrong SQL query, missing `await`) would not be caught by the current test suite.

3. **`NotificationService` is still a stub.** The service is now connected and running, but it only logs to the console. For a real production system, a real email or SMS transport would be needed.

---
