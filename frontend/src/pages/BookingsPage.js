import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Approved: '#10b981',
  Rejected: '#ef4444',
  Completed: '#6366f1',
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
    const params = user?.role?.toLowerCase() === 'provider'
      ? `providerId=${user.id}`
      : `userId=${user.id}`;
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
      <h1 className="page-title">📅 Bookings</h1>

      {error && <div className="error-banner" role="alert">⚠️ {error}</div>}
      {success && <div className="success-banner" role="status">✅ {success}</div>}

      {/* Create Booking Form — customers only */}
      {!isProvider && (
        <section className="panel">
          <h2>➕ New Booking</h2>
          {formError && <p className="error">{formError}</p>}
          <form onSubmit={handleCreate} className="form-grid">
            <input
              id="booking-serviceId"
              placeholder="Service ID *"
              type="number"
              value={form.serviceId}
              onChange={e => setForm({ ...form, serviceId: e.target.value })}
            />
            <input
              id="booking-providerId"
              placeholder="Provider ID *"
              type="number"
              value={form.providerId}
              onChange={e => setForm({ ...form, providerId: e.target.value })}
            />
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
              <button type="submit" className="btn-primary">Book Service</button>
            </div>
          </form>
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
                <p><strong>Service:</strong> #{b.serviceId}</p>
                <p><strong>Provider:</strong> #{b.providerId}</p>
                <p><strong>Date:</strong> {b.scheduledDate}</p>
                {b.notes && <p><strong>Notes:</strong> {b.notes}</p>}
                <p className="card-meta-small">Created: {new Date(b.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="card-footer">
                {/* Providers can approve/reject/complete */}
                {(isProvider || isAdmin) && b.status === 'Pending' && (
                  <>
                    <button className="btn-approve" onClick={() => handleStatus(b.id, 'Approved')}>Approve</button>
                    <button className="danger" onClick={() => handleStatus(b.id, 'Rejected')}>Reject</button>
                  </>
                )}
                {(isProvider || isAdmin) && b.status === 'Approved' && (
                  <button className="btn-approve" onClick={() => handleStatus(b.id, 'Completed')}>Mark Complete</button>
                )}
                {/* Anyone can delete their own booking if Pending */}
                {(b.status === 'Pending' || isAdmin) && (
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
