import { useI18n } from '../i18n/index.jsx';
import Icon from './Icon.jsx';
import { money } from '../utils/format.js';

export default function ProfitBanner({ netProfit, isLoss }) {
  const { t } = useI18n();
  return (
    <section className={`profit ${isLoss ? 'profit-loss' : 'profit-gain'}`}>
      <Icon name={isLoss ? 'alert' : 'check'} tone={isLoss ? 'red' : 'green'} size={26} />
      <div>
        <div className="profit-caption">{t('Фоидаи асосии моҳона:')}</div>
        <div className="profit-amount">
          {money(netProfit)} <span className="badge">{isLoss ? t('ЗИЁН') : t('ФОИДА')}</span>
        </div>
        <div className="profit-note">
          {isLoss
            ? t('Хароҷот аз даромад {amount} зиёд аст, моҳ бо зиён анҷом ёфт', { amount: money(Math.abs(netProfit)) })
            : t('Даромад аз хароҷот зиёд аст, моҳ бо фоида анҷом ёфт')}
        </div>
      </div>
    </section>
  );
}
