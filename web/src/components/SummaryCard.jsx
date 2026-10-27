import { money } from '../utils/format.js';

export default function SummaryCard({ revenue, paidToFirms }) {
  return (
    <section className="card summary">
      <div className="summary-item">
        <div className="summary-label">Даромадҳои умумӣ</div>
        <div className="summary-value">{money(revenue)}</div>
      </div>
      <div className="summary-divider" />
      <div className="summary-item">
        <div className="summary-label">Ба фирма дода шуд</div>
        <div className="summary-value">{money(paidToFirms)}</div>
      </div>
    </section>
  );
}
