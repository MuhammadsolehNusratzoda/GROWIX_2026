import { money } from '../utils/format.js';

export default function ExpensesCard({ title, categories, paidToFirms, total }) {
  return (
    <section className="card">
      <h3 className="card-title">ҲАРОҶОТ · {title}</h3>

      <ul className="rows">
        {categories.map((c, i) => (
          <li key={c.categoryId} className={`row tone-${i % 4}`}>
            <span>{c.categoryName}</span>
            <strong>{money(c.total)}</strong>
          </li>
        ))}
        <li className="row tone-4">
          <span>Пардохт ба фирмаҳо</span>
          <strong>{money(paidToFirms)}</strong>
        </li>
      </ul>

      <div className="row row-total">
        <span>Ҳароҷоти умумӣ</span>
        <strong>{money(total)}</strong>
      </div>
    </section>
  );
}
