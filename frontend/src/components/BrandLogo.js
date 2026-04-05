import { useId } from 'react';

/**
 * Brand mark: gradient tile + map pin (place-based local marketplace).
 */
export function BrandMark({ size = 40, className = '' }) {
  const gid = useId();
  const gradId = `brand-grad-${gid.replace(/:/g, '')}`;

  return (
    <svg
      className={`brand-mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gradId})`} />
      <path
        fill="#f8fafc"
        fillOpacity="0.96"
        d="M20 9.5c-2.9 0-5.2 2.2-5.2 4.9 0 3.8 5.2 9.6 5.2 9.6s5.2-5.8 5.2-9.6c0-2.7-2.3-4.9-5.2-4.9zm0 7.2a2.3 2.3 0 110-4.6 2.3 2.3 0 010 4.6z"
      />
    </svg>
  );
}

export default function BrandLogo({ compact = false }) {
  return (
    <span className={`brand-logo-lockup ${compact ? 'is-compact' : ''}`}>
      <BrandMark size={compact ? 32 : 36} />
      <span className="brand-logo-text">
        <span className="brand-logo-name">Local Services</span>
        <span className="brand-logo-sub">Marketplace</span>
      </span>
    </span>
  );
}
