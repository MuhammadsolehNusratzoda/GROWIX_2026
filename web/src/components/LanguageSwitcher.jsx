import { LANGS, useI18n } from '../i18n/index.jsx';

// Интихоби забон: TJ | EN | RU
export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t('Забон')}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={lang === l.code ? 'active' : ''}
          title={l.label}
          onClick={() => setLang(l.code)}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
