import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🛠️ Local Services</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className={isActive('/') ? 'active' : ''}>Services</Link>
        {user && (
          <>
            <Link to="/bookings" className={isActive('/bookings') ? 'active' : ''}>Bookings</Link>
            <Link to="/reviews" className={isActive('/reviews') ? 'active' : ''}>Reviews</Link>
          </>
        )}
      </div>
      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">
              👤 {user.email} <span className="role-badge">{user.role}</span>
            </span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-nav">Login</Link>
            <Link to="/register" className="btn-nav primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
