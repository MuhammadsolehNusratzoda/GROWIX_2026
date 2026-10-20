import { money } from '../utils/format.js';

export default function FirmSharesCard({ title, firms }) {
  return (
    <section className="card">
      <h3 className="card-title">🗂️ Тақсимоти маблағ ба фирмаҳо</h3>
      <p className="card-sub">Пардохтҳо · {title}</p>

      {firms.length === 0 ? (
        <p className="empty">Дар ин моҳ пардохт ба фирмаҳо нест</p>
      ) : (
        <ul className="rows">
          {firms.map((f) => (
            <li key={f.firmId} className="row row-firm">
              <span>🏪 {f.firmName}</span>
              <strong className="green">{money(f.total)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
