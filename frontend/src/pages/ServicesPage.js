import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Small inline placeholder so cards never render as a "black box" if all URLs fail.
const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#22d3ee" stop-opacity="0.25"/>
          <stop offset="1" stop-color="#a78bfa" stop-opacity="0.15"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" fill="#0b1220"/>
      <rect x="20" y="20" width="760" height="440" rx="22" fill="url(#g)" stroke="rgba(148,163,184,0.25)"/>
      <text x="400" y="250" text-anchor="middle" font-family="Plus Jakarta Sans, Arial" font-size="34" fill="#94a3b8" font-weight="700">
        No image
      </text>
      <text x="400" y="300" text-anchor="middle" font-family="Plus Jakarta Sans, Arial" font-size="18" fill="#94a3b8">
        (URL failed to load)
      </text>
    </svg>`
  );

export default function ServicesPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '' });
  const [priceMax, setPriceMax] = useState('');
  const [minAvgRating, setMinAvgRating] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', price: '', imageUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [apiStatus, setApiStatus] = useState('Checking backend…');

  const isProvider = user?.role?.toLowerCase() === 'provider';
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isCustomer = user?.role?.toLowerCase() === 'customer';
  const canWrite = isProvider || isAdmin;

  const canManageService = (s) => {
    if (isAdmin) return true;
    if (isProvider) return Number(s.providerId) === Number(user?.id);
    return false;
  };

  const fetchServices = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.category.trim()) params.set('category', filters.category.trim());
    if (filters.location.trim()) params.set('location', filters.location.trim());

    const cap = Number(priceMax);
    if (priceMax.trim() && !Number.isNaN(cap) && cap > 0) params.set('maxPrice', String(cap));

    const floor = Number(minAvgRating);
    if (minAvgRating && !Number.isNaN(floor) && floor >= 1 && floor <= 5) {
      params.set('minAvgRating', String(floor));
    }

    const { ok, data } = await api.getServices(params.toString(), token);
    if (ok) {
      setServices(Array.isArray(data) ? data : []);
      setApiStatus('Backend connected ✓');
      setGlobalError('');
    } else {
      setServices([]);
      setApiStatus('Backend offline (start backend on port 5000)');
      setGlobalError(data?.error || 'Backend offline.');
    }
  }, [filters.category, filters.location, priceMax, minAvgRating, token]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedCategoryFilter = filters.category.trim().toLowerCase();
  const normalizedLocationFilter = filters.location.trim().toLowerCase();
  const visibleServices = services.filter(s => {
    const category = String(s.categoryName || s.category || '').toLowerCase();
    const location = String(s.location || '').toLowerCase();
    const title = String(s.title || '').toLowerCase();
    const description = String(s.description || '').toLowerCase();
    const providerName = String(s.providerName || '').toLowerCase();

    if (normalizedCategoryFilter && !category.includes(normalizedCategoryFilter)) return false;
    if (normalizedLocationFilter && !location.includes(normalizedLocationFilter)) return false;

    if (!normalizedSearch) return true;
    return title.includes(normalizedSearch) || description.includes(normalizedSearch)
      || category.includes(normalizedSearch) || providerName.includes(normalizedSearch);
  });

  const handleToggleFavorite = async (svc) => {
    if (!isCustomer || !token) return;
    const pid = Number(svc.providerId);
    if (!pid) return;
    const nextFavorite = !svc.isFavorite;
    const { ok, data } = nextFavorite
      ? await api.addFavorite(pid, token)
      : await api.removeFavorite(pid, token);
    if (!ok) {
      setGlobalError(data?.error || 'Favorites unavailable (PostgreSQL migrations required).');
      return;
    }
    fetchServices();
  };

  const hasAdvancedFilters = !!(priceMax.trim() || minAvgRating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    const parsedPrice = Number(form.price);
    if (!form.price || isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }
    if (!token) { navigate('/login'); return; }

    const { ok, data } = editingId
      ? await api.updateService(editingId, form, token)
      : await api.createService(form, token);

    if (!ok) { setFormError(data?.error || (editingId ? 'Update failed.' : 'Create failed.')); return; }
    setForm({ title: '', description: '', category: '', location: '', price: '', imageUrl: '' });
    setEditingId(null);
    fetchServices();
  };

  const handleEdit = (s) => {
    setForm({
      title:       s.title,
      description: s.description || '',
      category:    s.category    || '',
      location:    s.location    || '',
      price:       s.price,
      imageUrl:    s.imageUrl    || '',
    });
    setEditingId(s.id);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setGlobalError('');
    if (!token) { navigate('/login'); return; }
    const { ok, data } = await api.deleteService(id, token);
    if (!ok) { setGlobalError(data?.error || 'Delete failed.'); return; }
    fetchServices();
  };

  return (
    <div className="page page-services">
      <div className="page-hero">
        <h1>Marketplace</h1>
        <p>Browse local services, filter by category or city, and book providers you trust.</p>
      </div>

      <div className={`status-bar ${apiStatus.startsWith('Backend connected') ? 'ok' : 'bad'}`}>
        {apiStatus}
      </div>

      {globalError && <div className="error-banner" role="alert">{globalError}</div>}

      <section className="panel">
        <h2>Search &amp; filter</h2>
        <div className="row">
          <input placeholder="Filter by category" value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })} />
          <input placeholder="Filter by location" value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })} />
          {(filters.category.trim() || filters.location.trim()) && (
            <button
              type="button"
              className="ghost"
              onClick={() => setFilters({ category: '', location: '' })}
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="row" style={{ marginTop: '0.75rem' }}>
          <input
            placeholder="Search by service title or description"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm.trim() && (
            <button type="button" className="ghost" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          )}
        </div>
        <div className="row" style={{ marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="filter-max-price" style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Max price (EUR)
            </label>
            <input
              id="filter-max-price"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 100"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              style={{ maxWidth: '160px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label htmlFor="filter-min-rating" style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Provider rating
            </label>
            <select
              id="filter-min-rating"
              value={minAvgRating}
              onChange={(e) => setMinAvgRating(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">⭐ Any rating</option>
              <option value="3">⭐ 3+ stars</option>
              <option value="4">⭐ 4+ stars</option>
              <option value="5">⭐ 5 stars only</option>
            </select>
          </div>
          {hasAdvancedFilters && (
            <button type="button" className="ghost" style={{ alignSelf: 'flex-end' }} onClick={() => { setPriceMax(''); setMinAvgRating(''); }}>
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Add / Edit Form */}
      {canWrite ? (
        <section className="panel">
          <h2>{editingId ? '✏️ Edit Service' : '➕ Add New Service'}</h2>
          {formError && <p className="error">{formError}</p>}
          <form onSubmit={handleSubmit} className="form-grid">
            <input placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <input placeholder="Price (EUR) *" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input
              placeholder="Image URL (optional — paste a direct photo link)"
              value={form.imageUrl}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })}
            />
            {form.imageUrl && (
              <div className="img-preview-wrap">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="img-preview"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Update Service' : 'Add Service'}</button>
              {editingId && (
                <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm({ title: '', description: '', category: '', location: '', price: '', imageUrl: '' }); setFormError(''); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      ) : (
        !user && (
          <section className="panel info-panel">
            <p>🔒 <strong>Log in</strong> as a Provider or Admin to add and manage services.</p>
          </section>
        )
      )}

      {/* Services List */}
      <section className="panel">
        <h2>Services ({visibleServices.length})</h2>
        <div className="cards-grid">
          {visibleServices.length === 0 && <p className="empty">No services found.</p>}
          {visibleServices.map(s => (
            <article key={s.id} className="card service-card">
              {/* Category hero image */}
              <div className="card-img-wrap">
                <img
                  src={s.imageUrl || IMAGE_PLACEHOLDER}
                  alt={s.category || 'Service'}
                  className="card-img"
                  loading="lazy"
                  onError={e => {
                    e.currentTarget.src = IMAGE_PLACEHOLDER;
                  }}
                />
                {s.category && (
                  <span className="card-img-badge">{s.category}</span>
                )}
              </div>
              <div className="card-body">
                <h3>{s.title}</h3>
                <p className="card-desc">{s.description || 'No description provided.'}</p>
                <div className="card-meta">
                  <span className="tag">📍 {s.location || '—'}</span>
                </div>
                {s.providerId && (
                  <p className="card-meta-small" style={{ marginTop: '0.45rem' }}>
                    <strong>Provider</strong>{' '}
                    <Link to={`/providers/${s.providerId}`} style={{ fontWeight: 600, color: '#38bdf8' }}>
                      {s.providerName || `Professional #${s.providerId}`}
                    </Link>
                    {typeof s.providerAvgRating === 'number' && !Number.isNaN(s.providerAvgRating) ? (
                      <span> · ★ {Number(s.providerAvgRating).toFixed(1)}
                        ({s.providerReviewCount ?? 0} reviews)</span>
                    ) : (
                      <span style={{ opacity: 0.7 }}> · not rated yet</span>
                    )}
                  </p>
                )}
              </div>
              <div className="card-footer">
                <strong className="price">{s.price} EUR</strong>
                {!canManageService(s) && user && (
                  <>
                    {isCustomer && token && (
                      <button
                        type="button"
                        className="ghost"
                        title={s.isFavorite ? 'Remove from favorites' : 'Save provider'}
                        aria-label={s.isFavorite ? 'Remove from favorites' : 'Add provider to favorites'}
                        onClick={() => handleToggleFavorite(s)}
                      >
                        {s.isFavorite ? '♥' : '♡'}
                      </button>
                    )}
                    <button
                      className="btn-book"
                      onClick={() => navigate('/bookings', {
                        state: {
                          serviceId: s.id,
                          providerId: s.providerId,
                          serviceTitle: s.title,
                          serviceAreaHint: s.location?.trim() || '',
                        },
                      })}
                    >
                      Book
                    </button>
                  </>
                )}
                {canManageService(s) && (
                  <div className="card-actions">
                    <button onClick={() => handleEdit(s)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(s.id)}>Delete</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
