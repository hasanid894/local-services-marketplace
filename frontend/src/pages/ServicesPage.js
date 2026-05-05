import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', price: '', imageUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [apiStatus, setApiStatus] = useState('Checking backend…');

  const isProvider = user?.role?.toLowerCase() === 'provider';
  const isAdmin = user?.role?.toLowerCase() === 'admin';
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

    const { ok, data } = await api.getServices(params.toString(), token);
    if (ok) {
      setServices(data);
      setApiStatus('Backend connected ✓');
      setGlobalError('');
    } else {
      setServices([]);
      setApiStatus('Backend offline (start backend on port 5000)');
      setGlobalError(data?.error || 'Backend offline.');
    }
  }, [filters, token]);

  useEffect(() => { fetchServices(); }, []);

  const handleFilter = (e) => { e.preventDefault(); fetchServices(); };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleServices = services.filter(s => {
    if (!normalizedSearch) return true;
    const title = String(s.title || '').toLowerCase();
    const description = String(s.description || '').toLowerCase();
    const category = String(s.categoryName || s.category || '').toLowerCase();
    return (
      title.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      category.includes(normalizedSearch)
    );
  });

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
        <form onSubmit={handleFilter} className="row">
          <input placeholder="Filter by category" value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })} />
          <input placeholder="Filter by location" value={filters.location}
            onChange={e => setFilters({ ...filters, location: e.target.value })} />
          <button type="submit">Apply</button>
          <button type="button" className="ghost" onClick={() => { setFilters({ category: '', location: '' }); fetchServices(); }}>Clear</button>
        </form>
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
              </div>
              <div className="card-footer">
                <strong className="price">{s.price} EUR</strong>
                {!canManageService(s) && user && (
                  <button
                    className="btn-book"
                    onClick={() => navigate('/bookings', {
                      state: { serviceId: s.id, providerId: s.providerId, serviceTitle: s.title }
                    })}
                  >
                    Book
                  </button>
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
