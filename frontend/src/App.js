import { useEffect, useState } from 'react';

function App() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    price: ''
  });

  // GET services
  const fetchServices = async () => {
    const res = await fetch('http://localhost:5000/api/services');
    const data = await res.json();
    setServices(data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // POST service
  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('http://localhost:5000/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setForm({ title: '', category: '', location: '', price: '' });
    fetchServices();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Services</h1>

      {/* LIST */}
      <ul>
        {services.map(s => (
          <li key={s.id}>
            {s.title} - {s.category} - {s.location} - {s.price}€
          </li>
        ))}
      </ul>

      <h2>Add Service</h2>

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

        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default App;
