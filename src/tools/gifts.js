import { t, getLocale } from '../i18n/index.js';
import { villagers, GIFT_TIERS } from '../data/villagers.js';
import { getGiftItemLabel } from '../data/gift-item-labels.js';

function giftLabel(itemId) {
  return getGiftItemLabel(itemId, getLocale());
}

function renderGiftList(items) {
  if (!items.length) return `<p class="gift-empty">${t('gifts.none')}</p>`;
  return `<ul class="gift-tags">${items.map(item => `<li class="gift-tag gift-tag--item">${giftLabel(item)}</li>`).join('')}</ul>`;
}

export function renderGifts() {
  const root = document.createElement('div');
  root.className = 'tool-view tool-view--wide';

  const villagerOptions = villagers
    .map(v => `<option value="${v.id}">${t(`villagers.${v.id}`)}</option>`)
    .join('');

  root.innerHTML = `
    <div class="card card--wide">
      <h1>${t('tools.gifts.title')}</h1>
      <div class="gift-mode-tabs">
        <button type="button" class="btn btn--selected" data-mode="villager">${t('gifts.byVillager')}</button>
        <button type="button" class="btn" data-mode="search">${t('gifts.byItem')}</button>
      </div>
      <div id="gift-villager-panel">
        <label for="gift-villager">${t('gifts.selectVillager')}</label>
        <select id="gift-villager">
          <option value="">${t('gifts.selectVillagerOption')}</option>
          ${villagerOptions}
        </select>
        <div id="gift-villager-result" class="gift-result"></div>
      </div>
      <div id="gift-search-panel" class="hidden">
        <label for="gift-search">${t('gifts.searchItem')}</label>
        <input type="text" id="gift-search" placeholder="${t('gifts.searchPlaceholder')}">
        <div id="gift-search-result" class="gift-result"></div>
      </div>
    </div>
  `;

  const villagerPanel = root.querySelector('#gift-villager-panel');
  const searchPanel = root.querySelector('#gift-search-panel');
  const villagerResult = root.querySelector('#gift-villager-result');
  const searchResult = root.querySelector('#gift-search-result');

  function renderVillagerGifts(villagerId) {
    if (!villagerId) {
      villagerResult.innerHTML = '';
      return;
    }

    const villager = villagers.find(v => v.id === villagerId);
    if (!villager) return;

    villagerResult.innerHTML = GIFT_TIERS.map(tier => `
      <section class="gift-tier gift-tier--${tier}">
        <h3>${t(`gifts.tier.${tier}`)}</h3>
        ${renderGiftList(villager[tier] || [])}
      </section>
    `).join('');
  }

  function searchByItem(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      searchResult.innerHTML = '';
      return;
    }

    const matches = [];
    villagers.forEach(villager => {
      GIFT_TIERS.forEach(tier => {
        (villager[tier] || []).forEach(itemId => {
          const label = giftLabel(itemId).toLowerCase();
          if (label.includes(q) || itemId.includes(q)) {
            matches.push({ villager: villager.id, tier, itemId });
          }
        });
      });
    });

    if (!matches.length) {
      searchResult.innerHTML = `<p class="gift-empty">${t('gifts.noResults')}</p>`;
      return;
    }

    searchResult.innerHTML = `
      <ul class="gift-search-list">
        ${matches.map(({ villager, tier, itemId }) => `
          <li class="gift-search-item">
            <strong>${giftLabel(itemId)}</strong>
            <span class="gift-search-meta">${t(`villagers.${villager}`)} · ${t(`gifts.tier.${tier}`)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  root.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('btn--selected', b === btn));
      villagerPanel.classList.toggle('hidden', mode !== 'villager');
      searchPanel.classList.toggle('hidden', mode !== 'search');
    });
  });

  root.querySelector('#gift-villager').addEventListener('change', (e) => {
    renderVillagerGifts(e.target.value);
  });

  root.querySelector('#gift-search').addEventListener('input', (e) => {
    searchByItem(e.target.value);
  });

  return root;
}
