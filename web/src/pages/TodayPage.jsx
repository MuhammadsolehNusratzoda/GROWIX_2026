import { useI18n } from '../i18n/index.jsx';
import { getSales } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { dayRange, inRange, todayLocal, formatDate } from '../utils/dates.js';
import { METHOD_LABELS, money } from '../utils/format.js';
import RecordRow from '../components/RecordRow.jsx';
import SaleForm from '../components/SaleForm.jsx';

export default function TodayPage() {
  const { t } = useI18n();
  const today = todayLocal();

  const { data: sales, loading, error, reload } = useAsync(async () => {
    const range = dayRange(today);
    const page = await getSales({
      From: range.from.toISOString(),
      To: range.to.toISOString(),
      PageSize: 100,
    });
    return page.items.filter((s) => inRange(s.saleDate, range));
  }, [today]);

  const total = (sales ?? []).reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <>
      <section className="card today-total">
        <div className="today-label">{t('Фурӯши имрӯза')} · {formatDate(`${today}T12:00:00+05:00`)}</div>
        <div className="today-amount">{money(total)}</div>
        <div className="today-count">{sales ? t('{n} фурӯш', { n: sales.length }) : '…'}</div>
      </section>

      <SaleForm showDate={false} onSaved={reload} />

      {loading && !sales && <p className="state">{t('Бор карда истодааст…')}</p>}
      {error && <div className="state state-error">{error}</div>}

      {sales && (
        <section className="card">
          <h3 className="card-title">{t('Фурӯшҳои имрӯза')}</h3>
          {sales.length === 0 ? (
            <p className="empty">{t('Имрӯз ҳанӯз фурӯш сабт нашудааст')}</p>
          ) : (
            <ul className="records">
              {sales.map((s) => (
                <RecordRow
                  key={s.id}
                  title={METHOD_LABELS[s.method]}
                  subtitle={s.note}
                  amount={money(s.amount)}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
