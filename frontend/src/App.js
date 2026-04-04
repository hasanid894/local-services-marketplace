import { useEffect, useState, useCallback } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api/services';

// ── Safe fetch helper ────────────────────────────────────────────────────────
// Case 2: frontend fetch fails (backend offline, network error, non-JSON response)
// → shows a clear UI message and keeps the UI fully usable. Never throws to the UI.
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);

    let body = null;
    try {
      body = await res.json();
    } catch {
      // non-JSON response body — treat as empty
      body = {};
    }

    return { ok: res.ok, status: res.status, data: body };
  } catch (networkErr) {
    // Network failure (backend offline, CORS, DNS, etc.)
    return {
      ok: false,
      status: 0,
      data: { error: 'Request failed — backend may be offline.' }
    };
  }
}

function App() {
  const [role, setRole] = useState('customer');
  const [userId, setUserId] = useState('1');
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    price: ''
  });
  const [filters, setFilters] = useState({ category: '', location: '' });
  const [findId, setFindId] = useState('');
  const [foundService, setFoundService] = useState(null);
  const [findError, setFindError] = useState('');
  const [formError, setFormError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [apiStatus, setApiStatus] = useState('Checking backend...');
  const [editingId, setEditingId] = useState(null);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-role': role,
    'x-user-id': userId
  });

  const canManageService = (service) => {
    if (role === 'admin') return true;
    if (role === 'provider') return Number(service.providerId) === Number(userId);
    return false;
  };

  const fetchServices = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.category.trim()) params.set('category', filters.category.trim());
    if (filters.location.trim()) params.set('location', filters.location.trim());

    const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
    const { ok, data } = await safeFetch(url);

    if (ok) {
      setServices(data);
      setApiStatus('Backend connected ✓');
      setGlobalError('');
    } else {
      setServices([]);
      // Case 2: clear message — backend offline / request failed
      const msg = data?.error || 'Request failed.';
      setApiStatus('Backend offline (start backend on port 5000)');
      setGlobalError(`Backend offline — ${msg}`);
    }
  }, [filters]);

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Frontend validation — clear messages before hitting the API
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    const parsedPrice = Number(form.price);
    if (!form.price || isNaN(parsedPrice)) {
      setFormError('Please enter a valid number for price.');
      return;
    }
    if (parsedPrice <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }

    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
    const method = editingId ? 'PUT' : 'POST';

    const { ok, data } = await safeFetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(form)
    });

    if (!ok) {
      // Show the backend's error message directly in the form area
      setFormError(data?.error || (editingId ? 'Update failed.' : 'Create failed.'));
      return;
    }

    setForm({ title: '', description: '', category: '', location: '', price: '' });
    setEditingId(null);
    fetchServices();
  };

  const handleDelete = async (id) => {
    setGlobalError('');
    const { ok, data } = await safeFetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (!ok) {
      // Case 3: 404 — "Item not found", don't silently fail
      setGlobalError(data?.error || 'Delete failed.');
      return;
    }
    fetchServices();
  };

  const handleEdit = (service) => {
    setForm({
      title: service.title,
      description: service.description || '',
      category: service.category,
      location: service.location,
      price: service.price
    });
    setEditingId(service.id);
    setFormError('');
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    await fetchServices();
  };

  const handleFindById = async (e) => {
    e.preventDefault();
    setFindError('');
    setFoundService(null);

    if (!findId.trim()) {
      setFindError('Please enter an ID.');
      return;
    }

    // Case 3: validate numeric ID on the frontend before calling the API
    const numId = Number(findId);
    if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
      setFindError('Please enter a valid ID (positive integer).');
      return;
    }

    const { ok, data } = await safeFetch(`${API_BASE}/${numId}`);

    if (!ok) {
      // Case 3: show backend's 404 message; don't silently fail
      setFindError(data?.error || `Item not found: no service with id ${numId}.`);
      return;
    }

    setFoundService(data);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Local Services Marketplace</h1>
          <p className={apiStatus.startsWith('Backend connected') ? 'ok' : 'bad'}>
            {apiStatus}
          </p>
          <div className="row">
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
            <input
              placeholder="User ID"
              type="number"
              value={userId}
              onChange={e => setUserId(e.target.value)}
            />
          </div>
        </header>

        {/* Global error banner (backend offline, delete errors, etc.) */}
        {globalError && (
          <div className="error-banner" role="alert">
            ⚠️ {globalError}
          </div>
        )}

        {/* ── Search & Filter ── */}
        <section className="panel">
          <h2>Search &amp; Filter</h2>
          <form onSubmit={handleFilter} className="row">
            <input
              placeholder="Filter by category"
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
            />
            <input
              placeholder="Filter by location"
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
            />
            <button type="submit">Apply</button>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setFilters({ category: '', location: '' });
                fetchServices();
              }}
            >
              Clear
            </button>
          </form>

          <form onSubmit={handleFindById} className="row" style={{ marginTop: '0.75rem' }}>
            <input
              placeholder="Find by ID"
              value={findId}
              onChange={e => setFindId(e.target.value)}
            />
            <button type="submit">Find</button>
          </form>

          {findError && <p className="error">{findError}</p>}

          {foundService && (
            <div className="found">
              Found: <strong>{foundService.title}</strong> in {foundService.location} ({foundService.price} EUR)
            </div>
          )}
        </section>

        {/* ── Add / Edit Form ── */}
        {(role === 'provider' || role === 'admin') ? (
          <section className="panel">
            <h2>{editingId ? 'Edit Service' : 'Add New Service'}</h2>
            {formError && <p className="error">{formError}</p>}
            <form onSubmit={handleSubmit} className="form-grid">
              <input
                placeholder="Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <input
                placeholder="Category"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              />
              <input
                placeholder="Location"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
              <input
                placeholder="Price"
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <button type="submit" className="primary">
                {editingId ? 'Update Service' : 'Add Service'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ title: '', description: '', category: '', location: '', price: '' });
                    setFormError('');
                  }}
                >
                  Cancel
                </button>
              )}
            </form>
          </section>
        ) : (
          <section className="panel">
            <h2>Read-Only Mode</h2>
            <p className="empty">
              Customer role can browse and find services, but cannot add, edit, or delete.
            </p>
          </section>
        )}

        {/* ── Services List ── */}
        <section className="panel">
          <h2>Services ({services.length})</h2>
          <div className="list">
            {services.length === 0 && (
              <p className="empty">No services found for the current filter.</p>
            )}
            {services.map(s => (
              <article key={s.id} className="card">
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.description || 'No description'}</p>
                  <small>{s.category} - {s.location}</small>
                </div>
                <div className="card-actions">
                  <strong>{s.price} EUR</strong>
                  {canManageService(s) && (
                    <>
                      <button onClick={() => handleEdit(s)}>Edit</button>
                      <button className="danger" onClick={() => handleDelete(s.id)}>Delete</button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
