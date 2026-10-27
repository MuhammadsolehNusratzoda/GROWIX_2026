import { useI18n } from '../i18n/index.jsx';
import Icon from './Icon.jsx';
const LABELS = {
  report: { icon: 'chart', text: 'Ҳисобот' },
  today: { icon: 'home', text: 'Имрӯз' },
  sales: { icon: 'wallet', text: 'Фурӯш' },
  expenses: { icon: 'receipt', text: 'Хароҷот' },
  firms: { icon: 'building', text: 'Фирмаҳо' },
  products: { icon: 'box', text: 'Маҳсулот' },
  users: { icon: 'users', text: 'Корбарон' },
  profile: { icon: 'user', text: 'Профил' },
};

export default function BottomNav({ tabs, active, onChange }) {
  const { t } = useI18n();
  return (
    <nav className="bottom-nav">
      {tabs.map((key) => (
        <button
          key={key}
          className={`nav-item ${active === key ? 'active' : ''}`}
          onClick={() => onChange(key)}
        >
          <Icon name={LABELS[key].icon} size={22} />
          <span className="nav-text">{t(LABELS[key].text)}</span>
        </button>
      ))}
    </nav>
  );
}
