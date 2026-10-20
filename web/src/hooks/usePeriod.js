import { useState } from 'react';
import { todayLocal } from '../utils/dates.js';

// Моҳи интихобшуда + тугмаҳои «қафо/пеш»
export function usePeriod() {
  const [currentYear, currentMonth] = todayLocal().split('-').map(Number);
  const [period, setPeriod] = useState({ year: currentYear, month: currentMonth });

  const shift = (delta) =>
    setPeriod(({ year, month }) => {
      const d = new Date(year, month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

  const isCurrent = period.year === currentYear && period.month === currentMonth;
  return { year: period.year, month: period.month, shift, isCurrent };
}
