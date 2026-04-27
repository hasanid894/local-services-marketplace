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

This project replaces that informal process with a structured digital marketplace where every interaction — from discovery to booking to review — is visible, statusdriven, and accountable.

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

### Review flow UX — linking reviews back to service names

Currently, the review list shows raw IDs (`User #3`, `Provider #2`, `Booking #5`). A meaningful review feed would display the provider's **name** and the **service title** instead.

This would require a JOIN or a secondary API call when loading reviews, which is technically straightforward but was not prioritized in the current sprint. Displaying human-readable context would make the Reviews page significantly more useful and professional.

---

## 7. Presentation Structure (5–7 minutes)

| Segment | Duration | Content |
|---|---|---|
| **Introduction** | ~1 min | What the project is, what problem it solves, who uses it |
| **Live demo** | ~3 min | Walk through the full flow: Register → Login → Dashboard → Browse → Book → Track |
| **Technical explanation** | ~1 min | Layered architecture (Routes → Controllers → Services → Repositories → DB), DI container, dual storage mode |
| **Problem + solution** | ~1 min | The status case mismatch bug: what it was, where it hid, how I found and fixed it |
| **Conclusion** | ~30 sec | What still needs improvement (review feed with real names), what I would tackle next |

### Backup plan (in case something fails live)

- **Backend offline:** Use the CSV file mode (`USE_DB=false`) — the app runs without PostgreSQL
- **Database error:** Show the `README.md` setup section and the `docs/architecture.md` diagram
- **Frontend crash:** Show pre-taken screenshots of each page stored in this `docs/` folder
- **Booking flow breaks:** Demonstrate the Services page filter + the Bookings page list from a pre-seeded demo account

---

*This document satisfies the requirements of Part 2 of the Demo Readiness Assignment.*
