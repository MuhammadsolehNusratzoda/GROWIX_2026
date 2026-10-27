import { useState } from 'react';
import { createSale, getProducts, errorText } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import LineItems from './LineItems.jsx';
import { todayLocal, toApiDateTime } from '../utils/dates.js';
import { METHODS, METHOD_LABELS } from '../utils/format.js';
import Message from './Message.jsx';

export default function SaleForm({ showDate = true, onSaved }) {
  const [form, setForm] = useState({ amount: '', date: todayLocal(), method: 'Cash', note: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [withProducts, setWithProducts] = useState(true);
  const [lines, setLines] = useState([]);

  const products = useAsync(async () => (await getProducts({ PageSize: 200, IsActive: true })).items, []);
  const inStock = (products.data ?? []).filter((p) => p.quantityOnHand > 0);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const amount = Number(form.amount);
    if (withProducts && lines.length === 0) {
      setMessage({ type: 'error', text: 'Ақаллан як доруро ба рӯйхат илова кунед' });
      return;
    }
    if (!withProducts && !(amount > 0)) {
      setMessage({ type: 'error', text: 'Маблағ бояд аз 0 зиёд бошад' });
      return;
    }
    setSaving(true);
    try {
      await createSale({
        amount: withProducts ? 0 : amount,
        items: withProducts
          ? lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitPrice: l.unitPrice }))
          : undefined,
        saleDate: toApiDateTime(showDate ? form.date : todayLocal()),
        method: form.method,
        note: form.note.trim() || null,
      });
      setMessage({ type: 'ok', text: 'Фурӯш сабт шуд ✓' });
      setForm((f) => ({ ...f, amount: '', note: '' }));
      setLines([]);
      products.reload();
      onSaved?.();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  const methodField = (
    <label className="field">
      Тарзи пардохт
      <select name="method" value={form.method} onChange={setField('method')}>
        {METHODS.map((m) => (
          <option key={m} value={m}>{METHOD_LABELS[m]}</option>
        ))}
      </select>
    </label>
  );

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3 className="card-title">➕ Фурӯши нав</h3>

      <div className="segmented">
        <button type="button" className={withProducts ? 'active' : ''} onClick={() => setWithProducts(true)}>Бо дору</button>
        <button type="button" className={!withProducts ? 'active' : ''} onClick={() => setWithProducts(false)}>Танҳо маблағ</button>
      </div>

      {withProducts ? (
        <LineItems products={inStock} lines={lines} onChange={setLines} mode="sale" />
      ) : (
        <label className="field">
          Маблағи фурӯш (сомонӣ)
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="масалан 1500"
            value={form.amount}
            onChange={setField('amount')}
          />
        </label>
      )}

      {showDate ? (
        <div className="field-row">
          <label className="field">
            Сана
            <input name="date" type="date" value={form.date} onChange={setField('date')} required />
          </label>
          {methodField}
        </div>
      ) : (
        methodField
      )}

      <label className="field">
        Эзоҳ (ихтиёрӣ)
        <input name="note" type="text" maxLength="500" value={form.note} onChange={setField('note')} />
      </label>

      <Message message={message} />
      <button className="btn" type="submit" disabled={saving}>
        {saving ? 'Сабт мешавад…' : 'Сабт кардан'}
      </button>
    </form>
  );
}
