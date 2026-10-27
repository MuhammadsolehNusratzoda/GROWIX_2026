import { useI18n } from '../i18n/index.jsx';
import Icon from './Icon.jsx';
import { money } from '../utils/format.js';

export default function FirmSharesCard({ title, firms }) {
  const { t } = useI18n();
  return (
    <section className="card">
      <h3 className="card-title"><Icon name="folder" />{t('Тақсимоти маблағ ба фирмаҳо')}</h3>
      <p className="card-sub">{t('Пардохтҳо')} · {title}</p>

      {firms.length === 0 ? (
        <p className="empty">{t('Дар ин моҳ пардохт ба фирмаҳо нест')}</p>
      ) : (
        <ul className="rows">
          {firms.map((f) => (
            <li key={f.firmId} className="row row-firm">
              <span><Icon name="store" tone="green" />{f.firmName}</span>
              <strong className="green">{money(f.total)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
