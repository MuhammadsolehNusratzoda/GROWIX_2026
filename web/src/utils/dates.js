// Ҳама санаҳо бо вақти Тоҷикистон (UTC+5) кор мекунанд, мисли ҳисоботи сервер.
const TZ = 'Asia/Dushanbe';
const OFFSET = '+05:00';

const pad = (n) => String(n).padStart(2, '0');

// Имрӯз дар шакли YYYY-MM-DD (барои <input type="date">)
export function todayLocal() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

// '2026-10-14' -> '2026-10-14T12:00:00+05:00' (нисфирӯзӣ, то ба ҳудуди рӯз наафтад)
export function toApiDateTime(dateStr) {
  return `${dateStr}T12:00:00${OFFSET}`;
}

// Оғози моҳ ва оғози моҳи оянда (бо вақти Тоҷикистон)
export function monthRange(year, month) {
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return {
    from: new Date(`${year}-${pad(month)}-01T00:00:00${OFFSET}`),
    to: new Date(`${nextYear}-${pad(nextMonth)}-01T00:00:00${OFFSET}`),
  };
}

export function inRange(iso, range) {
  const t = new Date(iso).getTime();
  return t >= range.from.getTime() && t < range.to.getTime();
}

export function formatDate(iso) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

// Як рӯз (00:00 то 00:00-и рӯзи оянда) бо вақти Тоҷикистон
export function dayRange(dateStr) {
  const from = new Date(`${dateStr}T00:00:00${OFFSET}`);
  return { from, to: new Date(from.getTime() + 24 * 60 * 60 * 1000) };
}
