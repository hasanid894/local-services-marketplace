import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';

function sanitizeUser(u) {
  if (!u || typeof u !== 'object') return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
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
      const [uRes, bRes, sRes, rRes] = await Promise.all([
        api.getUsers(),
        api.getBookings('', token),
        api.getServices('', token),
        api.getReviews(),
      ]);
      if (cancelled) return;
      if (!uRes.ok) setError(uRes.data?.error || 'Could not load users.');
      else setUsers(Array.isArray(uRes.data) ? uRes.data.map(sanitizeUser).filter(Boolean) : []);
      if (bRes.ok && Array.isArray(bRes.data)) setBookings(bRes.data);
      else setBookings([]);
      if (sRes.ok && Array.isArray(sRes.data)) setServices(sRes.data);
      else setServices([]);
      if (rRes.ok && Array.isArray(rRes.data)) setReviews(rRes.data);
      else setReviews([]);
      setLoading(false);
    }
    if (token) load();
    return () => { cancelled = true; };
  }, [token]);

  const roleCounts = useMemo(() => {
    const c = { customer: 0, provider: 0, admin: 0 };
    users.forEach((u) => {
      const r = String(u.role || '').toLowerCase();
      if (r === 'provider') c.provider += 1;
      else if (r === 'admin') c.admin += 1;
      else c.customer += 1;
    });
    return c;
  }, [users]);

  const bookingMix = useMemo(() => {
    const m = {};
    bookings.forEach((b) => {
      const k = String(b.status || 'Unknown');
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }, [bookings]);

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
        .slice(0, 6),
    [users]
  );

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="dashboard">
      <header className="dash-header dash-header-admin">
        <div>
          <p className="dash-eyebrow">Admin console</p>
          <h1 className="dash-title">Platform overview</h1>
          <p className="dash-subtitle">
            Signed in as {displayName}. Snapshot of users, listings, bookings, and reviews across the marketplace.
          </p>
        </div>
        <div className="dash-header-actions">
          <Link to="/services" className="btn-pill btn-pill-primary">View services</Link>
          <Link to="/bookings" className="btn-pill btn-pill-ghost">All bookings</Link>
        </div>
      </header>

      {error && (
        <div className="error-banner dash-banner" role="alert">{error}</div>
      )}

      {loading ? (
        <div className="dash-loading" aria-busy="true">
          <span className="dash-spinner" /> Loading platform metrics…
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              label="Registered users"
              value={users.length}
              hint={`${roleCounts.customer} customers · ${roleCounts.provider} providers`}
              icon={<IconUsers />}
            />
            <StatCard
              label="Total services"
              value={services.length}
              hint="Listings on the marketplace"
              icon={<IconGrid />}
            />
            <StatCard
              label="Bookings"
              value={bookings.length}
              hint={`Pending: ${bookingMix.Pending || 0}`}
              icon={<IconCalendar />}
            />
            <StatCard
              label="Reviews"
              value={reviews.length}
              hint="Community feedback"
              icon={<IconStar />}
            />
          </div>

          <section className="dash-panels">
            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Moderation &amp; support</h2>
              </div>
              <div className="quick-actions">
                <Link to="/services" className="quick-action">
                  <span className="quick-action-title">Catalog</span>
                  <span className="quick-action-desc">Audit listings and pricing</span>
                </Link>
                <Link to="/bookings" className="quick-action">
                  <span className="quick-action-title">Bookings</span>
                  <span className="quick-action-desc">Intervene on disputes or stuck jobs</span>
                </Link>
                <Link to="/reviews" className="quick-action">
                  <span className="quick-action-title">Reviews</span>
                  <span className="quick-action-desc">Spot abuse or spam patterns</span>
                </Link>
              </div>
            </div>

            <div className="dash-panel">
              <div className="dash-panel-head">
                <h2>Recent accounts</h2>
                <span className="dash-panel-meta">{users.length} total</span>
              </div>
              {recentUsers.length === 0 ? (
                <p className="dash-empty">No user records loaded.</p>
              ) : (
                <ul className="dash-list dash-list-admin">
                  {recentUsers.map((u) => (
                    <li key={u.id} className="dash-list-row">
                      <div>
                        <span className="dash-list-title">{u.name || u.email}</span>
                        <span className="dash-list-meta">{u.email}</span>
                      </div>
                      <span className={`role-chip role-chip-${String(u.role).toLowerCase()}`}>
                        {u.role}
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

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
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
function IconStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
