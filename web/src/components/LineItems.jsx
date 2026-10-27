import { useState } from 'react';
import { money } from '../utils/format.js';

// Сатрҳои маҳсулот: кадом маҳсулот, чанд дона, бо кадом нарх.
// mode='sale'     → нархи фурӯш, миқдор аз анбор зиёд шуда наметавонад
// mode='purchase' → нархи харид
export default function LineItems({ products, lines, onChange, mode }) {
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [err, setErr] = useState('');

  const priceOf = (p) => (mode === 'sale' ? p.salePrice : p.purchasePrice);
  const selected = products.find((p) => String(p.id) === String(productId)) ?? products[0];
  const currentId = selected ? String(selected.id) : '';

  function usedOf(id) {
    return lines.filter((l) => l.productId === id).reduce((s, l) => s + l.quantity, 0);
  }

  function add() {
    setErr('');
    if (!selected) return;
    const quantity = Number(qty);
    const unit = price === '' ? priceOf(selected) : Number(price);
    if (!Number.isInteger(quantity) || quantity < 1) return setErr('Миқдор бояд адади бутун, ≥ 1 бошад');
    if (!(unit >= 0)) return setErr('Нарх нодуруст аст');
    if (mode === 'sale' && usedOf(selected.id) + quantity > selected.quantityOnHand) {
      return setErr(`Дар анбор «${selected.name}» танҳо ${selected.quantityOnHand} дона ҳаст`);
    }
    onChange([...lines, { productId: selected.id, name: selected.name, quantity, unitPrice: unit }]);
    setQty('1');
    setPrice('');
  }

  const total = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  return (
    <div className="lines">
      {products.length === 0 ? (
        <p className="empty">
          {mode === 'sale' ? 'Маҳсулот дар анбор нест' : 'Барои ин фирма маҳсулот нест. Аввал дар «Маҳсулот» илова кунед.'}
        </p>
      ) : (
        <>
          <label className="field">
            Маҳсулот
            <select aria-label="Маҳсулот" value={currentId} onChange={(e) => { setProductId(e.target.value); setPrice(''); }}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{mode === 'sale' ? ` (${p.quantityOnHand} дона)` : ''}
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label className="field">
              Миқдор
              <input aria-label="Миқдор" type="number" inputMode="numeric" min="1" step="1" value={qty}
                onChange={(e) => setQty(e.target.value)} />
            </label>
            <label className="field">
              Нарх (барои 1 дона)
              <input aria-label="Нарх" type="number" inputMode="decimal" min="0" step="0.01"
                placeholder={selected ? String(priceOf(selected)) : ''} value={price}
                onChange={(e) => setPrice(e.target.value)} />
            </label>
          </div>
          <button type="button" className="btn btn-secondary" onClick={add}>＋ Илова ба рӯйхат</button>
        </>
      )}
      {err && <div className="msg msg-error">{err}</div>}

      {lines.length > 0 && (
        <ul className="records">
          {lines.map((l, idx) => (
            <li key={idx} className="record">
              <div className="record-main">
                <div className="record-title">{l.name}</div>
                <div className="record-sub">{l.quantity} × {money(l.unitPrice)}</div>
              </div>
              <div className="record-amount">{money(l.quantity * l.unitPrice)}</div>
              <button type="button" className="icon-btn" aria-label="Тоза кардан"
                onClick={() => onChange(lines.filter((_, i) => i !== idx))}>Нест</button>
            </li>
          ))}
        </ul>
      )}
      {lines.length > 0 && (
        <div className="list-total"><span>Ҷамъ</span><strong>{money(total)}</strong></div>
      )}
    </div>
  );
}
