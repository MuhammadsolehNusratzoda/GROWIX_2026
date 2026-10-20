const LABELS = {
  report: { icon: '📊', text: 'Ҳисобот' },
  today: { icon: '🏠', text: 'Имрӯз' },
  sales: { icon: '💰', text: 'Фурӯш' },
  expenses: { icon: '🧾', text: 'Хароҷот' },
  firms: { icon: '🏢', text: 'Фирмаҳо' },
  users: { icon: '👥', text: 'Корбарон' },
  profile: { icon: '👤', text: 'Профил' },
};

export default function BottomNav({ tabs, active, onChange }) {
  return (
    <nav className="bottom-nav">
      {tabs.map((key) => (
        <button
          key={key}
          className={`nav-item ${active === key ? 'active' : ''}`}
          onClick={() => onChange(key)}
        >
          <span className="nav-icon">{LABELS[key].icon}</span>
          <span className="nav-text">{LABELS[key].text}</span>
        </button>
      ))}
    </nav>
  );
}
