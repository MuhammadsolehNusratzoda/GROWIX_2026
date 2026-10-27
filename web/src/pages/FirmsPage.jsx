import { useI18n } from '../i18n/index.jsx';
import Icon from '../components/Icon.jsx';
import { useState } from 'react';
import {
  createFirm,
  createFirmPayment,
  createFirmPurchase,
  deleteFirm,
  deleteFirmPayment,
  deleteFirmPurchase,
  getFirmBalances,
  getFirmPayments,
  getFirmPurchases,
  getFirmLedger,
  getProducts,
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
import LineItems from '../components/LineItems.jsx';

const loadFirms = async () => (await getFirms({ PageSize: 100 })).items;

const SECTIONS = [
  { key: 'debts', label: 'Қарз' },
  { key: 'purchases', label: 'Гирифтем' },
  { key: 'payments', label: 'Пардохт' },
  { key: 'firms', label: 'Фирмаҳо' },
];

export default function FirmsPage() {
  const { t } = useI18n();
  const [section, setSection] = useState('debts');

  return (
    <>
      <div className="segmented">
        {SECTIONS.map((s) => (
          <button key={s.key} className={section === s.key ? 'active' : ''} onClick={() => setSection(s.key)}>
            {t(s.label)}
          </button>
        ))}
      </div>

      {section === 'debts' && <DebtsSection />}
      {section === 'purchases' && <PurchasesSection />}
      {section === 'payments' && <PaymentsSection />}
      {section === 'firms' && <FirmsSection />}
    </>
  );
}

/* ---------------- Қарз ба фирмаҳо ---------------- */
function debtLabel(debt, t) {
  if (debt > 0) return { text: money(debt), cls: 'debt-red' };
  if (debt < 0) return { text: t('Пешпардохт {amount}', { amount: money(-debt) }), cls: 'green' };
  return { text: t('Қарз нест'), cls: 'green' };
}

function DebtsSection() {
  const { t } = useI18n();
  const { data, loading, error } = useAsync(() => getFirmBalances(), []);

  if (loading && !data) return <p className="state">{t('Бор карда истодааст…')}</p>;
  if (error) return <div className="state state-error">{error}</div>;
  if (!data) return null;

  const hasActivity = data.firms.some((f) => f.totalPurchased > 0 || f.totalPaid > 0);

  return (
    <>
      <section className="card debt-total">
        <div className="today-label">{t('Қарзи умумӣ ба фирмаҳо')}</div>
        <div className={`today-amount ${data.totalDebt > 0 ? 'debt-red' : ''}`}>{money(data.totalDebt)}</div>
        <div className="today-count">{t('Қарз = мол гирифтем − пардохт кардем. Фурӯш қарзро худкор кам намекунад.')}</div>
      </section>

      <section className="card">
        <h3 className="card-title">{t('Қарз аз рӯи фирма')}</h3>
        {data.firms.length === 0 ? (
          <p className="empty">{t('Фирма ҳанӯз нест. Аввал дар «Фирмаҳо» илова кунед.')}</p>
        ) : (
          <ul className="records">
            {data.firms.map((f) => {
              const d = debtLabel(f.debt, t);
              return (
                <FirmDebtRow key={f.firmId} f={f} d={d} />
              );
            })}
          </ul>
        )}
        {!hasActivity && data.firms.length > 0 && (
          <p className="hint">
            {t('Қарзро ҳисоб кардан учун дар «Гирифтем» сабт кунед, ки аз фирма чӣ қадар мол гирифтед.')}
          </p>
        )}
      </section>
    </>
  );
}

// Як сатри фирма: қарз + фурӯши маҳсулоти ҳамин фирма (қарзро худкор кам намекунад)
function FirmDebtRow({ f, d }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ledger = useAsync(() => (open ? getFirmLedger(f.firmId) : Promise.resolve(null)), [open]);

  return (
    <>
      <RecordRow
        title={f.firmName}
        subtitle={`${t('Гирифтем')}: ${money(f.totalPurchased)} · ${t('Додем')}: ${money(f.totalPaid)} · ${t('Фурӯхта шуд')}: ${money(f.totalSold)}`}
        amount={d.text}
        amountClass={d.cls}
      />
      <li className="record" style={{ display: 'block' }}>
        {f.soldNotPaid > 0 && (
          <div className="hint">{t('Аз фурӯши ин фирма ба фирма ҳоло надодаем')}: <strong>{money(f.soldNotPaid)}</strong></div>
        )}
        <button type="button" className="link-btn" onClick={() => setOpen((o) => !o)}>
          {open ? t('Пинҳон кардан') : t('Кадом маҳсулотҳо фурӯхта шуд?')}
        </button>
        {open && ledger.loading && <p className="state">{t('Бор карда истодааст…')}</p>}
        {open && ledger.error && <div className="state state-error">{ledger.error}</div>}
        {open && ledger.data && (
          <div className="sold-box">
            {ledger.data.items.length === 0 && <div>{t('Аз ин фирма ҳанӯз чизе фурӯхта нашудааст')}</div>}
            {ledger.data.items.map((i) => (
              <div className="row" key={i.productId}>
                <span>{i.productName} × {i.quantity}</span>
                <strong>{money(i.amount)}</strong>
              </div>
            ))}
          </div>
        )}
      </li>
    </>
  );
}

/* ---------------- Мол аз фирма гирифтем ---------------- */
function PurchasesSection() {
  const { t } = useI18n();
  const { year, month, shift, isCurrent } = usePeriod();
  const [form, setForm] = useState({ firmId: '', amount: '', date: todayLocal(), invoice: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [withProducts, setWithProducts] = useState(true);
  const [lines, setLines] = useState([]);

  const firms = useAsync(loadFirms, []);
  const activeFirms = (firms.data ?? []).filter((f) => f.isActive);

  const { data: purchases, loading, error, reload } = useAsync(async () => {
    const range = monthRange(year, month);
    const page = await getFirmPurchases({
      From: range.from.toISOString(),
      To: range.to.toISOString(),
      PageSize: 100,
    });
    return page.items.filter((p) => inRange(p.purchaseDate, range));
  }, [year, month]);

  const firmId = form.firmId || String(activeFirms[0]?.id ?? '');
  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const firmProducts = useAsync(
    async () => (firmId ? (await getProducts({ FirmId: firmId, IsActive: true, PageSize: 200 })).items : []),
    [firmId],
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const amount = Number(form.amount);
    if (!firmId) {
      setMessage({ type: 'error', text: t('Аввал фирмаро интихоб кунед') });
      return;
    }
    if (withProducts && lines.length === 0) {
      setMessage({ type: 'error', text: t('Ақаллан як маҳсулотро ба рӯйхат илова кунед') });
      return;
    }
    if (!withProducts && !(amount > 0)) {
      setMessage({ type: 'error', text: t('Маблағ бояд аз 0 зиёд бошад') });
      return;
    }
    setSaving(true);
    try {
      await createFirmPurchase({
        firmId: Number(firmId),
        amount: withProducts ? 0 : amount,
        items: withProducts
          ? lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitCost: l.unitPrice }))
          : undefined,
        purchaseDate: toApiDateTime(form.date),
        invoiceNumber: form.invoice.trim() || null,
        note: form.note.trim() || null,
      });
      setMessage({ type: 'ok', text: t('Мол аз фирма сабт шуд (қарз зиёд шуд)') });
      setForm((f) => ({ ...f, amount: '', invoice: '', note: '' }));
      setLines([]);
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('Ин харидро нест кунем?'))) return;
    try {
      await deleteFirmPurchase(id);
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    }
  }

  const total = (purchases ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <>
      <form className="card form" onSubmit={handleSubmit}>
        <h3 className="card-title"><Icon name="plus" tone="green" />{t('Мол аз фирма гирифтем')}</h3>

        {!firms.loading && activeFirms.length === 0 && (
          <p className="empty">{t('Фирма нест. Аввал дар «Фирмаҳо» фирма илова кунед.')}</p>
        )}

        <label className="field">
          {t('Фирма')}
          <select name="firmId" value={firmId} onChange={(e) => { setLines([]); setField('firmId')(e); }}>
            {activeFirms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </label>

        <div className="segmented">
          <button type="button" className={withProducts ? 'active' : ''} onClick={() => setWithProducts(true)}>{t('Бо маҳсулот')}</button>
          <button type="button" className={!withProducts ? 'active' : ''} onClick={() => setWithProducts(false)}>{t('Танҳо маблағ')}</button>
        </div>

        {withProducts ? (
          <LineItems products={firmProducts.data ?? []} lines={lines} onChange={setLines} mode="purchase" />
        ) : (
          <label className="field">
            {t('Маблағи мол (сомонӣ)')}
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder={t('масалан 100000')}
              value={form.amount}
              onChange={setField('amount')}
            />
          </label>
        )}

        <div className="field-row">
          <label className="field">
            {t('Сана')}
            <input name="date" type="date" value={form.date} onChange={setField('date')} required />
          </label>
          <label className="field">
            {t('Рақами накладной')}
            <input name="invoice" type="text" maxLength="50" placeholder={t('ихтиёрӣ')} value={form.invoice}
              onChange={setField('invoice')} />
          </label>
        </div>

        <label className="field">
          {t('Эзоҳ (ихтиёрӣ)')}
          <input name="note" type="text" maxLength="500" value={form.note} onChange={setField('note')} />
        </label>

        <Message message={message} />
        <button className="btn" type="submit" disabled={saving}>
          {saving ? t('Сабт мешавад…') : t('Сабт кардан')}
        </button>
      </form>

      <MonthSwitcher
        title={t('Гирифтаҳо')}
        label={monthTitle(year, month)}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        nextDisabled={isCurrent}
      />

      {loading && <p className="state">{t('Бор карда истодааст…')}</p>}
      {error && <div className="state state-error">{error}</div>}

      {!loading && !error && purchases && (
        <section className="card">
          <div className="list-total">
            <span>{t('Ҷамъ дар моҳ')}</span>
            <strong>{money(total)}</strong>
          </div>
          {purchases.length === 0 ? (
            <p className="empty">{t('Дар ин моҳ мол гирифта нашудааст')}</p>
          ) : (
            <ul className="records">
              {purchases.map((p) => (
                <RecordRow
                  key={p.id}
                  title={p.firmName}
                  subtitle={[formatDate(p.purchaseDate), p.invoiceNumber && `№ ${p.invoiceNumber}`,
                    p.items?.length ? p.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ') : null, p.note]
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

/* ---------------- Пардохт ба фирма ---------------- */
function PaymentsSection() {
  const { t } = useI18n();
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
      setMessage({ type: 'error', text: t('Аввал фирмаро интихоб кунед') });
      return;
    }
    if (!(amount > 0)) {
      setMessage({ type: 'error', text: t('Маблағ бояд аз 0 зиёд бошад') });
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
      setMessage({ type: 'ok', text: t('Пардохт сабт шуд') });
      setForm((f) => ({ ...f, amount: '', note: '' }));
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('Ин пардохтро нест кунем?'))) return;
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
        <h3 className="card-title"><Icon name="plus" tone="green" />{t('Пардохт ба фирма')}</h3>

        {!firms.loading && activeFirms.length === 0 && (
          <p className="empty">{t('Фирма нест. Аввал дар «Рӯйхати фирмаҳо» фирма илова кунед.')}</p>
        )}

        <label className="field">
          {t('Фирма')}
          <select name="firmId" value={firmId} onChange={(e) => { setLines([]); setField('firmId')(e); }}>
            {activeFirms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </label>

        <label className="field">
          {t('Маблағи пардохт (сомонӣ)')}
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder={t('масалан 40000')}
            value={form.amount}
            onChange={setField('amount')}
            required
          />
        </label>

        <div className="field-row">
          <label className="field">
            {t('Сана')}
            <input name="date" type="date" value={form.date} onChange={setField('date')} required />
          </label>
          <label className="field">
            {t('Тарзи пардохт')}
            <select name="method" value={form.method} onChange={setField('method')}>
              {METHODS.map((m) => (
                <option key={m} value={m}>{METHOD_LABELS[m]}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          {t('Эзоҳ (ихтиёрӣ)')}
          <input name="note" type="text" maxLength="500" value={form.note} onChange={setField('note')} />
        </label>

        <Message message={message} />
        <button className="btn" type="submit" disabled={saving}>
          {saving ? t('Сабт мешавад…') : t('Сабт кардан')}
        </button>
      </form>

      <MonthSwitcher
        title={t('Пардохтҳо')}
        label={monthTitle(year, month)}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        nextDisabled={isCurrent}
      />

      {loading && <p className="state">{t('Бор карда истодааст…')}</p>}
      {error && <div className="state state-error">{error}</div>}

      {!loading && !error && payments && (
        <section className="card">
          <div className="list-total">
            <span>{t('Ҷамъ дар моҳ')}</span>
            <strong>{money(total)}</strong>
          </div>
          {payments.length === 0 ? (
            <p className="empty">{t('Дар ин моҳ пардохт нест')}</p>
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
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const firms = useAsync(loadFirms, []);
  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: t('Номи фирмаро нависед') });
      return;
    }
    setSaving(true);
    try {
      await createFirm({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      });
      setMessage({ type: 'ok', text: t('Фирма илова шуд') });
      setForm({ name: '', phone: '', address: '' });
      firms.reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(t('Фирмаи «{name}»-ро нест кунем?', { name }))) return;
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
        <h3 className="card-title"><Icon name="plus" tone="green" />{t('Фирмаи нав')}</h3>

        <label className="field">
          {t('Номи фирма')}
          <input name="name" type="text" maxLength="150" value={form.name} onChange={setField('name')} required />
        </label>
        <label className="field">
          {t('Телефон (ихтиёрӣ)')}
          <input name="phone" type="tel" maxLength="30" value={form.phone} onChange={setField('phone')} />
        </label>
        <label className="field">
          {t('Суроға (ихтиёрӣ)')}
          <input name="address" type="text" maxLength="250" value={form.address} onChange={setField('address')} />
        </label>

        <Message message={message} />
        <button className="btn" type="submit" disabled={saving}>
          {saving ? t('Сабт мешавад…') : t('Илова кардан')}
        </button>
      </form>

      {firms.loading && <p className="state">{t('Бор карда истодааст…')}</p>}
      {firms.error && <div className="state state-error">{firms.error}</div>}

      {!firms.loading && !firms.error && firms.data && (
        <section className="card">
          <h3 className="card-title"><Icon name="building" tone="orange" />{t('Фирмаҳо')} ({firms.data.length})</h3>
          {firms.data.length === 0 ? (
            <p className="empty">{t('Фирма ҳанӯз нест')}</p>
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
