import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STARS = [1, 2, 3, 4, 5];

// Deterministic pastel colour from a name string
const AVATAR_PALETTES = [
  ['#7c3aed', '#ede9fe'], ['#0e7490', '#cffafe'], ['#047857', '#d1fae5'],
  ['#b45309', '#fef3c7'], ['#be185d', '#fce7f3'], ['#1d4ed8', '#dbeafe'],
];
function avatarPalette(name = '') {
  const code = [...(name || '?')].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_PALETTES[code % AVATAR_PALETTES.length];
}
function initials(name = '') {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function InitialsAvatar({ name, size = 38 }) {
  const [bg, fg] = avatarPalette(name);
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: '50%',
        background: bg, color: fg,
        fontWeight: 700, fontSize: size * 0.38,
        flexShrink: 0, letterSpacing: '-0.03em',
      }}
    >
      {initials(name)}
    </span>
  );
}

export default function ReviewsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [filterProviderId, setFilterProviderId] = useState('');
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ providerId: '', bookingId: '', rating: 5, comment: '' });
  const [formError, setFormError] = useState('');

  const isProvider = user?.role?.toLowerCase() === 'provider';

  const fetchReviews = async (pid = filterProviderId) => {
    const params = pid ? `providerId=${pid}` : '';
    const { ok, data } = await api.getReviews(params);
    if (ok) setReviews(data);
    else setError(data?.error || 'Failed to load reviews.');
  };

  // Load providers for the filter dropdown and seed the initial filter.
  // If the logged-in user is a provider, auto-filter to their own reviews.
  useEffect(() => {
    api.getProviders().then(({ ok, data }) => {
      if (ok && Array.isArray(data)) setProviders(data);
    });

    if (isProvider && user?.id) {
      // Pre-filter to this provider's reviews without showing the dropdown
      setFilterProviderId(String(user.id));
      fetchReviews(String(user.id));
    } else {
      fetchReviews();
    }
  }, []);

  const handleProviderFilter = (e) => {
    const pid = e.target.value;
    setFilterProviderId(pid);
    fetchReviews(pid);
  };

  // ── User's own bookings (for the review form dropdown) ──────────────────────
  const [myBookings, setMyBookings] = useState([]);
  useEffect(() => {
    if (!user || !token) return;
    const role = user?.role?.toLowerCase();
    // Only customers write reviews; providers don't see the form
    if (role === 'provider') return;
    const params = `userId=${user.id}`;
    api.getBookings(params, token).then(({ ok, data }) => {
      if (ok && Array.isArray(data)) {
        // Only completed bookings can be reviewed
        setMyBookings(data.filter(b => String(b.status).toLowerCase() === 'completed'));
      }
    });
  }, [user, token]);

  const handleBookingSelect = (e) => {
    const bookingId = e.target.value;
    if (!bookingId) {
      setForm((f) => ({ ...f, bookingId: '', providerId: '' }));
      return;
    }
    const booking = myBookings.find((b) => String(b.id) === bookingId);
    setForm((f) => ({
      ...f,
      bookingId,
      providerId: booking ? String(booking.providerId) : '',
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(''); setSuccess('');
    if (!user) { navigate('/login'); return; }
    if (!form.bookingId) { setFormError('Please select a booking to review.'); return; }
    if (form.rating < 1 || form.rating > 5) { setFormError('Rating must be between 1 and 5.'); return; }

    const { ok, data } = await api.createReview(
      { ...form, userId: user.id, providerId: Number(form.providerId), bookingId: Number(form.bookingId), rating: Number(form.rating) },
      token
    );
    if (!ok) { setFormError(data?.error || 'Failed to post review.'); return; }
    setSuccess('Review posted successfully!');
    setForm({ providerId: '', bookingId: '', rating: 5, comment: '' });
    fetchReviews();
  };

  const handleDelete = async (id) => {
    setError('');
    const { ok, data } = await api.deleteReview(id, token);
    if (!ok) { setError(data?.error || 'Delete failed.'); return; }
    fetchReviews();
  };

  const canDelete = (r) => {
    if (!user) return false;
    if (user.role?.toLowerCase() === 'admin') return true;
    return Number(r.userId) === Number(user.id);
  };

  const renderStars = (rating) =>
    STARS.map(s => (
      <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#cbd5e1', fontSize: '1.1rem' }}>★</span>
    ));

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Reviews</h1>
        <p>
          {isProvider
            ? 'Your reviews from customers — see how your service is rated.'
            : 'See what the community says about providers, or share your own experience after a booking.'}
        </p>
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {success && <div className="success-banner" role="status">{success}</div>}

      {/* Filter — hidden for providers (they only see their own reviews) */}
      {!isProvider && (
        <section className="panel">
          <h2>Filter by provider</h2>
          <div className="row">
            <select
              id="filter-provider"
              value={filterProviderId}
              onChange={handleProviderFilter}
              style={{ minWidth: '220px' }}
            >
              <option value="">— All providers —</option>
              {providers.map(p => (
                <option key={p.id} value={String(p.id)}>{p.name}</option>
              ))}
            </select>
            {filterProviderId && (
              <button
                type="button"
                className="ghost"
                onClick={() => handleProviderFilter({ target: { value: '' } })}
              >
                Clear
              </button>
            )}
          </div>
        </section>
      )}

      {/* Post Review Form — logged-in customers */}
      {user && user.role?.toLowerCase() !== 'provider' && (
        <section className="panel">
          <h2>Write a review</h2>
          {formError && <p className="error">{formError}</p>}
          <form onSubmit={handleCreate} className="form-grid">

            {/* Booking selector — no raw ID typing required */}
            <div className="field">
              <label htmlFor="review-booking">Select a booking to review</label>
              {myBookings.length === 0 ? (
                <p className="info-hint">
                  💡 You need at least one <strong>completed</strong> booking to write a review.{' '}
                  <button className="link-btn" type="button" onClick={() => navigate('/services')}>
                    Browse services
                  </button>
                </p>
              ) : (
                <select
                  id="review-booking"
                  value={form.bookingId}
                  onChange={handleBookingSelect}
                >
                  <option value="">— choose a booking —</option>
                  {myBookings.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.serviceTitle || `Service #${b.serviceId}`} · {b.status}
                    </option>
                  ))}
                </select>
              )}
              {form.providerId && (
                <p className="info-hint" style={{ marginTop: '0.4rem' }}>
                  ✅ Provider auto-detected
                </p>
              )}
            </div>

            <div className="field">
              <label>Rating</label>
              <div className="star-picker">
                {STARS.map(s => (
                  <button
                    key={s}
                    type="button"
                    className="star-btn"
                    style={{ color: s <= form.rating ? '#f59e0b' : '#cbd5e1' }}
                    onClick={() => setForm({ ...form, rating: s })}
                    aria-label={`Rate ${s}`}
                  >★</button>
                ))}
                <span className="rating-label">{form.rating}/5</span>
              </div>
            </div>
            <textarea
              id="review-comment"
              placeholder="Share your experience…"
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
            />
            <div className="form-actions">
              <button type="submit" className="btn-primary">Post Review</button>
            </div>
          </form>
        </section>
      )}

      {!user && (
        <section className="panel info-panel">
          <p>🔒 <strong>Log in</strong> to post a review.</p>
        </section>
      )}

      {/* Reviews List */}
      <section className="panel">
        <h2>{isProvider ? 'Your Reviews' : 'Reviews'} ({reviews.length})</h2>
        {reviews.length === 0 && <p className="empty">No reviews found.</p>}
        <div className="cards-grid">
          {reviews.map(r => (
            <article key={r.id} className="card review-card">
              <div className="card-body">
                <div className="review-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <InitialsAvatar name={r.userName || `User ${r.userId}`} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
                        {r.userName || `User #${r.userId}`}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {r.providerName ? `➡️ ${r.providerName}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div>{renderStars(r.rating)}</div>
                    <span className="review-rating">{r.rating}/5</span>
                  </div>
                </div>
                <p className="review-comment">{r.comment || 'No comment.'}</p>
                <div className="card-meta">
                  {r.serviceTitle && <span>📋 {r.serviceTitle}</span>}
                </div>
                <p className="card-meta-small">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              {canDelete(r) && (
                <div className="card-footer">
                  <button className="danger" onClick={() => handleDelete(r.id)}>Delete</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
