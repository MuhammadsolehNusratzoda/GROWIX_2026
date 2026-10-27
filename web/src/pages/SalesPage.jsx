import { useI18n } from '../i18n/index.jsx';
import { useState } from 'react';
import { deleteSale, getSales, errorText } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { usePeriod } from '../hooks/usePeriod.js';
import { monthRange, inRange, formatDate } from '../utils/dates.js';
import { METHOD_LABELS, money, monthTitle } from '../utils/format.js';
import MonthSwitcher from '../components/MonthSwitcher.jsx';
import RecordRow from '../components/RecordRow.jsx';
import SaleForm from '../components/SaleForm.jsx';
import Message from '../components/Message.jsx';

export default function SalesPage({ isAdmin }) {
  const { t } = useI18n();
  const { year, month, shift, isCurrent } = usePeriod();
  const [message, setMessage] = useState(null);

  const { data: sales, loading, error, reload } = useAsync(async () => {
    const range = monthRange(year, month);
    const page = await getSales({
      From: range.from.toISOString(),
      To: range.to.toISOString(),
      PageSize: 100,
    });
    return page.items.filter((s) => inRange(s.saleDate, range));
  }, [year, month]);

  async function handleDelete(id) {
    if (!window.confirm(t('Ин фурӯшро нест кунем?'))) return;
    try {
      await deleteSale(id);
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    }
  }

  const total = (sales ?? []).reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <>
      <SaleForm onSaved={reload} />

      <MonthSwitcher
        title={t('Фурӯш')}
        label={monthTitle(year, month)}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        nextDisabled={isCurrent}
      />

      <Message message={message} />
      {loading && <p className="state">{t('Бор карда истодааст…')}</p>}
      {error && <div className="state state-error">{error}</div>}

      {!loading && !error && sales && (
        <section className="card">
          <div className="list-total">
            <span>{t('Ҷамъ дар моҳ')}</span>
            <strong>{money(total)}</strong>
          </div>
          {sales.length === 0 ? (
            <p className="empty">{t('Дар ин моҳ фурӯш сабт нашудааст')}</p>
          ) : (
            <ul className="records">
              {sales.map((s) => (
                <RecordRow
                  key={s.id}
                  title={formatDate(s.saleDate)}
                  subtitle={[METHOD_LABELS[s.method], s.note].filter(Boolean).join(' · ')}
                  amount={money(s.amount)}
                  onDelete={isAdmin ? () => handleDelete(s.id) : undefined}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
