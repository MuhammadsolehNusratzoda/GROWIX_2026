import { useI18n } from '../i18n/index.jsx';
import Icon from '../components/Icon.jsx';
import { getFirms } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import RecordRow from '../components/RecordRow.jsx';

export default function FirmsViewPage() {
  const { t } = useI18n();
  const { data: firms, loading, error } = useAsync(async () => (await getFirms({ PageSize: 100 })).items, []);

  return (
    <section className="card">
      <h3 className="card-title"><Icon name="building" tone="orange" />{t('Фирмаҳо')}</h3>
      {loading && <p className="state">{t('Бор карда истодааст…')}</p>}
      {error && <div className="state state-error">{error}</div>}
      {firms && firms.length === 0 && <p className="empty">{t('Фирма ҳанӯз нест')}</p>}
      {firms && firms.length > 0 && (
        <ul className="records">
          {firms.map((f) => (
            <RecordRow
              key={f.id}
              title={f.name}
              subtitle={[f.phone, f.address].filter(Boolean).join(' · ')}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
