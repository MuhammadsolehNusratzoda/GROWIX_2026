const LABELS = {
  report: { text: 'Ҳисобот' },
  today: { text: 'Имрӯз' },
  sales: { text: 'Фурӯш' },
  expenses: { text: 'Хароҷот' },
  firms: { text: 'Фирмаҳо' },
  products: { text: 'Маҳсулот' },
  users: { text: 'Корбарон' },
  profile: { text: 'Профил' },
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
          <span className="nav-text">{LABELS[key].text}</span>
        </button>
      ))}
    </nav>
  );
}
