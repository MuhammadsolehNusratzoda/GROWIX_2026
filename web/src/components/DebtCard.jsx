import { money } from '../utils/format.js';

// Қарзи ҳозираи мо ба фирмаҳо (барои тамоми вақт)
export default function DebtCard({ balances }) {
  const withDebt = balances.firms.filter((f) => f.debt > 0);

  return (
    <section className="card">
      <h3 className="card-title">💳 Қарз ба фирмаҳо</h3>
      <div className="list-total">
        <span>Қарзи умумӣ</span>
        <strong className={balances.totalDebt > 0 ? 'debt-red' : 'green'}>{money(balances.totalDebt)}</strong>
      </div>
      {withDebt.length === 0 ? (
        <p className="empty">Қарз нест ✓</p>
      ) : (
        <ul className="records">
          {withDebt.map((f) => (
            <li key={f.firmId} className="record">
              <div className="record-main">
                <div className="record-title">{f.firmName}</div>
              </div>
              <div className="record-amount debt-red">{money(f.debt)}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
