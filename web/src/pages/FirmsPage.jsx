import { useState } from 'react';
import {
  createFirm,
  createFirmPayment,
  deleteFirm,
  deleteFirmPayment,
  getFirmPayments,
  getFirms,
  errorText,
} from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { usePeriod } from '../hooks/usePeriod.js';
import { monthRange, inRange, todayLocal, toApiDateTime, formatDate } from '../utils/dates.js';
import { METHODS, METHOD_LABELS, money, monthTitle } from '../utils/format.js';
import MonthSwitcher from '../components/MonthSwitcher.jsx';
import RecordRow from '../components/RecordRow.jsx';
import Message from '../components/Message.jsx';

const loadFirms = async () => (await getFirms({ PageSize: 100 })).items;

export default function FirmsPage() {
  const [section, setSection] = useState('payments');

  return (
    <>
      <div className="segmented">
        <button className={section === 'payments' ? 'active' : ''} onClick={() => setSection('payments')}>
          Пардохт ба фирма
        </button>
        <button className={section === 'firms' ? 'active' : ''} onClick={() => setSection('firms')}>
          Рӯйхати фирмаҳо
        </button>
      </div>

      {section === 'payments' ? <PaymentsSection /> : <FirmsSection />}
    </>
  );
}

/* ---------------- Пардохт ба фирма ---------------- */
function PaymentsSection() {
  const { year, month, shift, isCurrent } = usePeriod();
  const [form, setForm] = useState({ firmId: '', amount: '', date: todayLocal(), method: 'Transfer', note: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const firms = useAsync(loadFirms, []);
  const activeFirms = (firms.data ?? []).filter((f) => f.isActive);

  const { data: payments, loading, error, reload } = useAsync(async () => {
    const range = monthRange(year, month);
    const page = await getFirmPayments({
      From: range.from.toISOString(),
      To: range.to.toISOString(),
      PageSize: 100,
    });
    return page.items.filter((p) => inRange(p.paymentDate, range));
  }, [year, month]);

  const firmId = form.firmId || String(activeFirms[0]?.id ?? '');
  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const amount = Number(form.amount);
    if (!firmId) {
      setMessage({ type: 'error', text: 'Аввал фирмаро интихоб кунед' });
      return;
    }
    if (!(amount > 0)) {
      setMessage({ type: 'error', text: 'Маблағ бояд аз 0 зиёд бошад' });
      return;
    }
    setSaving(true);
    try {
      await createFirmPayment({
        firmId: Number(firmId),
        amount,
        paymentDate: toApiDateTime(form.date),
        method: form.method,
        note: form.note.trim() || null,
      });
      setMessage({ type: 'ok', text: 'Пардохт сабт шуд ✓' });
      setForm((f) => ({ ...f, amount: '', note: '' }));
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Ин пардохтро нест кунем?')) return;
    try {
      await deleteFirmPayment(id);
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    }
  }

  const total = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <>
      <form className="card form" onSubmit={handleSubmit}>
        <h3 className="card-title">➕ Пардохт ба фирма</h3>

        {!firms.loading && activeFirms.length === 0 && (
          <p className="empty">Фирма нест. Аввал дар «Рӯйхати фирмаҳо» фирма илова кунед.</p>
        )}

        <label className="field">
          Фирма
          <select name="firmId" value={firmId} onChange={setField('firmId')}>
            {activeFirms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </label>

        <label className="field">
          Маблағи пардохт (сомонӣ)
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="масалан 40000"
            value={form.amount}
            onChange={setField('amount')}
            required
          />
        </label>

        <div className="field-row">
          <label className="field">
            Сана
            <input name="date" type="date" value={form.date} onChange={setField('date')} required />
          </label>
          <label className="field">
            Тарзи пардохт
            <select name="method" value={form.method} onChange={setField('method')}>
              {METHODS.map((m) => (
                <option key={m} value={m}>{METHOD_LABELS[m]}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          Эзоҳ (ихтиёрӣ)
          <input name="note" type="text" maxLength="500" value={form.note} onChange={setField('note')} />
        </label>

        <Message message={message} />
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Сабт мешавад…' : 'Сабт кардан'}
        </button>
      </form>

      <MonthSwitcher
        title="Пардохтҳо"
        label={monthTitle(year, month)}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        nextDisabled={isCurrent}
      />

      {loading && <p className="state">Бор карда истодааст…</p>}
      {error && <div className="state state-error">{error}</div>}

      {!loading && !error && payments && (
        <section className="card">
          <div className="list-total">
            <span>Ҷамъ дар моҳ</span>
            <strong>{money(total)}</strong>
          </div>
          {payments.length === 0 ? (
            <p className="empty">Дар ин моҳ пардохт нест</p>
          ) : (
            <ul className="records">
              {payments.map((p) => (
                <RecordRow
                  key={p.id}
                  title={p.firmName}
                  subtitle={[formatDate(p.paymentDate), METHOD_LABELS[p.method], p.note]
                    .filter(Boolean)
                    .join(' · ')}
                  amount={money(p.amount)}
                  onDelete={() => handleDelete(p.id)}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}

/* ---------------- Рӯйхати фирмаҳо ---------------- */
function FirmsSection() {
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const firms = useAsync(loadFirms, []);
  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Номи фирмаро нависед' });
      return;
    }
    setSaving(true);
    try {
      await createFirm({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      });
      setMessage({ type: 'ok', text: 'Фирма илова шуд ✓' });
      setForm({ name: '', phone: '', address: '' });
      firms.reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Фирмаи «${name}»-ро нест кунем?`)) return;
    try {
      await deleteFirm(id);
      firms.reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    }
  }

  return (
    <>
      <form className="card form" onSubmit={handleSubmit}>
        <h3 className="card-title">➕ Фирмаи нав</h3>

        <label className="field">
          Номи фирма
          <input name="name" type="text" maxLength="150" value={form.name} onChange={setField('name')} required />
        </label>
        <label className="field">
          Телефон (ихтиёрӣ)
          <input name="phone" type="tel" maxLength="30" value={form.phone} onChange={setField('phone')} />
        </label>
        <label className="field">
          Суроға (ихтиёрӣ)
          <input name="address" type="text" maxLength="250" value={form.address} onChange={setField('address')} />
        </label>

        <Message message={message} />
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Сабт мешавад…' : 'Илова кардан'}
        </button>
      </form>

      {firms.loading && <p className="state">Бор карда истодааст…</p>}
      {firms.error && <div className="state state-error">{firms.error}</div>}

      {!firms.loading && !firms.error && firms.data && (
        <section className="card">
          <h3 className="card-title">🏢 Фирмаҳо ({firms.data.length})</h3>
          {firms.data.length === 0 ? (
            <p className="empty">Фирма ҳанӯз нест</p>
          ) : (
            <ul className="records">
              {firms.data.map((f) => (
                <RecordRow
                  key={f.id}
                  title={f.name}
                  subtitle={[f.phone, f.address].filter(Boolean).join(' · ')}
                  onDelete={() => handleDelete(f.id, f.name)}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
