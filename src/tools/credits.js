import { t } from '../i18n/index.js';
import { REPO_URL, WIKI_URL, GAME_URL, DEV_NAME } from '../config/site.js';

export function renderCredits() {
  const root = document.createElement('div');
  root.className = 'tool-view';
  root.innerHTML = `
    <div class="card">
      <h1>${t('credits.title')}</h1>
      <p class="muted">${t('credits.intro')}</p>

      <section class="credits-section">
        <h2>${t('credits.gameTitle')}</h2>
        <p>${t('credits.gameText')}</p>
        <p><a href="${GAME_URL}" target="_blank" rel="noopener noreferrer">stardewvalley.net</a></p>
      </section>

      <section class="credits-section">
        <h2>${t('credits.devTitle')}</h2>
        <p><strong>${DEV_NAME}</strong></p>
        <p>${t('credits.devText')}</p>
      </section>

      <section class="credits-section">
        <h2>${t('credits.dataTitle')}</h2>
        <p>${t('credits.dataText')}</p>
        <p><a href="${WIKI_URL}" target="_blank" rel="noopener noreferrer">stardewvalleywiki.com</a></p>
      </section>

      <section class="credits-section">
        <h2>${t('credits.assetsTitle')}</h2>
        <p>${t('credits.assetsText')}</p>
      </section>

      <section class="credits-section">
        <h2>${t('credits.sourceTitle')}</h2>
        <p>${t('credits.sourceText')}</p>
        <p><a href="${REPO_URL}" target="_blank" rel="noopener noreferrer">${REPO_URL}</a></p>
      </section>

      <p class="credits-disclaimer">${t('credits.disclaimer')}</p>
    </div>
  `;
  return root;
}
