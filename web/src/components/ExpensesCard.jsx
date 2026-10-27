import { useI18n } from '../i18n/index.jsx';
import Icon from './Icon.jsx';
import { money } from '../utils/format.js';

export default function ExpensesCard({ title, categories, paidToFirms, total }) {
  const { t } = useI18n();
  return (
    <section className="card">
      <h3 className="card-title"><Icon name="file" />{t('ҲАРОҶОТ')} · {title}</h3>

      <ul className="rows">
        {categories.map((c, i) => (
          <li key={c.categoryId} className={`row tone-${i % 4}`}>
            <span><Icon name={['zap', 'building', 'users', 'sparkles'][i % 4]} tone={['green', 'orange', 'blue', 'yellow'][i % 4]} />{t(c.categoryName)}</span>
            <strong>{money(c.total)}</strong>
          </li>
        ))}
        <li className="row tone-4">
          <span><Icon name="store" tone="green" />{t('Пардохт ба фирмаҳо')}</span>
          <strong>{money(paidToFirms)}</strong>
        </li>
      </ul>

      <div className="row row-total">
        <span>{t('Ҳароҷоти умумӣ')}</span>
        <strong>{money(total)}</strong>
      </div>
    </section>
  );
}
