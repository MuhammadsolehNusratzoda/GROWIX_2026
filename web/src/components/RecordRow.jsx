import { useI18n } from '../i18n/index.jsx';
import Icon from './Icon.jsx';
export default function RecordRow({ title, subtitle, amount, amountClass = '', onDelete }) {
  const { t } = useI18n();
  return (
    <li className="record">
      <div className="record-main">
        <div className="record-title">{title}</div>
        {subtitle && <div className="record-sub">{subtitle}</div>}
      </div>
      {amount && <div className={`record-amount ${amountClass}`}>{amount}</div>}
      {onDelete && (
        <button type="button" className="icon-btn" onClick={onDelete} aria-label={t('Нест кардан')}>
          <Icon name="trash" size={18} />
        </button>
      )}
    </li>
  );
}
