import { MONTHS_SHORT, formatNumber } from '../utils/format.js';

export default function WeeklyChart({ month, weeks }) {
  const max = Math.max(1, ...weeks.map((w) => Number(w.total) || 0));
  const short = MONTHS_SHORT[month - 1];

  return (
    <section className="card">
      <h3 className="card-title">📊 Фурӯш аз рӯи ҳафтаҳо</h3>

      <div className="chart">
        {weeks.map((w) => {
          const value = Number(w.total) || 0;
          const height = value === 0 ? 3 : Math.max(6, (value / max) * 100);
          return (
            <div key={w.weekNumber} className="chart-col">
              <div className="chart-value">{formatNumber(value)}</div>
              <div className="chart-bar-wrap">
                <div className="chart-bar" style={{ height: `${height}%` }} />
              </div>
              <div className="chart-week">Ҳафта {w.weekNumber}</div>
              <div className="chart-range">
                {new Date(w.from).getUTCDate()}–{new Date(w.to).getUTCDate()} {short}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
