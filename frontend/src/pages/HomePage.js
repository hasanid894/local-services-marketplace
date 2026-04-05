import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Consistent stroke icons for the marketing page */
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconStar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconBriefcase(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}
function IconArrowRight({ className, ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const CATEGORIES = [
  'Plumbing', 'Electrical', 'Cleaning', 'Tutoring', 'Handyman', 'IT support', 'Beauty & wellness', 'Moving',
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-bg" aria-hidden="true" />
        <div className="home-hero-inner">
          <p className="home-eyebrow">Local Services Marketplace · Kosovo</p>
          <h1 className="home-title">
            Hire trusted local professionals for your home, studies, and everyday tasks.
          </h1>
          <p className="home-lead">
            Compare listings by category and city, send a booking request in minutes, and follow the job
            from request to completion. Reviews help everyone make better choices.
          </p>
          <ul className="home-hero-bullets">
            <li><IconSearch className="home-bullet-icon" /> Search &amp; filter the catalog</li>
            <li><IconCalendar className="home-bullet-icon" /> Schedule and track bookings</li>
            <li><IconStar className="home-bullet-icon" /> Rate providers after service</li>
          </ul>
          <div className="home-cta">
            <Link to="/services" className="btn-pill btn-pill-primary">
              Browse marketplace
              <IconArrowRight className="btn-pill-icon" />
            </Link>
            {!user && (
              <Link to="/register" className="btn-pill btn-pill-ghost">Create an account</Link>
            )}
            {user && (
              <Link to="/dashboard" className="btn-pill btn-pill-ghost">Open your dashboard</Link>
            )}
          </div>
        </div>
      </section>

      <section className="home-features" aria-labelledby="home-features-title">
        <h2 id="home-features-title" className="home-section-title">Why use this platform</h2>
        <p className="home-section-lead">
          Built for clarity: fewer steps, clearer status, and feedback you can trust.
        </p>
        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon-wrap">
              <IconSearch width={28} height={28} />
            </div>
            <h3>Focused discovery</h3>
            <p>Narrow results by category and location so you spend less time scrolling and more time deciding.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon-wrap">
              <IconCalendar width={28} height={28} />
            </div>
            <h3>Booking lifecycle</h3>
            <p>From pending to approved, completed, or declined — you always see where things stand.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon-wrap">
              <IconStar width={28} height={28} />
            </div>
            <h3>Community reviews</h3>
            <p>Star ratings and comments reward great providers and help others avoid bad experiences.</p>
          </article>
        </div>
      </section>

      <section className="home-how" aria-labelledby="home-how-title">
        <h2 id="home-how-title" className="home-section-title">How it works</h2>
        <ol className="how-steps">
          <li className="how-step">
            <span className="how-step-num" aria-hidden="true">1</span>
            <div className="how-step-body">
              <h3>Browse &amp; compare</h3>
              <p>Open the marketplace, filter by what you need, and read descriptions and prices.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="how-step-num" aria-hidden="true">2</span>
            <div className="how-step-body">
              <h3>Request a booking</h3>
              <p>Pick a service, choose a date, and add a short note — providers get notified to review.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="how-step-num" aria-hidden="true">3</span>
            <div className="how-step-body">
              <h3>Stay in sync</h3>
              <p>Follow status updates in your dashboard until the job is marked complete.</p>
            </div>
          </li>
          <li className="how-step">
            <span className="how-step-num" aria-hidden="true">4</span>
            <div className="how-step-body">
              <h3>Leave a review</h3>
              <p>After completion, share honest feedback to help the next customer.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="home-categories" aria-labelledby="home-cat-title">
        <h2 id="home-cat-title" className="home-section-title">Popular categories</h2>
        <p className="home-section-lead">
          Examples of services you might find — actual listings depend on providers in your area.
        </p>
        <div className="category-pills">
          {CATEGORIES.map((c) => (
            <span key={c} className="category-pill">{c}</span>
          ))}
        </div>
        <div className="home-categories-cta">
          <Link to="/services" className="link-arrow">See live listings on the marketplace →</Link>
        </div>
      </section>

      <section className="home-roles">
        <div className="home-roles-inner">
          <div className="home-roles-copy">
            <h2 className="home-section-title">Customers &amp; providers</h2>
            <p className="home-roles-text">
              When you register, you join as a <strong>customer</strong> (book and review) or a{' '}
              <strong>provider</strong> (list services and manage incoming jobs). Each role gets a tailored
              dashboard — bookings, listings, and metrics in one place.
            </p>
            <p className="home-roles-note">
              <IconShield width={18} height={18} className="home-roles-note-icon" aria-hidden="true" />
              <span>
                <strong>Trust &amp; safety</strong> are handled by the platform team behind the scenes — moderation,
                support, and policy enforcement are not public “roles” you sign up for, which is why we do not
                advertise an admin persona on the home page.
              </span>
            </p>
            <Link to="/services" className="link-arrow">Explore the marketplace →</Link>
          </div>
          <ul className="role-chips role-chips-large">
            <li>
              <span className="role-chip role-chip-customer">
                <IconUsers width={16} height={16} className="role-chip-icon" aria-hidden="true" />
                Customer
              </span>
              <span className="role-chip-desc">Book services, track requests, post reviews.</span>
            </li>
            <li>
              <span className="role-chip role-chip-provider">
                <IconBriefcase width={16} height={16} className="role-chip-icon" aria-hidden="true" />
                Provider
              </span>
              <span className="role-chip-desc">Publish listings, approve jobs, build reputation.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="home-trust" aria-labelledby="home-trust-title">
        <h2 id="home-trust-title" className="home-section-title">Built for transparency</h2>
        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon-wrap"><IconShield width={26} height={26} /></div>
            <h3>Clear rules</h3>
            <p>Statuses and responsibilities are explicit so both sides know what to expect.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon-wrap"><IconStar width={26} height={26} /></div>
            <h3>Reputation signals</h3>
            <p>Reviews tie to completed work so feedback is more meaningful than anonymous stars.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon-wrap"><IconUsers width={26} height={26} /></div>
            <h3>Local focus</h3>
            <p>Location and category filters keep results relevant to your area.</p>
          </div>
        </div>
      </section>

      <section className="home-cta-banner">
        <div className="home-cta-banner-inner">
          <div>
            <h2 className="home-cta-banner-title">Ready to get started?</h2>
            <p className="home-cta-banner-text">
              Browse open listings or create an account to book and manage everything in one place.
            </p>
          </div>
          <div className="home-cta-banner-actions">
            <Link to="/services" className="btn-pill btn-pill-primary">Go to marketplace</Link>
            {!user && <Link to="/register" className="btn-pill btn-pill-ghost">Sign up free</Link>}
          </div>
        </div>
      </section>
    </div>
  );
}
