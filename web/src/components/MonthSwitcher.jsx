export default function MonthSwitcher({ title = 'Ҳисоботи Моҳона', label, onPrev, onNext, nextDisabled }) {
  return (
    <div className="month-switcher">
      <button className="month-btn" onClick={onPrev} aria-label="Моҳи гузашта">‹</button>
      <h2 className="month-label">{title} · {label}</h2>
      <button className="month-btn" onClick={onNext} disabled={nextDisabled} aria-label="Моҳи оянда">›</button>
    </div>
  );
}
