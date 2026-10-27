export default function RecordRow({ title, subtitle, amount, amountClass = '', onDelete }) {
  return (
    <li className="record">
      <div className="record-main">
        <div className="record-title">{title}</div>
        {subtitle && <div className="record-sub">{subtitle}</div>}
      </div>
      {amount && <div className={`record-amount ${amountClass}`}>{amount}</div>}
      {onDelete && (
        <button type="button" className="icon-btn" onClick={onDelete} aria-label="Нест кардан">
          Нест
        </button>
      )}
    </li>
  );
}
