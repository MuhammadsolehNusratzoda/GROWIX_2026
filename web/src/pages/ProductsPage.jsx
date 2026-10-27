import { useState } from 'react';
import { createProduct, deleteProduct, getFirms, getProducts, getStock, errorText } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { money } from '../utils/format.js';
import RecordRow from '../components/RecordRow.jsx';
import Message from '../components/Message.jsx';

export default function ProductsPage() {
  const [section, setSection] = useState('stock');
  return (
    <>
      <div className="segmented">
        <button className={section === 'stock' ? 'active' : ''} onClick={() => setSection('stock')}>Анбор</button>
        <button className={section === 'products' ? 'active' : ''} onClick={() => setSection('products')}>Маҳсулот</button>
      </div>
      {section === 'stock' ? <StockSection /> : <ProductsSection />}
    </>
  );
}

/* Дар анбор аз ҳар фирма чӣ қадар мол ҳаст (барои ҷавоб ба фирма / баргардонидан) */
function StockSection() {
  const { data, loading, error } = useAsync(() => getStock(), []);
  if (loading && !data) return <p className="state">Бор карда истодааст…</p>;
  if (error) return <div className="state state-error">{error}</div>;
  if (!data) return null;

  return (
    <>
      <section className="card debt-total">
        <div className="today-label">Арзиши анбор (бо нархи харид)</div>
        <div className="today-amount">{money(data.totalValueAtCost)}</div>
        <div className="today-count">Бо нархи фурӯш: {money(data.totalValueAtSale)}</div>
      </section>

      {data.firms.length === 0 && <p className="empty">Анбор холӣ аст</p>}
      {data.firms.map((f) => (
        <section className="card" key={f.firmId}>
          <h3 className="card-title">{f.firmName}</h3>
          <div className="list-total">
            <span>{f.totalQuantity} дона</span>
            <strong>{money(f.totalValueAtCost)}</strong>
          </div>
          <ul className="records">
            {f.items.map((i) => (
              <RecordRow
                key={i.productId}
                title={i.productName}
                subtitle={`${i.quantityOnHand} дона × ${money(i.purchasePrice)}`}
                amount={money(i.valueAtCost)}
              />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function ProductsSection() {
  const [form, setForm] = useState({ name: '', firmId: '', purchasePrice: '', salePrice: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const firms = useAsync(async () => (await getFirms({ PageSize: 100 })).items, []);
  const activeFirms = (firms.data ?? []).filter((f) => f.isActive);
  const { data: products, loading, error, reload } = useAsync(
    async () => (await getProducts({ PageSize: 200 })).items,
    [],
  );

  const firmId = form.firmId || String(activeFirms[0]?.id ?? '');
  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!firmId) return setMessage({ type: 'error', text: 'Аввал дар «Фирмаҳо» фирма илова кунед' });
    if (!form.name.trim()) return setMessage({ type: 'error', text: 'Номи маҳсулотро нависед' });
    setSaving(true);
    try {
      await createProduct({
        name: form.name.trim(),
        firmId: Number(firmId),
        purchasePrice: Number(form.purchasePrice) || 0,
        salePrice: Number(form.salePrice) || 0,
      });
      setMessage({ type: 'ok', text: 'Маҳсулот илова шуд' });
      setForm((f) => ({ ...f, name: '', purchasePrice: '', salePrice: '' }));
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`«${p.name}»-ро нест кунем?`)) return;
    try {
      await deleteProduct(p.id);
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: errorText(err) });
    }
  }

  return (
    <>
      <form className="card form" onSubmit={handleSubmit}>
        <h3 className="card-title">Маҳсулоти нав</h3>
        <label className="field">
          Фирма
          <select name="firmId" value={firmId} onChange={setField('firmId')}>
            {activeFirms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Номи маҳсулот
          <input name="name" type="text" maxLength="150" value={form.name} onChange={setField('name')} />
        </label>
        <div className="field-row">
          <label className="field">
            Нархи харид
            <input name="purchasePrice" type="number" min="0" step="0.01" value={form.purchasePrice}
              onChange={setField('purchasePrice')} />
          </label>
          <label className="field">
            Нархи фурӯш
            <input name="salePrice" type="number" min="0" step="0.01" value={form.salePrice}
              onChange={setField('salePrice')} />
          </label>
        </div>
        <Message message={message} />
        <button className="btn" type="submit" disabled={saving}>{saving ? 'Сабт мешавад…' : 'Илова кардан'}</button>
      </form>

      {loading && !products && <p className="state">Бор карда истодааст…</p>}
      {error && <div className="state state-error">{error}</div>}
      {products && (
        <section className="card">
          <h3 className="card-title">Маҳсулотҳо</h3>
          {products.length === 0 ? (
            <p className="empty">Маҳсулот ҳанӯз нест</p>
          ) : (
            <ul className="records">
              {products.map((p) => (
                <RecordRow
                  key={p.id}
                  title={p.name}
                  subtitle={`${p.firmName} · дар анбор: ${p.quantityOnHand} дона · харид ${money(p.purchasePrice)}`}
                  amount={money(p.salePrice)}
                  onDelete={() => handleDelete(p)}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
