/**
 * Metric tile for dashboards — icon is a small React node (SVG or emoji).
 */
export default function StatCard({ icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" aria-hidden="true">{icon}</div>
      <div className="stat-card-body">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {hint ? <span className="stat-hint">{hint}</span> : null}
      </div>
    </div>
  );
}
