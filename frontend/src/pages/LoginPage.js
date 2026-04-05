import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    const { ok, data } = await api.login(form);
    setLoading(false);
    if (!ok) {
      setError(data?.error || 'Login failed.');
      return;
    }
    login(data.user, data.token);
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">🔑</div>
        <h1>Welcome Back</h1>
        <p className="auth-sub">Sign in to your account</p>

        {error && <div className="error-banner" role="alert">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input
              id="login-email"
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
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          <button id="login-submit" type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
