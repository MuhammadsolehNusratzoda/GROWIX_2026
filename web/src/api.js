// Ҳамаи муоширати бо API дар як ҷо.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/$/, '');

const KEYS = { access: 'pp_access', refresh: 'pp_refresh', user: 'pp_user' };

export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function errorText(err) {
  if (err?.errors?.length) return `${err.message}: ${err.errors.join(', ')}`;
  return err?.message || 'Хатои номаълум';
}

export const tokenStore = {
  get access() {
    return localStorage.getItem(KEYS.access);
  },
  get refresh() {
    return localStorage.getItem(KEYS.refresh);
  },
  get user() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.user));
    } catch {
      return null;
    }
  },
  save({ accessToken, refreshToken, user }) {
    localStorage.setItem(KEYS.access, accessToken);
    localStorage.setItem(KEYS.refresh, refreshToken);
    if (user) localStorage.setItem(KEYS.user, JSON.stringify(user));
  },
  clear() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

let onAuthFailure = () => {};
export function setAuthFailureHandler(fn) {
  onAuthFailure = fn;
}

async function rawFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;
  try {
    return await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Ба сервер пайваст шуда нашуд. Оё API кор карда истодааст?');
  }
}

// Ду request-и параллелӣ бо як refresh token: танҳо як маротиба refresh мекунем,
// вагарна сервер токени истифодашударо «дуздӣ» ҳисоб карда, ҳамаи session-ҳоро мебандад.
let refreshing = null;
function refreshTokens() {
  if (!refreshing) {
    refreshing = (async () => {
      const refreshToken = tokenStore.refresh;
      if (!refreshToken) return false;
      const res = await rawFetch('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
        auth: false,
      });
      if (!res.ok) return false;
      const json = await res.json();
      if (!json.isSuccess) return false;
      tokenStore.save(json.data);
      return true;
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

// Request-ро мефиристад ва JSON-и пурраи ҷавобро бармегардонад
async function send(path, options = {}) {
  let res = await rawFetch(path, options);

  if (res.status === 401 && options.auth !== false) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      res = await rawFetch(path, options);
    } else {
      tokenStore.clear();
      onAuthFailure();
      throw new ApiError('Session ба охир расид. Дубора ворид шавед.', 401);
    }
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // ҷавоб JSON нест
  }

  if (!res.ok || !json?.isSuccess) {
    throw new ApiError(json?.message || `Хатои сервер (${res.status})`, res.status, json?.errors);
  }
  return json;
}

async function request(path, options) {
  const json = await send(path, options);
  return json.data;
}

// Барои рӯйхатҳои саҳифабандишуда
async function requestPaged(path, options) {
  const json = await send(path, options);
  return {
    items: json.data ?? [],
    totalCount: json.totalCount ?? 0,
    pageNumber: json.pageNumber ?? 1,
    totalPages: json.totalPages ?? 1,
  };
}

function qs(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.append(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// ---------- Auth ----------
export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
  tokenStore.save(data);
  return data.user;
}

export async function logout() {
  const refreshToken = tokenStore.refresh;
  try {
    if (refreshToken) await request('/api/auth/logout', { method: 'POST', body: { refreshToken } });
  } catch {
    // ҳатто агар сервер ҷавоб надиҳад, дар браузер баромада меравем
  }
  tokenStore.clear();
}

// ---------- Reports ----------
export const getMonthlyReport = (year, month) =>
  request(`/api/reports/monthly?year=${year}&month=${month}`);

export const getWeeklySales = (year, month) =>
  request(`/api/reports/weekly?year=${year}&month=${month}`);

// ---------- Sales ----------
export const getSales = (params) => requestPaged(`/api/sales${qs(params)}`);
export const createSale = (body) => request('/api/sales', { method: 'POST', body });
export const deleteSale = (id) => request(`/api/sales/${id}`, { method: 'DELETE' });

// ---------- Expense categories + expenses ----------
export const getExpenseCategories = () => request('/api/expense-categories');
export const createExpenseCategory = (name) =>
  request('/api/expense-categories', { method: 'POST', body: { name } });

export const getExpenses = (params) => requestPaged(`/api/expenses${qs(params)}`);
export const createExpense = (body) => request('/api/expenses', { method: 'POST', body });
export const deleteExpense = (id) => request(`/api/expenses/${id}`, { method: 'DELETE' });

// ---------- Firms + payments ----------
export const getFirms = (params) => requestPaged(`/api/firms${qs(params)}`);
export const createFirm = (body) => request('/api/firms', { method: 'POST', body });
export const deleteFirm = (id) => request(`/api/firms/${id}`, { method: 'DELETE' });

export const getFirmPayments = (params) => requestPaged(`/api/firm-payments${qs(params)}`);
export const createFirmPayment = (body) => request('/api/firm-payments', { method: 'POST', body });
export const deleteFirmPayment = (id) => request(`/api/firm-payments/${id}`, { method: 'DELETE' });

// ---------- Users ----------
export const registerUser = (body) => request('/api/auth/register', { method: 'POST', body });
export const changePassword = (currentPassword, newPassword) =>
  request('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
