import { t } from '../i18n/index.js';

export function renderComingSoon(toolId) {
  const root = document.createElement('div');
  root.className = 'tool-view';
  root.innerHTML = `
    <div class="card card--center">
      <h1>${t(`tools.${toolId}.title`)}</h1>
      <p class="muted">${t(`tools.${toolId}.desc`)}</p>
      <p class="coming-soon-badge">${t('tools.comingSoonMessage')}</p>
    </div>
  `;
  return root;
}
