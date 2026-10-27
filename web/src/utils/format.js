import { tr } from '../i18n/index.jsx';

// Номи моҳҳо (калид = тоҷикӣ, тарҷума аз i18n)
const MONTH_KEYS = ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'];
const MONTH_SHORT_KEYS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export const monthName = (month) => tr(MONTH_KEYS[month - 1]);
export const monthShort = (month) => tr(MONTH_SHORT_KEYS[month - 1]);

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export const formatNumber = (value) => numberFormat.format(Number(value) || 0);

export const money = (value) => `${formatNumber(value)} ${tr('сомонӣ')}`;

export const monthTitle = (year, month) => `${monthName(month)} ${year}`;

export const METHODS = ['Cash', 'Card', 'Transfer'];

// getter: ҳангоми иваз шудани забон ҳамеша арзиши нав мегирад
export const METHOD_LABELS = {
  get Cash() { return tr('Нақд'); },
  get Card() { return tr('Корт'); },
  get Transfer() { return tr('Интиқол'); },
};
