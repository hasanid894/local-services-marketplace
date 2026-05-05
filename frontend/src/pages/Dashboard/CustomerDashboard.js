import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';

function countByStatus(bookings, status) {
  return bookings.filter((b) => String(b.status) === status).length;
}

export default function CustomerDashboard() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      const params = `userId=${user.id}`;
      const [bRes, rRes] = await Promise.all([
        api.getBookings(params, token),
        api.getReviews(),
      ]);
      if (cancelled) return;
      if (!bRes.ok) setError(bRes.data?.error || 'Could not load bookings.');
      else setBookings(Array.isArray(bRes.data) ? bRes.data : []);
      if (rRes.ok && Array.isArray(rRes.data)) {
        setReviews(rRes.data.filter((r) => Number(r.userId) === Number(user.id)));
      } else {
        setReviews([]);
      }
      setLoading(false);
    }
    if (user && token) load();
    return () => { cancelled = true; };
  }, [user, token]);

  const stats = useMemo(() => {
    const pending   = countByStatus(bookings, 'pending');
    const confirmed = countByStatus(bookings, 'confirmed');
    const done      = countByStatus(bookings, 'completed');
    return { pending, confirmed, done, total: bookings.length };
  }, [bookings]);

  const recentBookings = useMemo(
    () => [...bookings].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 4),
    [bookings]
  );

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

  return (
    <div className="dashboard">
      <header className="dash-header dash-header-customer">
        <div>
          <p className="dash-eyebrow">Customer workspace</p>
          <h1 className="dash-title">Hello, {displayName}</h1>
          <p className="dash-subtitle">
            Track bookings, leave reviews after completed visits, and discover new providers in your area.
          </p>
        </div>
        <div className="dash-header-actions">
          <Link to="/services" className="btn-pill btn-pill-primary">Find services</Link>
          <Link to="/bookings" className="btn-pill btn-pill-ghost">Manage bookings</Link>
        </div>
      </header>

      {error && (
        <div className="error-banner dash-banner" role="alert">{error}</div>
      )}

      {loading ? (
        <div className="dash-loading" aria-busy="true">
          <span className="dash-spinner" /> Loading your overview…
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              label="Active bookings"
              value={stats.pending + stats.confirmed}
              hint="Pending + confirmed"
              icon={<IconCalendar />}
            />
            <StatCard
              label="Completed"
              value={stats.done}
              hint="Finished jobs"
              icon={<IconCheck />}
            />
            <StatCard
              label="Your reviews"
              value={reviews.length}
              hint="Posted feedback"
              icon={<IconStar />}
            />
            <StatCard
              label="All-time bookings"
              value={stats.total}
              hint="Total requests"
              icon={<IconStack />}
            />
          </div>

          <section className="dash-panels">
            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Quick actions</h2>
              </div>
              <div className="quick-actions">
                <Link to="/services" className="quick-action">
                  <span className="quick-action-title">Browse marketplace</span>
                  <span className="quick-action-desc">Search by category and location</span>
                </Link>
                <Link to="/bookings" className="quick-action">
                  <span className="quick-action-title">New booking</span>
                  <span className="quick-action-desc">Reserve a service provider</span>
                </Link>
                <Link to="/reviews" className="quick-action">
                  <span className="quick-action-title">Reviews</span>
                  <span className="quick-action-desc">Read or write feedback</span>
                </Link>
              </div>
            </div>

            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Recent bookings</h2>
                <Link to="/bookings" className="dash-panel-link">View all</Link>
              </div>
              {recentBookings.length === 0 ? (
                <p className="dash-empty">No bookings yet. Start from the marketplace.</p>
              ) : (
                <ul className="dash-list">
                  {recentBookings.map((b) => (
                    <li key={b.id} className="dash-list-row">
                      <div>
                        <span className="dash-list-title">Booking #{b.id}</span>
                        <span className="dash-list-meta">
                          {b.serviceTitle || `Service #${b.serviceId}`} · {b.scheduledDate ? b.scheduledDate.slice(0, 10) : '—'}
                        </span>
                      </div>
                      <span className={`status-pill status-pill-${String(b.status).toLowerCase()}`}>
                        {b.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 5v15" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconStack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}
