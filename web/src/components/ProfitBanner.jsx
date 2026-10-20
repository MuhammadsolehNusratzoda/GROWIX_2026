import { money } from '../utils/format.js';

export default function ProfitBanner({ netProfit, isLoss }) {
  return (
    <section className={`profit ${isLoss ? 'profit-loss' : 'profit-gain'}`}>
      <div className="profit-icon">{isLoss ? '⚠️' : '✅'}</div>
      <div>
        <div className="profit-caption">Фоидаи асосии моҳона:</div>
        <div className="profit-amount">
          {money(netProfit)} <span className="badge">{isLoss ? 'ЗИЁН' : 'ФОИДА'}</span>
        </div>
        <div className="profit-note">
          {isLoss
            ? `Хароҷот аз даромад ${money(Math.abs(netProfit))} зиёд аст, моҳ бо зиён анҷом ёфт`
            : 'Даромад аз хароҷот зиёд аст, моҳ бо фоида анҷом ёфт'}
        </div>
      </div>
    </section>
  );
}
