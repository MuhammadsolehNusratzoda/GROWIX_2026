import { useI18n } from '../i18n/index.jsx';
import Icon from './Icon.jsx';
import { money } from '../utils/format.js';

export default function SummaryCard({ revenue, paidToFirms }) {
  const { t } = useI18n();
  return (
    <section className="card summary">
      <div className="summary-item">
        <div className="summary-label"><Icon name="trend" tone="green" />{t('Даромадҳои умумӣ')}</div>
        <div className="summary-value">{money(revenue)}</div>
      </div>
      <div className="summary-divider" />
      <div className="summary-item">
        <div className="summary-label"><Icon name="store" tone="green" />{t('Ба фирма дода шуд')}</div>
        <div className="summary-value">{money(paidToFirms)}</div>
      </div>
    </section>
  );
}
