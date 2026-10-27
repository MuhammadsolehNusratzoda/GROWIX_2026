import { useI18n } from '../i18n/index.jsx';
import Icon from '../components/Icon.jsx';
import { useState } from 'react';
import {
  createExpense,
  createExpenseCategory,
  deleteExpense,
  getExpenseCategories,
  getExpenses,
  errorText,
} from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { usePeriod } from '../hooks/usePeriod.js';
import { monthRange, inRange, todayLocal, toApiDateTime, formatDate } from '../utils/dates.js';
import { money, monthTitle } from '../utils/format.js';
import MonthSwitcher from '../components/MonthSwitcher.jsx';
import RecordRow from '../components/RecordRow.jsx';
import Message from '../components/Message.jsx';

export default function ExpensesPage() {
  const { t } = useI18n();
  const { year, month, shift, isCurrent } = usePeriod();
  const [form, setForm] = useState({ categoryId: '', amount: '', date: todayLocal(), note: '' });
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const categories = useAsync(() => getExpenseCategories(), []);

  const { data: expenses, loading, error, reload } = useAsync(async () => {
    const range = monthRange(year, month);
    const page = await getExpenses({
      From: range.from.toISOString(),
      To: range.to.toISOString(),
      PageSize: 100,
    });
    return page.items.filter((x) => inRange(x.expenseDate, range));
  }, [year, month]);

  const categoryId = form.categoryId || String(categories.data?.[0]?.id ?? '');
  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const amount = Number(form.amount);
    if (!categoryId) {
      setMessage({ type: 'error', text: t('Категорияро интихоб кунед') });
      return;
    }
    if (!(amount > 0)) {
      setMessage({ type: 'error', text: t('Маблағ бояд аз 0 зиёд бошад') });
      return;
    }
    setSaving(true);
    try {
      await createExpense({
        categoryId: Number(categoryId),
        amount,
        expenseDate: toApiDateTime(form.date),
        note: form.note.trim() || null,
      });
      setMessage({ type: 'ok', text: t('Хароҷот сабт шуд') });
      setForm((f) => ({ ...f, amount: '', note: '' }));
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    setMessage(null);
    try {
      const created = await createExpenseCategory(name);
      setNewCategory('');
      setForm((f) => ({ ...f, categoryId: String(created.id) }));
      categories.reload();
      setMessage({ type: 'ok', text: t('Категорияи «{name}» илова шуд', { name: created.name }) });
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('Ин хароҷотро нест кунем?'))) return;
    try {
      await deleteExpense(id);
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    }
  }

  const total = (expenses ?? []).reduce((sum, x) => sum + Number(x.amount), 0);

  return (
    <>
      <section className="card">
        <form className="form" onSubmit={handleSubmit}>
          <h3 className="card-title"><Icon name="plus" tone="green" />{t('Хароҷоти нав')}</h3>

          <label className="field">
            {t('Категория (Свет, Аренда, Маош, Барқ…)')}
            <select name="categoryId" value={categoryId} onChange={setField('categoryId')}>
              {(categories.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{t(c.name)}</option>
              ))}
            </select>
          </label>

          <label className="field">
            {t('Маблағ (сомонӣ)')}
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder={t('масалан 800')}
              value={form.amount}
              onChange={setField('amount')}
              required
            />
          </label>

          <label className="field">
            {t('Сана')}
            <input name="date" type="date" value={form.date} onChange={setField('date')} required />
          </label>

          <label className="field">
            {t('Эзоҳ (ихтиёрӣ)')}
            <input name="note" type="text" maxLength="500" value={form.note} onChange={setField('note')} />
          </label>

          <Message message={message} />
          <button className="btn" type="submit" disabled={saving}>
            {saving ? t('Сабт мешавад…') : t('Сабт кардан')}
          </button>
        </form>

        <details className="details">
          <summary>{t('＋ Категорияи нав')}</summary>
          <form className="inline-form" onSubmit={handleAddCategory}>
            <input
              name="newCategory"
              type="text"
              maxLength="100"
              placeholder={t('масалан Интернет')}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button className="btn btn-small" type="submit">{t('Илова')}</button>
          </form>
        </details>
      </section>

      <MonthSwitcher
        title={t('Хароҷот')}
        label={monthTitle(year, month)}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        nextDisabled={isCurrent}
      />

      {loading && <p className="state">{t('Бор карда истодааст…')}</p>}
      {error && <div className="state state-error">{error}</div>}

      {!loading && !error && expenses && (
        <section className="card">
          <div className="list-total">
            <span>{t('Ҷамъ дар моҳ')}</span>
            <strong>{money(total)}</strong>
          </div>
          {expenses.length === 0 ? (
            <p className="empty">{t('Дар ин моҳ хароҷот сабт нашудааст')}</p>
          ) : (
            <ul className="records">
              {expenses.map((x) => (
                <RecordRow
                  key={x.id}
                  title={t(x.categoryName)}
                  subtitle={[formatDate(x.expenseDate), x.note].filter(Boolean).join(' · ')}
                  amount={money(x.amount)}
                  onDelete={() => handleDelete(x.id)}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
