import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ServicesPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ category: '', location: '' });
  const [findId, setFindId] = useState('');
  const [foundService, setFoundService] = useState(null);
  const [findError, setFindError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', price: '' });
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

  const handleFindById = async (e) => {
    e.preventDefault();
    setFindError(''); setFoundService(null);
    const numId = Number(findId);
    if (!findId.trim() || isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
      setFindError('Please enter a valid ID (positive integer).');
      return;
    }
    const { ok, data } = await api.getServiceById(numId);
    if (!ok) { setFindError(data?.error || `No service with id ${numId}.`); return; }
    setFoundService(data);
  };

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
    setForm({ title: '', description: '', category: '', location: '', price: '' });
    setEditingId(null);
    fetchServices();
  };

  const handleEdit = (s) => {
    setForm({ title: s.title, description: s.description || '', category: s.category, location: s.location, price: s.price });
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
        <form onSubmit={handleFindById} className="row" style={{ marginTop: '0.75rem' }}>
          <input placeholder="Find by ID (number)" value={findId}
            onChange={e => setFindId(e.target.value)} />
          <button type="submit">Find</button>
        </form>
        {findError && <p className="error">{findError}</p>}
        {foundService && (
          <div className="found-card">
            <strong>{foundService.title}</strong> — {foundService.category}, {foundService.location} — <strong>{foundService.price} EUR</strong>
            <p className="found-desc">{foundService.description}</p>
          </div>
        )}
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
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Update Service' : 'Add Service'}</button>
              {editingId && (
                <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm({ title: '', description: '', category: '', location: '', price: '' }); setFormError(''); }}>
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
        <h2>Services ({services.length})</h2>
        <div className="cards-grid">
          {services.length === 0 && <p className="empty">No services found.</p>}
          {services.map(s => (
            <article key={s.id} className="card">
              <div className="card-body">
                <h3>{s.title}</h3>
                <p className="card-desc">{s.description || 'No description provided.'}</p>
                <div className="card-meta">
                  <span className="tag">{s.category || 'General'}</span>
                  <span className="tag">📍 {s.location || '—'}</span>
                </div>
              </div>
              <div className="card-footer">
                <strong className="price">{s.price} EUR</strong>
                {!canManageService(s) && user && (
                  <button className="btn-book" onClick={() => navigate('/bookings', { state: { serviceId: s.id, providerId: s.providerId } })}>
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
