export const MONTHS = [
  'Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн',
  'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр',
];

export const MONTHS_SHORT = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export const formatNumber = (value) => numberFormat.format(Number(value) || 0);

export const money = (value) => `${formatNumber(value)} сомонӣ`;

export const monthTitle = (year, month) => `${MONTHS[month - 1]} ${year}`;

export const METHODS = ['Cash', 'Card', 'Transfer'];

export const METHOD_LABELS = {
  Cash: 'Нақд',
  Card: 'Корт',
  Transfer: 'Интиқол',
};
