import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STARS = [1, 2, 3, 4, 5];

export default function ReviewsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [filterProviderId, setFilterProviderId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ providerId: '', bookingId: '', rating: 5, comment: '' });
  const [formError, setFormError] = useState('');

  const fetchReviews = async () => {
    const params = filterProviderId.trim() ? `providerId=${filterProviderId.trim()}` : '';
    const { ok, data } = await api.getReviews(params);
    if (ok) setReviews(data);
    else setError(data?.error || 'Failed to load reviews.');
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleFilter = (e) => { e.preventDefault(); fetchReviews(); };

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
        // Show all bookings so the user can review at any stage
        setMyBookings(data);
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
        <p>See what the community says about providers, or share your own experience after a booking.</p>
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {success && <div className="success-banner" role="status">{success}</div>}

      {/* Filter */}
      <section className="panel">
        <h2>Filter reviews</h2>
        <form onSubmit={handleFilter} className="row">
          <input
            placeholder="Filter by Provider ID"
            value={filterProviderId}
            onChange={e => setFilterProviderId(e.target.value)}
          />
          <button type="submit">Apply</button>
          <button type="button" className="ghost" onClick={() => { setFilterProviderId(''); setTimeout(fetchReviews, 0); }}>Clear</button>
        </form>
      </section>

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
                  💡 You need at least one booking to write a review.{' '}
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
                      Booking #{b.id} · Service #{b.serviceId} · {b.status}
                    </option>
                  ))}
                </select>
              )}
              {form.providerId && (
                <p className="info-hint" style={{ marginTop: '0.4rem' }}>
                  ✅ Provider auto-detected (ID #{form.providerId})
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
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length === 0 && <p className="empty">No reviews found.</p>}
        <div className="cards-grid">
          {reviews.map(r => (
            <article key={r.id} className="card review-card">
              <div className="card-body">
                <div className="review-header">
                  <div>{renderStars(r.rating)}</div>
                  <span className="review-rating">{r.rating}/5</span>
                </div>
                <p className="review-comment">{r.comment || 'No comment.'}</p>
                <div className="card-meta">
                  <span>User #{r.userId}</span>
                  <span>Provider #{r.providerId}</span>
                  <span>Booking #{r.bookingId}</span>
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
