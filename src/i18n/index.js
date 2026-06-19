import fr from './locales/fr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import es from './locales/es.json';
import ru from './locales/ru.json';

export const LOCALES = {
  fr: { label: 'Français', data: fr },
  en: { label: 'English', data: en },
  de: { label: 'Deutsch', data: de },
  es: { label: 'Español', data: es },
  ru: { label: 'Русский', data: ru },
};

const STORAGE_KEY = 'stardew-tools-lang';
let currentLocale = 'fr';
let messages = fr;

export function initI18n() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && LOCALES[saved]) {
    currentLocale = saved;
  } else {
    const browser = navigator.language.slice(0, 2);
    currentLocale = LOCALES[browser] ? browser : 'fr';
  }
  messages = LOCALES[currentLocale].data;
  document.documentElement.lang = currentLocale;
}

export function getLocale() {
  return currentLocale;
}

export function setLocale(code) {
  if (!LOCALES[code]) return;
  currentLocale = code;
  messages = LOCALES[code].data;
  localStorage.setItem(STORAGE_KEY, code);
  document.documentElement.lang = code;
}

export function t(key, vars = {}) {
  let text = messages[key] ?? LOCALES.en.data[key] ?? key;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value));
  });
  return text;
}
