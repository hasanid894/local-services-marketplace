import { useEffect, useState } from 'react';

function App() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    price: ''
  });

  const [editingId, setEditingId] = useState(null);

  const fetchServices = async () => {
    const res = await fetch('http://localhost:5000/api/services');
    const data = await res.json();
    setServices(data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      // UPDATE
      await fetch(`http://localhost:5000/api/services/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } else {
      // CREATE
      await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    }

    setForm({ title: '', category: '', location: '', price: '' });
    setEditingId(null);
    fetchServices();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/services/${id}`, {
      method: 'DELETE'
    });

    fetchServices();
  };

  const handleEdit = (service) => {
    setForm({
      title: service.title,
      category: service.category,
      location: service.location,
      price: service.price
    });

    setEditingId(service.id);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Services</h1>

      {/* LIST */}
      <ul>
        {services.map(s => (
          <li key={s.id}>
            {s.title} - {s.category} - {s.location} - {s.price}€

            <button onClick={() => handleEdit(s)}>Edit</button>
            <button onClick={() => handleDelete(s.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>{editingId ? 'Edit Service' : 'Add Service'}</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <br />

        <input
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />
        <br />

        <input
          placeholder="Location"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
        />
        <br />

        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />
        <br />

        <button type="submit">
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>
    </div>
  );
}

export default App;
