import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Customer', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    const { ok, data } = await api.register(form);
    setLoading(false);
    if (!ok) {
      setError(data?.error || 'Registration failed.');
      return;
    }
    login(data.user, data.token);
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">🚀</div>
        <h1>Create Account</h1>
        <p className="auth-sub">Join the Local Services Marketplace</p>

        {error && <div className="error-banner" role="alert">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="Arta Berisha"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <label>Role</label>
            <select
              id="reg-role"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="Customer">Customer</option>
              <option value="Provider">Provider</option>
            </select>
          </div>
          <div className="field">
            <label>Location <span className="optional">(optional)</span></label>
            <input
              id="reg-location"
              type="text"
              placeholder="Prishtinë"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <button id="reg-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
