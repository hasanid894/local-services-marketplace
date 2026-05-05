import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Status values must exactly match the backend/DB CHECK constraint:
// 'pending' | 'confirmed' | 'completed' | 'cancelled'
const STATUS_COLORS = {
  pending:   '#f59e0b',  // amber  — waiting for provider action
  confirmed: '#10b981',  // green  — provider approved
  completed: '#6366f1',  // indigo — work finished
  cancelled: '#ef4444',  // red    — declined or withdrawn
};

export default function BookingsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-filled from Services page "Book" button
  const prefill = location.state || {};
  const [form, setForm] = useState({
    serviceId: prefill.serviceId || '',
    providerId: prefill.providerId || '',
    scheduledDate: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchBookings = async () => {
    const role = user?.role?.toLowerCase();
    const params =
      role === 'admin' ? '' : role === 'provider' ? `providerId=${user.id}` : `userId=${user.id}`;
    const { ok, data } = await api.getBookings(params, token);
    if (ok) setBookings(data);
    else setError(data?.error || 'Failed to load bookings.');
  };

  useEffect(() => { if (user && token) fetchBookings(); }, [user, token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(''); setSuccess('');
    if (!form.serviceId) { setFormError('Service ID is required.'); return; }
    if (!form.providerId) { setFormError('Provider ID is required.'); return; }
    if (!form.scheduledDate) { setFormError('Please select a date.'); return; }

    const { ok, data } = await api.createBooking(
      { ...form, userId: user.id, serviceId: Number(form.serviceId), providerId: Number(form.providerId) },
      token
    );
    if (!ok) { setFormError(data?.error || 'Booking failed.'); return; }
    setSuccess('Booking created successfully!');
    setForm({ serviceId: '', providerId: '', scheduledDate: '', notes: '' });
    fetchBookings();
  };

  const handleStatus = async (id, status) => {
    setError('');
    const { ok, data } = await api.updateBookingStatus(id, status, token);
    if (!ok) { setError(data?.error || 'Status update failed.'); return; }
    fetchBookings();
  };

  const handleDelete = async (id) => {
    setError('');
    const { ok, data } = await api.deleteBooking(id, token);
    if (!ok) { setError(data?.error || 'Delete failed.'); return; }
    fetchBookings();
  };

  const isProvider = user?.role?.toLowerCase() === 'provider';
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Bookings</h1>
        <p>
          {isAdmin
            ? 'Full visibility across the platform — moderate statuses and resolve issues.'
            : isProvider
              ? 'Incoming requests from customers — approve, complete, or reject.'
              : 'Create reservations and track status from pending to completed.'}
        </p>
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {success && <div className="success-banner" role="status">{success}</div>}

      {/* Create booking — customers only */}
      {!isProvider && !isAdmin && (
        <section className="panel">
          <h2>New booking</h2>
          {formError && <p className="error">{formError}</p>}

          {/* Weakness 4 fix: if serviceId/providerId are pre-filled from the
              Services page "Book" button, show them as read-only confirmation.
              If the user navigated directly, guide them to the Services page. */}
          {form.serviceId && form.providerId ? (
            <form onSubmit={handleCreate} className="form-grid">
              {/* Read-only confirmation — no raw ID inputs shown to real users */}
              <div className="prefill-info">
                <span>📋 <strong>{prefill.serviceTitle || `Service #${form.serviceId}`}</strong> — booked from the Services page</span>
              </div>
              <input
                id="booking-date"
                type="date"
                value={form.scheduledDate}
                onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
              />
              <textarea
                id="booking-notes"
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
              <div className="form-actions">
                <button type="submit" className="btn-primary">Confirm Booking</button>
              </div>
            </form>
          ) : (
            // No service selected — direct navigation without clicking "Book"
            <div className="info-panel">
              <p>
                🔍 To book a service, go to the{' '}
                <button
                  className="link-btn"
                  onClick={() => navigate('/services')}
                >
                  Services page
                </button>
                {' '}and click the <strong>Book</strong> button on any listing.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Bookings List */}
      <section className="panel">
        <h2>Your Bookings ({bookings.length})</h2>
        {bookings.length === 0 && <p className="empty">No bookings found.</p>}
        <div className="cards-grid">
          {bookings.map(b => (
            <article key={b.id} className="card booking-card">
              <div className="card-body">
                <div className="booking-header">
                  <span className="booking-id">Booking #{b.id}</span>
                  <span className="status-badge" style={{ background: STATUS_COLORS[b.status] || '#64748b' }}>
                    {b.status}
                  </span>
                </div>
                <p><strong>Service:</strong> {b.serviceTitle || `#${b.serviceId}`}</p>
                <p><strong>Provider:</strong> {b.providerName || `#${b.providerId}`}</p>
                <p><strong>Date:</strong> {b.scheduledDate ? b.scheduledDate.slice(0, 10) : '—'}</p>
                {b.notes && <p><strong>Notes:</strong> {b.notes}</p>}
                <p className="card-meta-small">Created: {new Date(b.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="card-footer">
                {/* Providers can confirm/cancel/complete — values must match DB */}
                {(isProvider || isAdmin) && b.status === 'pending' && (
                  <>
                    <button className="btn-approve" onClick={() => handleStatus(b.id, 'confirmed')}>Approve</button>
                    <button className="danger" onClick={() => handleStatus(b.id, 'cancelled')}>Reject</button>
                  </>
                )}
                {(isProvider || isAdmin) && b.status === 'confirmed' && (
                  <button className="btn-approve" onClick={() => handleStatus(b.id, 'completed')}>Mark Complete</button>
                )}
                {/* Anyone can cancel their own booking while it is still pending */}
                {(b.status === 'pending' || isAdmin) && (
                  <button className="danger" onClick={() => handleDelete(b.id)}>Cancel</button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
