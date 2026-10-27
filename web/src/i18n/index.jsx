import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { translations } from './translations.js';

export const LANGS = [
  { code: 'tg', short: 'TJ', label: 'Тоҷикӣ' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'ru', short: 'RU', label: 'Русский' },
];

const STORAGE_KEY = 'pp_lang';

function loadLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGS.some((l) => l.code === saved)) return saved;
  } catch {
    // localStorage дастрас нест
  }
  return 'tg';
}

let currentLang = loadLang();

// Калидҳои бо {param}: ба regex табдил медиҳем, то паёми сервер (бо ном/рақам) ҳам тарҷума шавад
const patterns = {};
function patternsFor(lang) {
  if (patterns[lang]) return patterns[lang];
  const list = [];
  for (const [key, value] of Object.entries(translations[lang] || {})) {
    if (!key.includes('{')) continue;
    const names = [];
    const source = key
      .replace(/[.*+?^$()|[\]\\]/g, '\\$&')
      .replace(/\{(\w+)\}/g, (_, n) => {
        names.push(n);
        return '(.+?)';
      });
    list.push({ re: new RegExp(`^${source}$`), names, value });
  }
  patterns[lang] = list;
  return list;
}

function fill(text, params) {
  return text.replace(/\{(\w+)\}/g, (m, n) => (params && n in params ? params[n] : m));
}

// Оддӣ (на hook) — барои api.js ва utils
export function tr(key, params) {
  const base = key.includes('|') ? key.split('|')[0] : key;
  if (currentLang === 'tg') return fill(base, params);

  const dict = translations[currentLang] || {};
  if (dict[key] !== undefined) return fill(dict[key], params);
  if (dict[base] !== undefined) return fill(dict[base], params);

  // Паёми сервер бо параметр
  for (const p of patternsFor(currentLang)) {
    const m = base.match(p.re);
    if (m) {
      const found = {};
      p.names.forEach((n, i) => (found[n] = m[i + 1]));
      return fill(p.value, found);
    }
  }
  return fill(base, params);
}

export function getLang() {
  return currentLang;
}

const I18nContext = createContext({ lang: 'tg', setLang: () => {}, t: tr });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(currentLang);

  const setLang = useCallback((code) => {
    currentLang = code;
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ҳеҷ гап
    }
    document.documentElement.lang = code === 'tg' ? 'tg' : code;
    setLangState(code);
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: tr }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
