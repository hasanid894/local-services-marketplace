# Demo Plan — Local Services Marketplace

**Author:** Devlete Hasani  
**Faculty:** Faculty of Mechanical and Computer Engineering  
**Date:** April 2026

---

## 1. Project Title

**Local Services Marketplace**

A full-stack web platform that connects customers in Kosovo with local service providers — plumbers, electricians, tutors, cleaners, and more.

---

## 2. Problem It Solves

Finding a reliable local professional in Kosovo is largely informal — people rely on word of mouth, Facebook groups, or guesswork. There is no central, transparent place to:

- browse verified local service listings,
- compare prices and read real customer reviews, or
- book a provider and track the job through to completion.

This project replaces that informal process with a structured digital marketplace where every interaction — from discovery to booking to review — is visible, status-driven, and accountable.

---

## 3. Main Users

| Role | Who they are | What they do |
|---|---|---|
| **Customer** | Anyone looking for a local service | Browses listings, creates bookings, leaves reviews after service |
| **Provider** | Plumber, electrician, tutor, cleaner, etc. | Publishes service listings, approves or rejects incoming bookings, builds a reputation through reviews |
| **Admin** | Platform moderator | Has full visibility — manages all users, bookings, and can remove abusive reviews |

---

## 4. Flow to Demonstrate

### Chosen flow: **Register → Login → Browse → Book → Track Booking Status**

**Step-by-step:**

1. Register a new **Customer** account
2. Log in → automatically redirect to the Customer Dashboard
3. Navigate to **Marketplace** → browse service listings, use category / location filters
4. Click **Book** on a service → pre-filled booking form appears (no ID typing required)
5. Select a date → confirm the booking → success message appears
6. Navigate to **Bookings** → see the new booking with status `pending`
7. *(Switch to a Provider account)* → approve the booking → status changes to `confirmed`
8. Switch back to Customer → refresh to see the updated status

**Why this flow?**

It covers every major feature in a single, natural path: **authentication**, **service discovery**, **data entry**, **role-based access control**, and the full **booking lifecycle**. It is the core value proposition of the platform and takes under 3 minutes to complete live.

---

## 5. A Real Problem I Solved

### Problem
During development, the dashboard stat cards ("Active bookings", "Completed", "Awaiting response") always displayed **zero**, even when real bookings existed in the database.

### Where it occurred
`CustomerDashboard.js` and `ProviderDashboard.js` — the `useMemo` hooks that count bookings by status.

### Root cause
The frontend was filtering bookings using **Title Case** strings (`'Pending'`, `'Approved'`, `'Completed'`), but the PostgreSQL database and `BookingService` store statuses in **lowercase** (`'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`). Additionally, the UI was using `'Approved'` as a status value, while the backend's valid status is `'confirmed'`.

Because JavaScript string comparison is case-sensitive, `b.status === 'Pending'` never matched `'pending'`, so every count returned 0.

### How I solved it
I replaced all Title Case status strings with their actual lowercase equivalents across both dashboard components, and corrected `'Approved'` → `'confirmed'` throughout. I also added the missing `status-pill-confirmed` and `status-pill-cancelled` CSS classes so the colored status badges now render correctly.

**Files changed:** `CustomerDashboard.js`, `ProviderDashboard.js`, `App.css`

---

## 6. What Still Needs Improvement

### Booking confirmation — no email or in-app notification

When a provider approves or rejects a booking, the customer currently has no way of knowing unless they manually refresh the Bookings page and check their status. The `NotificationService` exists in the backend and is wired into the DI container, but it does not yet send any real notification.

The fix would require either connecting `NotificationService` to an email provider (e.g. SendGrid or Nodemailer) or implementing a simple in-app notification badge that polls `GET /api/notifications` on the frontend. The data model already includes a `notifications` table in the database schema, so the persistence layer is ready — only the delivery mechanism is missing.

---

## 7. Presentation Structure (5–7 minutes)

| Segment | Duration | Content |
|---|---|---|
| **Introduction** | ~1 min | What the project is, what problem it solves, who uses it |
| **Live demo** | ~3 min | Walk through the full flow: Register → Login → Dashboard → Browse → Book → Track |
| **Technical explanation** | ~1 min | Layered architecture (Routes → Controllers → Services → Repositories → DB), DI container, dual storage mode |
| **Problem + solution** | ~1 min | The status case mismatch bug: what it was, where it hid, how I found and fixed it |
| **Conclusion** | ~30 sec | What still needs improvement (booking notifications), what I would tackle next |

---

## 8. Part 3 — Demo Readiness

### 8.1 Presentation Flow (exact order)

The following is the precise order I will follow during the live demo:

| # | Action | What the audience sees |
|---|---|---|
| 1 | Open the app at `http://localhost:3000` | Home page — project name, hero section, call-to-action |
| 2 | Click **Register** — fill in name, email, password, role = Customer | Registration form submits, JWT issued, redirect to Dashboard |
| 3 | Show the **Customer Dashboard** | Stat cards (active bookings, completed, reviews), quick-action links |
| 4 | Navigate to **Marketplace** (Services page) | Live service listings with category and location filter dropdowns |
| 5 | Apply a category filter | List narrows in real time — demonstrates the filter feature |
| 6 | Click **Book** on a listing | Booking page opens pre-filled — no manual ID entry required |
| 7 | Select a date, click **Confirm Booking** | Success banner appears; booking saved with status `pending` |
| 8 | Navigate to **Bookings** page | New booking card is visible with amber `pending` badge |
| 9 | Log out → log in as the **Provider** account | Provider Dashboard appears — inbox shows the incoming request |
| 10 | Go to **Bookings** → click **Approve** | Status updates to `confirmed` (green badge) immediately |
| 11 | Log out → log back in as the **Customer** | Bookings page shows status now reads `confirmed` |
| 12 | Navigate to **Reviews** | Show review cards with real reviewer names, provider names, and service titles (from JOIN query) |

**Estimated time for this live demo segment: approximately 3 minutes** (out of the 5–7 minute total presentation outlined in Section 7).

---

### 8.2 Backup Plan (in case something fails live)

| Failure scenario | Recovery action |
|---|---|
| **PostgreSQL is down** | Switch to CSV mode: set `USE_DB=false` in `backend/.env` and restart with `node server.js`. The full app runs without a database. |
| **Backend fails to start** | Open `README.md` → Section 4 (Getting Started) and walk through the setup steps verbally. Show `docs/architecture.md` as a visual of the system design. |
| **Frontend crashes or blank page** | Show pre-prepared screenshots of each page (Home, Services, Bookings, Dashboard, Reviews) stored locally. Narrate the flow using the screenshots. |
| **Booking flow breaks mid-demo** | Fall back to the pre-seeded provider account which already has confirmed bookings. Show the Bookings list and status badges directly without creating a new booking live. |
| **Login fails** | Use the pre-created demo accounts whose credentials are noted offline. If auth is broken entirely, show the JWT flow in `AuthService.js` and the auth middleware code directly. |

---

### 8.3 Practice Checklist

Completed before the presentation:

- [x] Ran the full demo flow (Register → Book → Approve → Confirm) end-to-end at least once
- [x] Verified both customer and provider demo accounts exist and log in correctly
- [x] Confirmed at least 3 service listings are visible on the Marketplace page
- [x] Confirmed at least 1 review is visible with real names (not raw IDs)
- [x] Tested the CSV fallback mode (`USE_DB=false`) — app runs without PostgreSQL
- [x] Timed the live demo section — stays under 3 minutes
- [x] Practiced the technical explanation of the layered architecture in one minute
- [x] Practiced the bug explanation (status case mismatch) in one minute

---
