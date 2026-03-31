import { useEffect, useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api/services';

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
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('Checking backend...');
  const [editingId, setEditingId] = useState(null);

  const authHeaders = () => ({
    'x-user-role': role,
    'x-user-id': userId
  });

  const canManageService = (service) => {
    if (role === 'admin') return true;
    if (role === 'provider') return Number(service.providerId) === Number(userId);
    return false;
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Backend returned an error.');
      const data = await res.json();
      setServices(data);
      setApiStatus('Backend connected');
    } catch (err) {
      setServices([]);
      setApiStatus('Backend offline (start backend on port 5000)');
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    if (editingId) {
      const res = await fetch(`${API_BASE}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Update failed.');
        return;
      }
    } else {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Create failed.');
        return;
      }
    }

    setForm({ title: '', description: '', category: '', location: '', price: '' });
    setEditingId(null);
    fetchServices();
  };

  const handleDelete = async (id) => {
    setError('');
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
      ,
      headers: authHeaders()
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || 'Delete failed.');
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
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    await fetchServices();
  };

  const handleFindById = async (e) => {
    e.preventDefault();
    setError('');
    setFoundService(null);

    if (!findId.trim()) {
      setError('Please enter an ID to find.');
      return;
    }

    const res = await fetch(`${API_BASE}/${findId}`);
    if (!res.ok) {
      setError('Service not found.');
      return;
    }

    const data = await res.json();
    setFoundService(data);
  };

  const filteredServices = services.filter(s => {
    const categoryOk = !filters.category.trim()
      || String(s.category || '').toLowerCase().includes(filters.category.trim().toLowerCase());
    const locationOk = !filters.location.trim()
      || String(s.location || '').toLowerCase().includes(filters.location.trim().toLowerCase());
    return categoryOk && locationOk;
  });

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

        {error && <p className="error">{error}</p>}

        <section className="panel">
          <h2>Search & Filter</h2>
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
                const cleared = { category: '', location: '' };
                setFilters(cleared);
                fetchServices();
              }}
            >
              Clear
            </button>
          </form>

          <form onSubmit={handleFindById} className="row">
            <input
              placeholder="Find by ID"
              value={findId}
              onChange={e => setFindId(e.target.value)}
            />
            <button type="submit">Find</button>
          </form>

          {foundService && (
            <div className="found">
              Found: <strong>{foundService.title}</strong> in {foundService.location} ({foundService.price} EUR)
            </div>
          )}
        </section>

        {(role === 'provider' || role === 'admin') ? (
          <section className="panel">
            <h2>{editingId ? 'Edit Service' : 'Add New Service'}</h2>
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
            </form>
          </section>
        ) : (
          <section className="panel">
            <h2>Read-Only Mode</h2>
            <p className="empty">Customer role can browse and find services, but cannot add, edit, or delete.</p>
          </section>
        )}

        <section className="panel">
          <h2>Services ({filteredServices.length})</h2>
          <div className="list">
            {filteredServices.length === 0 && (
              <p className="empty">No services found for the current filter.</p>
            )}
            {filteredServices.map(s => (
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
