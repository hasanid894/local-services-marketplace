const BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

/**
 * safeFetch — wraps fetch with error handling.
 * Returns { ok, status, data } — never throws to the caller.
 */
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    let data = {};
    try { data = await res.json(); } catch { /* non-JSON body */ }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: 'Request failed — backend may be offline.' } };
  }
}

export const api = {
  // ── Auth ─────────────────────────────────────────────────────────────
  register: (body) => safeFetch(`${BASE}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }),
  login: (body) => safeFetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }),

  // ── Services ─────────────────────────────────────────────────────────
  getServices: (params = '', token) => safeFetch(
    `${BASE}/services${params ? '?' + params : ''}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  ),
  getServiceById: (id) => safeFetch(`${BASE}/services/${id}`),
  createService: (body, token) => safeFetch(`${BASE}/services`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  }),
  updateService: (id, body, token) => safeFetch(`${BASE}/services/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  }),
  deleteService: (id, token) => safeFetch(`${BASE}/services/${id}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
  }),

  // ── Bookings ─────────────────────────────────────────────────────────
  getBookings: (params = '', token) => safeFetch(
    `${BASE}/bookings${params ? '?' + params : ''}`,
    { headers: { Authorization: `Bearer ${token}` } }
  ),
  createBooking: (body, token) => safeFetch(`${BASE}/bookings`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  }),
  updateBookingStatus: (id, status, token) => safeFetch(`${BASE}/bookings/${id}/status`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  }),
  deleteBooking: (id, token) => safeFetch(`${BASE}/bookings/${id}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
  }),

  // ── Reviews ──────────────────────────────────────────────────────────
  getReviews: (params = '') => safeFetch(`${BASE}/reviews${params ? '?' + params : ''}`),
  createReview: (body, token) => safeFetch(`${BASE}/reviews`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  }),
  deleteReview: (id, token) => safeFetch(`${BASE}/reviews/${id}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
  }),

  // ── Users (admin / platform views) ───────────────────────────────────
  getUsers: () => safeFetch(`${BASE}/users`),
};
