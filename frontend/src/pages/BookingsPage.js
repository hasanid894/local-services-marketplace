import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import DateFieldWithCalendar from '../components/DateFieldWithCalendar';

// Status values must exactly match the backend/DB CHECK constraint:
// 'pending' | 'confirmed' | 'completed' | 'cancelled'
const STATUS_COLORS = {
  pending:   '#f59e0b',
  confirmed: '#10b981',
  completed: '#6366f1',
  cancelled: '#ef4444',
};

const PREFERRED_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning · ~8:00–12:00' },
  { value: 'afternoon', label: 'Afternoon · ~12:00–17:00' },
  { value: 'evening', label: 'Evening · after 17:00' },
  { value: 'flexible', label: "Flexible · I'll coordinate with the provider" },
];

function formatPreferredSlot(v) {
  const opt = PREFERRED_TIME_OPTIONS.find((o) => o.value === v);
  return opt ? opt.label : v || '—';
}

/** Job-site + notes on booking cards — providers/admins see the customer name. */
function BookingContext({ booking, showCustomer }) {
  const addr = (booking.jobAddress || '').trim();
  const city = (booking.jobCity || '').trim();
  const notes = (booking.customerNotes || '').trim();
  const access = (booking.accessNotes || '').trim();
  const hasFullAddress = !!(addr || city);

  return (
    <div className="booking-job-block">
      {showCustomer && booking.customerName && (
        <p className="booking-job-line booking-job-customer">
          <strong>Customer</strong> <span>{booking.customerName}</span>
        </p>
      )}
      {hasFullAddress ? (
        <p className="booking-job-line">
          <strong>Job site</strong>{' '}
          <span>📍 {[addr, city].filter(Boolean).join(', ')}</span>
        </p>
      ) : (
        <p className="booking-job-line booking-job-muted">
          <strong>Job site</strong>{' '}
          {showCustomer
            ? 'No address saved — clarify with the customer before visiting.'
            : 'No street address saved for this booking.'}
        </p>
      )}
      {notes ? (
        <p className="booking-job-line">
          <strong>What to do</strong> <span className="booking-note-body">{booking.customerNotes}</span>
        </p>
      ) : null}
      {access ? (
        <p className="booking-job-line">
          <strong>Access & logistics</strong> <span className="booking-note-body">{booking.accessNotes}</span>
        </p>
      ) : null}
    </div>
  );
}

export default function BookingsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const locationRoute = useLocation();

  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const prefill = locationRoute.state || {};
  const [form, setForm] = useState({
    serviceId: prefill.serviceId || '',
    providerId: prefill.providerId || '',
    scheduledDate: '',
    jobAddress: '',
    jobCity: '',
    preferredTime: 'flexible',
    customerNotes: '',
    accessNotes: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const loc = user?.location;
    if (!loc || typeof loc !== 'string' || !loc.trim()) return;
    setForm((f) => (f.jobCity.trim() ? f : { ...f, jobCity: loc.trim() }));
  }, [user?.id, user?.location]);

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
    if (!form.serviceId) { setFormError('Service selection is missing. Use Book on the Services page.'); return; }
    if (!form.providerId) { setFormError('Provider selection is missing.'); return; }
    if (!form.scheduledDate) { setFormError('Please select the date you need the visit.'); return; }
    if (!form.jobAddress.trim()) { setFormError('Street address or building location is required so the provider knows where to go.'); return; }
    if (form.jobAddress.trim().length < 5) {
      setFormError('Enter a fuller address (street name, building, or landmarks).'); return;
    }
    if (!form.jobCity.trim() || form.jobCity.trim().length < 2) {
      setFormError('Please enter the city, town, or area.'); return;
    }

    const body = {
      userId: user.id,
      serviceId: Number(form.serviceId),
      providerId: Number(form.providerId),
      scheduledDate: form.scheduledDate,
      jobAddress: form.jobAddress.trim(),
      jobCity: form.jobCity.trim(),
      preferredTime: form.preferredTime,
      customerNotes: form.customerNotes.trim(),
      accessNotes: form.accessNotes.trim(),
    };

    const { ok, data } = await api.createBooking(body, token);
    if (!ok) { setFormError(data?.error || 'Booking failed.'); return; }
    setSuccess('Booking sent! The provider can see where to go and what you described.');
    setForm({
      serviceId: '', providerId: '', scheduledDate: '',
      jobAddress: '', jobCity: '', preferredTime: 'flexible',
      customerNotes: '', accessNotes: '',
    });
    navigate(locationRoute.pathname, { replace: true });
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
  const listTitle = isAdmin ? 'All bookings' : isProvider ? 'Booking inbox' : 'Your bookings';

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Bookings</h1>
        <p>
          {isAdmin
            ? 'Full visibility across the platform — moderate statuses and resolve issues.'
            : isProvider
              ? 'Each request lists the job location, timing preference, and what the customer needs — approve when you are ready.'
              : 'Tell providers exactly where and what — they see location, timing, and your description before responding.'}
        </p>
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}
      {success && <div className="success-banner" role="status">{success}</div>}

      {!isProvider && !isAdmin && (
        <section className="panel">
          <h2>New booking</h2>
          {formError && <p className="error">{formError}</p>}

          {form.serviceId && form.providerId ? (
            <form onSubmit={handleCreate} className="form-grid">
              <div className="prefill-info">
                <span>
                  📋 <strong>{prefill.serviceTitle || `Service #${form.serviceId}`}</strong>
                  {' '}— continuing from Services
                  {prefill.serviceAreaHint ? (
                    <>
                      {' '}(listed near <strong>{prefill.serviceAreaHint}</strong>; your visit address can differ)
                    </>
                  ) : null}
                </span>
              </div>

              <DateFieldWithCalendar
                id="booking-date"
                label="Visit date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              />

              <div className="field">
                <label htmlFor="booking-time-slot">Preferred time</label>
                <select
                  id="booking-time-slot"
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                >
                  {PREFERRED_TIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="field form-span-2">
                <label htmlFor="booking-job-address">Street address or building where work happens</label>
                <input
                  id="booking-job-address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Street, number, neighbourhood or building name…"
                  value={form.jobAddress}
                  onChange={(e) => setForm({ ...form, jobAddress: e.target.value })}
                />
              </div>

              <div className="field form-span-2">
                <label htmlFor="booking-job-city">City / area</label>
                <input
                  id="booking-job-city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder={prefill.serviceAreaHint ? `e.g. ${prefill.serviceAreaHint}` : 'City, town or village'}
                  value={form.jobCity}
                  onChange={(e) => setForm({ ...form, jobCity: e.target.value })}
                />
              </div>

              <div className="field">
                <label htmlFor="booking-detail">
                  Describe the problem or task{' '}
                  <span className="optional">helps with estimating</span>
                </label>
                <textarea
                  id="booking-detail"
                  placeholder="Examples: dripping pipe under the kitchen sink, outdoor tap won’t seal, approximate age of fixtures…"
                  value={form.customerNotes}
                  onChange={(e) => setForm({ ...form, customerNotes: e.target.value })}
                />
              </div>

              <div className="field">
                <label htmlFor="booking-access">
                  Gate code / parking / pets <span className="optional">(optional)</span>
                </label>
                <textarea
                  id="booking-access"
                  placeholder="Intercom codes, courtyard access, noisy dog in the backyard…"
                  value={form.accessNotes}
                  onChange={(e) => setForm({ ...form, accessNotes: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Send booking request</button>
              </div>
            </form>
          ) : (
            <div className="info-panel">
              <p>
                🔍 To book a service, go to the{' '}
                <button
                  className="link-btn"
                  onClick={() => navigate('/services')}
                >
                  Services page
                </button>
                {' '}and choose <strong>Book</strong> — you’ll confirm the location and details here.
              </p>
            </div>
          )}
        </section>
      )}

      <section className="panel">
        <h2>{listTitle} ({bookings.length})</h2>
        {bookings.length === 0 && <p className="empty">No bookings found.</p>}
        <div className="cards-grid">
          {bookings.map((b) => (
            <article key={b.id} className="card booking-card">
              <div className="card-body">
                <div className="booking-header">
                  <span className="booking-id">Booking #{b.id}</span>
                  <span className="status-badge" style={{ background: STATUS_COLORS[b.status] || '#64748b' }}>
                    {b.status}
                  </span>
                </div>
                <p><strong>Service</strong>{' '} {b.serviceTitle || `#${b.serviceId}`}</p>
                <p><strong>Provider</strong>{' '} {b.providerName || `#${b.providerId}`}</p>
                <p><strong>Date & time pref.</strong>{' '}
                  {b.scheduledDate ? b.scheduledDate.slice(0, 10) : '—'}
                  {' '}·{' '}
                  {formatPreferredSlot(b.preferredTime)}
                </p>
                <BookingContext
                  booking={b}
                  showCustomer={(isProvider || isAdmin)}
                />
                <p className="card-meta-small">Created: {new Date(b.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="card-footer">
                {(isProvider || isAdmin) && b.status === 'pending' && (
                  <>
                    <button className="btn-approve" type="button" onClick={() => handleStatus(b.id, 'confirmed')}>Approve</button>
                    <button className="danger" type="button" onClick={() => handleStatus(b.id, 'cancelled')}>Reject</button>
                  </>
                )}
                {(isProvider || isAdmin) && b.status === 'confirmed' && (
                  <button className="btn-approve" type="button" onClick={() => handleStatus(b.id, 'completed')}>Mark Complete</button>
                )}
                {(b.status === 'pending' || isAdmin) && (
                  <button className="danger" type="button" onClick={() => handleDelete(b.id)}>Cancel</button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
