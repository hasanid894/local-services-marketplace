import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';

export default function ProviderDashboard() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      const pid = user.id;
      const [bRes, sRes, rRes] = await Promise.all([
        api.getBookings(`providerId=${pid}`, token),
        api.getServices(`providerId=${pid}`, token),
        api.getReviews(`providerId=${pid}`),
      ]);
      if (cancelled) return;
      if (!bRes.ok) setError(bRes.data?.error || 'Could not load bookings.');
      else setBookings(Array.isArray(bRes.data) ? bRes.data : []);
      if (sRes.ok && Array.isArray(sRes.data)) setServices(sRes.data);
      else setServices([]);
      if (rRes.ok && Array.isArray(rRes.data)) setReviews(rRes.data);
      else setReviews([]);
      setLoading(false);
    }
    if (user && token) load();
    return () => { cancelled = true; };
  }, [user, token]);

  const stats = useMemo(() => {
    const pending    = bookings.filter((b) => b.status === 'pending').length;
    const needAction = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
    const avg =
      reviews.length === 0
        ? null
        : (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1);
    return { pending, needAction, avg, reviewCount: reviews.length };
  }, [bookings, reviews]);

  const inbox = useMemo(
    () =>
      [...bookings]
        .filter((b) => b.status === 'pending' || b.status === 'confirmed')
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 5),
    [bookings]
  );

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Provider';

  return (
    <div className="dashboard">
      <header className="dash-header dash-header-provider">
        <div>
          <p className="dash-eyebrow">Provider workspace</p>
          <h1 className="dash-title">{displayName}</h1>
          <p className="dash-subtitle">
            Manage listings, respond to booking requests, and build your reputation through reviews.
          </p>
        </div>
        <div className="dash-header-actions">
          <Link to="/services" className="btn-pill btn-pill-primary">My listings</Link>
          <Link to="/bookings" className="btn-pill btn-pill-ghost">Booking inbox</Link>
        </div>
      </header>

      {error && (
        <div className="error-banner dash-banner" role="alert">{error}</div>
      )}

      {loading ? (
        <div className="dash-loading" aria-busy="true">
          <span className="dash-spinner" /> Loading provider overview…
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              label="Active listings"
              value={services.length}
              hint="Services you offer"
              icon={<IconBriefcase />}
            />
            <StatCard
              label="Awaiting response"
              value={stats.pending}
              hint="Pending bookings"
              icon={<IconInbox />}
            />
            <StatCard
              label="Avg. rating"
              value={stats.avg != null ? `${stats.avg} / 5` : '—'}
              hint={stats.reviewCount ? `${stats.reviewCount} reviews` : 'No reviews yet'}
              icon={<IconStar />}
            />
            <StatCard
              label="Open pipeline"
              value={stats.needAction}
              hint="Pending + approved jobs"
              icon={<IconActivity />}
            />
          </div>

          <section className="dash-panels">
            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Workflow</h2>
              </div>
              <div className="quick-actions">
                <Link to="/services" className="quick-action">
                  <span className="quick-action-title">Edit services</span>
                  <span className="quick-action-desc">Add, update, or remove listings</span>
                </Link>
                <Link to="/bookings" className="quick-action">
                  <span className="quick-action-title">Approve or complete</span>
                  <span className="quick-action-desc">Move bookings through statuses</span>
                </Link>
                <Link to="/reviews" className="quick-action">
                  <span className="quick-action-title">See feedback</span>
                  <span className="quick-action-desc">What customers say about you</span>
                </Link>
              </div>
            </div>

            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Inbox preview</h2>
                <Link to="/bookings" className="dash-panel-link">Open inbox</Link>
              </div>
              {inbox.length === 0 ? (
                <p className="dash-empty">No active requests. New bookings will appear here.</p>
              ) : (
                <ul className="dash-list">
                  {inbox.map((b) => (
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

function IconBriefcase() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M22 12h-6l-2 3H10l-2-3H2" />
      <path d="M5.45 5h13.1A2 2 0 0121 7.58v8.84a2 2 0 01-2 2H5a2 2 0 01-2-2V7.58A2 2 0 013.45 5z" />
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
function IconActivity() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
