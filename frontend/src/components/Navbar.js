import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const path = location.pathname;

  const isActive = (to) => {
    if (to === '/') return path === '/';
    return path === to || path.startsWith(`${to}/`);
  };

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  const linkClass = (to) => (isActive(to) ? 'nav-link nav-link-active' : 'nav-link');

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <BrandLogo compact />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="sr-only">Menu</span>
        </button>

        <div
          id="primary-navigation"
          className={`navbar-collapse ${open ? 'is-open' : ''}`}
        >
          <div className="navbar-links">
            <Link to="/" className={linkClass('/')} onClick={closeMenu}>Home</Link>
            <Link to="/services" className={linkClass('/services')} onClick={closeMenu}>Marketplace</Link>
            {user && (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')} onClick={closeMenu}>Dashboard</Link>
                <Link to="/bookings" className={linkClass('/bookings')} onClick={closeMenu}>Bookings</Link>
              </>
            )}
            <Link to="/reviews" className={linkClass('/reviews')} onClick={closeMenu}>Reviews</Link>
          </div>

          <div className="navbar-auth">
            {user ? (
              <>
                <div className="navbar-user" title={user.email}>
                  <span className="navbar-user-name">{user.name || user.email}</span>
                  <span className={`role-badge role-badge-${String(user.role).toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>
                <button type="button" className="btn-logout" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-nav" onClick={closeMenu}>Log in</Link>
                <Link to="/register" className="btn-nav primary" onClick={closeMenu}>Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
