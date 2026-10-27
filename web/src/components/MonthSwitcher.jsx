import { useI18n } from '../i18n/index.jsx';
export default function MonthSwitcher({ title, label, onPrev, onNext, nextDisabled }) {
  const { t } = useI18n();
  return (
    <div className="month-switcher">
      <button className="month-btn" onClick={onPrev} aria-label={t('Моҳи гузашта')}>‹</button>
      <h2 className="month-label">{title ?? t('Ҳисоботи Моҳона')} · {label}</h2>
      <button className="month-btn" onClick={onNext} disabled={nextDisabled} aria-label={t('Моҳи оянда')}>›</button>
    </div>
  );
}
