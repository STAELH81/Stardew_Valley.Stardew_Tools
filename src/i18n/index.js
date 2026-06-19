import fr from './locales/fr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import es from './locales/es.json';
import ru from './locales/ru.json';
import bundleItemsFr from './bundle-items/fr.json';
import bundleItemsEn from './bundle-items/en.json';
import bundleItemsDe from './bundle-items/de.json';
import bundleItemsEs from './bundle-items/es.json';
import bundleItemsRu from './bundle-items/ru.json';

function withBundleItems(base, items) {
  const prefixed = Object.fromEntries(
    Object.entries(items).map(([id, label]) => [`bundles.item.${id}`, label])
  );
  return { ...base, ...prefixed };
}

export const LOCALES = {
  fr: { label: 'Français', data: withBundleItems(fr, bundleItemsFr) },
  en: { label: 'English', data: withBundleItems(en, bundleItemsEn) },
  de: { label: 'Deutsch', data: withBundleItems(de, bundleItemsDe) },
  es: { label: 'Español', data: withBundleItems(es, bundleItemsEs) },
  ru: { label: 'Русский', data: withBundleItems(ru, bundleItemsRu) },
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
