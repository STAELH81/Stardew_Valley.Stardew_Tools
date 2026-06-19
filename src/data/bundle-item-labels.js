import { t } from '../i18n/index.js';

export function getBundleItemLabel(id) {
  const key = `bundles.item.${id}`;
  const label = t(key);
  if (label !== key) return label;
  return id.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}
