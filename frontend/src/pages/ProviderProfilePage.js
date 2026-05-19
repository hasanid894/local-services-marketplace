import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const STARS = [1, 2, 3, 4, 5];

export default function ProviderProfilePage() {
  const { providerId } = useParams();
  const navigate       = useNavigate();
  const { user, token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState('');
  const [pendingFav, setPendingFav] = useState(false);

  const id = Number(providerId);
  const isCustomer = user?.role?.toLowerCase() === 'customer';

  const reloadFavorite = useCallback(async () => {
    if (!isCustomer || !token || Number.isNaN(id)) return;
    const { ok, data } = await api.getMyFavorites(token);
    if (ok && Array.isArray(data)) {
      setIsFavorite(data.some((f) => Number(f.providerId) === Number(id)));
    }
  }, [isCustomer, token, id]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      if (!providerId || Number.isNaN(id) || id <= 0) {
        setError('Invalid provider link.');
        return;
      }

      const [pRes, sRes, rRes] = await Promise.all([
        api.getPublicProviderProfile(id),
        api.getServices(`providerId=${id}`),
        api.getReviews(`providerId=${id}`),
      ]);

      if (cancelled) return;

      if (!pRes.ok) {
        setError(pRes.data?.error || 'Provider not found.');
        setProfile(null);
        return;
      }
      setProfile(pRes.data);
      setServices(Array.isArray(sRes.data) ? sRes.data : []);
      setReviews(Array.isArray(rRes.data) ? rRes.data : []);
    }
    load();
    return () => { cancelled = true; };
  }, [providerId, id]);

  useEffect(() => {
    reloadFavorite();
  }, [reloadFavorite]);

  const toggleFavorite = async () => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    if (!isCustomer) return;

    setPendingFav(true);
    if (isFavorite) {
      const { ok, data } = await api.removeFavorite(id, token);
      if (!ok) setError(data?.error || 'Could not remove favorite.');
      else setIsFavorite(false);
    } else {
      const { ok, data } = await api.addFavorite(id, token);
      if (!ok) setError(data?.error || 'Could not add favorite.');
      else setIsFavorite(true);
    }
    setPendingFav(false);
  };

  const renderStars = (rating) =>
    STARS.map((s) => (
      <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#cbd5e1' }} aria-hidden="true">★</span>
    ));

  return (
    <div className="page">
      <div className="page-hero">
        <nav className="card-meta-small" aria-label="Breadcrumb">
          <Link to="/services">Marketplace</Link>
          {' '}/ storefront
        </nav>
        {error ? (
          <><h1>Provider</h1><p>{error}</p></>
        ) : profile ? (
          <>
            <h1>{profile.name}</h1>
            <p>
              {profile.location ? `📍 ${profile.location}` : 'Serving customers through this marketplace'} ·{' '}
              {profile.avgRating != null
                ? <><strong>{profile.avgRating}</strong> / 5 average · {profile.reviewCount} reviews</>
                : 'No ratings yet'}
            </p>
          </>
        ) : (
          <p className="dash-loading"><span className="dash-spinner" aria-hidden /> Loading provider…</p>
        )}
      </div>

      {profile && (
        <>
          <div className="row" style={{ alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isCustomer && (
              <button
                type="button"
                className={isFavorite ? 'btn-pill btn-pill-primary' : 'btn-pill btn-pill-ghost'}
                disabled={pendingFav}
                onClick={toggleFavorite}
                aria-pressed={isFavorite}
              >
                {isFavorite ? '♥ Saved to favorites' : '♡ Add to favorites'}
              </button>
            )}
            {!user && (
              <Link to="/login" className="btn-pill btn-pill-primary">Log in to save favorites</Link>
            )}
            <button type="button" className="btn-pill btn-pill-ghost" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          <section className="panel" style={{ marginTop: '1.5rem' }}>
            <h2>Services ({services.length})</h2>
            {services.length === 0 ? (
              <p className="empty">This provider does not publish any listings right now.</p>
            ) : (
              <ul className="dash-list">
                {services.map((s) => (
                  <li key={s.id} className="dash-list-row">
                    <div>
                      <span className="dash-list-title">{s.title}</span>
                      <span className="dash-list-meta">{s.categoryName || s.category || 'Service'} · {s.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                      <strong>{s.price} EUR</strong>
                      {user && user.role?.toLowerCase() === 'customer' && (
                        <Link to="/bookings" className="btn-pill btn-pill-primary" state={{
                          serviceId: s.id,
                          providerId: s.providerId,
                          serviceTitle: s.title,
                          serviceAreaHint: s.location?.trim() || '',
                        }}
                        >
                          Book
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <h2>Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="empty">No written reviews yet.</p>
            ) : (
              <ul className="review-list-plain">
                {reviews.map((r) => (
                  <li key={r.id} className="booking-card card" style={{ padding: '1rem' }}>
                    <div>{renderStars(Number(r.rating || 0))}</div>
                    {r.comment ? <p>{r.comment}</p> : <p className="booking-job-muted"><em>No comment.</em></p>}
                    <p className="card-meta-small">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
