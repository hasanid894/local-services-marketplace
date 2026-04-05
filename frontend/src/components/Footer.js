import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from './BrandLogo';

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo-link">
            <BrandMark size={36} />
            <span className="footer-brand-text">
              <span className="footer-brand-name">Local Services</span>
              <span className="footer-brand-sub">Marketplace</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Connecting people in Kosovo with local professionals — book services, track jobs, and read verified-style feedback.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <div className="footer-col">
            <h3 className="footer-heading">Explore</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Marketplace</Link></li>
              <li><Link to="/reviews">Reviews</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3 className="footer-heading">Account</h3>
            <ul>
              {user ? (
                <>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                  <li><Link to="/bookings">Bookings</Link></li>
                </>
              ) : null}
              <li><Link to="/login">Log in</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          © {year} Local Services Marketplace. Academic / demonstration project.
        </p>
      </div>
    </footer>
  );
}
