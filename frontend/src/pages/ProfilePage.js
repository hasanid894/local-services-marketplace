import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ProfilePage() {
  const { user, token, updateSessionUser } = useAuth();
  const [form, setForm] = useState({ name: '', location: '', phone: '' });
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const role = user?.role?.toLowerCase() || '';
  const isCustomer = role === 'customer';

  const loadFavorites = useCallback(async () => {
    if (!isCustomer || !token) return;
    const { ok, data } = await api.getMyFavorites(token);
    if (ok && Array.isArray(data)) setFavorites(data);
    else setFavorites([]);
  }, [isCustomer, token]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || !token) return;
      setLoading(true);
      setError('');
      const { ok, data } = await api.getUserById(user.id, token);
      if (cancelled) return;
      if (!ok) setError(data?.error || 'Could not load profile.');
      else if (data) {
        setForm({ name: data.name || '', location: data.location || '', phone: data.phone || '' });
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user, token]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!token || !user) return;
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    const { ok, data } = await api.updateUser(user.id, {
      name: form.name.trim(),
      location: form.location.trim(),
      phone: form.phone.trim() || null,
    }, token);
    setSaving(false);
    if (!ok) {
      setError(data?.error || 'Update failed.');
      return;
    }
    updateSessionUser({ name: data.name, location: data.location, phone: data.phone });
    setSuccess('Profile saved.');
  };

  if (!user || !token) return null;

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Your profile</h1>
        <p>
          {role === 'provider'
            ? 'Keep your basic details current — customers rely on professionalism and reachable contact context.'
            : 'Update how you introduce yourself across bookings and revisit providers you bookmarked.'}
        </p>
      </div>

      {loading ? (
        <p className="dash-loading" aria-busy="true"><span className="dash-spinner" /> Loading profile…</p>
      ) : (
        <>
          {error && <div className="error-banner" role="alert">{error}</div>}
          {success && <div className="success-banner" role="status">{success}</div>}

          <section className="panel">
            <h2>Account details</h2>
            <p className="card-meta-small">Signed in as <strong>{user.email}</strong> · Role: <strong>{user.role}</strong></p>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="field form-span-2">
                <label htmlFor="profile-name">Display name</label>
                <input
                  id="profile-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="How you want to appear to providers"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="field form-span-2">
                <label htmlFor="profile-location">City / neighbourhood (optional)</label>
                <input
                  id="profile-location"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Prishtina"
                  autoComplete="address-level2"
                />
              </div>
              <div className="field form-span-2">
                <label htmlFor="profile-phone">Phone number (optional)</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+383 44 123 456"
                  autoComplete="tel"
                />
                <p className="card-meta-small" style={{ marginTop: '0.35rem' }}>
                  Visible to you after login. Providers can use this to coordinate bookings.
                </p>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>

          {isCustomer && (
            <section className="panel">
              <div className="dash-panel-head" style={{ marginBottom: '0.75rem' }}>
                <h2>Favorite providers</h2>
                <button type="button" className="ghost" onClick={loadFavorites}>Refresh list</button>
              </div>
              {favorites.length === 0 ? (
                <p className="empty">None yet — open any provider storefront and tap the heart icon to save them.</p>
              ) : (
                <ul className="dash-list">
                  {favorites.map((f) => (
                    <li key={f.providerId} className="dash-list-row">
                      <div>
                        <span className="dash-list-title">{f.name}</span>
                        <span className="dash-list-meta">
                          Saved for faster re-booking ·{' '}
                          <Link to={`/providers/${f.providerId}`}>Open profile</Link>
                        </span>
                      </div>
                      <Link to={`/providers/${f.providerId}`} className="btn-pill btn-pill-primary">View</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
