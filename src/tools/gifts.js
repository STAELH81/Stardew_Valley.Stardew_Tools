import { t, getLocale } from '../i18n/index.js';
import { villagers, GIFT_TIERS } from '../data/villagers.js';
import { getGiftItemLabel } from '../data/gift-item-labels.js';
import {
  SEASONS,
  DAYS_PER_SEASON,
  daysUntil,
  daysUntilSunday,
  formatGameDate,
  getWeekKey,
} from '../data/game-date.js';

const GIFT_TRACKING_KEY = 'stardew-tools-gifts-tracking';
const GAME_DATE_KEY = 'stardew-tools-game-date';

function giftLabel(itemId) {
  return getGiftItemLabel(itemId, getLocale());
}

function getGameDate() {
  const saved = JSON.parse(localStorage.getItem(GAME_DATE_KEY));
  if (saved?.season && saved?.day) return saved;
  return { season: 'spring', day: 1 };
}

function saveGameDate(season, day) {
  localStorage.setItem(GAME_DATE_KEY, JSON.stringify({ season, day: Number(day) }));
}

function getTracking() {
  return JSON.parse(localStorage.getItem(GIFT_TRACKING_KEY)) || {};
}

function saveTracking(data) {
  localStorage.setItem(GIFT_TRACKING_KEY, JSON.stringify(data));
}

function renderGiftList(items) {
  if (!items.length) return `<p class="gift-empty">${t('gifts.none')}</p>`;
  return `<ul class="gift-tags">${items.map(item => `<li class="gift-tag gift-tag--item">${giftLabel(item)}</li>`).join('')}</ul>`;
}

function renderGameDateControls(container, onChange) {
  const { season, day } = getGameDate();
  container.innerHTML = `
    <div class="game-date-row">
      <label for="gift-game-season">${t('gifts.gameSeason')}</label>
      <select id="gift-game-season">
        ${SEASONS.map(s => `<option value="${s}"${s === season ? ' selected' : ''}>${t(`season.${s}`)}</option>`).join('')}
      </select>
      <label for="gift-game-day">${t('gifts.gameDay')}</label>
      <input type="number" id="gift-game-day" min="1" max="${DAYS_PER_SEASON}" value="${day}">
    </div>
  `;
  const seasonEl = container.querySelector('#gift-game-season');
  const dayEl = container.querySelector('#gift-game-day');
  function sync() {
    saveGameDate(seasonEl.value, dayEl.value);
    onChange();
  }
  seasonEl.addEventListener('change', sync);
  dayEl.addEventListener('change', sync);
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
        <button type="button" class="btn" data-mode="tracking">${t('gifts.tabTracking')}</button>
        <button type="button" class="btn" data-mode="birthdays">${t('gifts.tabBirthdays')}</button>
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
      <div id="gift-tracking-panel" class="hidden">
        <div id="gift-tracking-date"></div>
        <p id="gift-week-info" class="gift-week-info"></p>
        <div id="gift-tracking-grid" class="gift-tracking-grid"></div>
      </div>
      <div id="gift-birthdays-panel" class="hidden">
        <div id="gift-birthdays-date"></div>
        <ul id="gift-birthdays-list" class="gift-birthdays-list"></ul>
      </div>
    </div>
  `;

  const villagerPanel = root.querySelector('#gift-villager-panel');
  const searchPanel = root.querySelector('#gift-search-panel');
  const trackingPanel = root.querySelector('#gift-tracking-panel');
  const birthdaysPanel = root.querySelector('#gift-birthdays-panel');
  const villagerResult = root.querySelector('#gift-villager-result');
  const searchResult = root.querySelector('#gift-search-result');

  function renderVillagerGifts(villagerId) {
    if (!villagerId) {
      villagerResult.innerHTML = '';
      return;
    }

    const villager = villagers.find(v => v.id === villagerId);
    if (!villager) return;

    const { season, day } = getGameDate();
    const isBirthday = villager.birthday?.season === season && villager.birthday?.day === Number(day);
    const birthdayBanner = isBirthday
      ? `<p class="gift-birthday-banner">${t('gifts.birthdayToday')}</p>`
      : '';

    villagerResult.innerHTML = birthdayBanner + GIFT_TIERS.map(tier => `
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

  function renderTracking() {
    const { season, day } = getGameDate();
    const weekKey = getWeekKey(season, day);
    const tracking = getTracking();
    const weekData = tracking[weekKey] || {};
    const resetIn = daysUntilSunday(season, day);

    root.querySelector('#gift-week-info').textContent = t('gifts.weekInfo', {
      date: formatGameDate(season, day, t),
      reset: resetIn === 0 ? t('gifts.weekResetToday') : t('gifts.weekResetIn', { days: resetIn }),
    });

    const grid = root.querySelector('#gift-tracking-grid');
    grid.innerHTML = villagers.map(v => {
      const count = weekData[v.id] || 0;
      return `
        <div class="gift-track-row" data-villager="${v.id}">
          <span class="gift-track-name">${t(`villagers.${v.id}`)}</span>
          <div class="gift-track-buttons">
            <button type="button" class="btn btn--small gift-track-btn${count >= 1 ? ' btn--selected' : ''}" data-count="1">1</button>
            <button type="button" class="btn btn--small gift-track-btn${count >= 2 ? ' btn--selected' : ''}" data-count="2">2</button>
            <button type="button" class="btn btn--ghost btn--small gift-track-clear" title="${t('gifts.clearGifts')}">×</button>
          </div>
          <span class="gift-track-status">${t('gifts.giftsGiven', { count, max: 2 })}</span>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.gift-track-row').forEach(row => {
      const villagerId = row.dataset.villager;
      row.querySelectorAll('.gift-track-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const count = Number(btn.dataset.count);
          if (!tracking[weekKey]) tracking[weekKey] = {};
          tracking[weekKey][villagerId] = count;
          saveTracking(tracking);
          renderTracking();
        });
      });
      row.querySelector('.gift-track-clear')?.addEventListener('click', () => {
        if (tracking[weekKey]) delete tracking[weekKey][villagerId];
        saveTracking(tracking);
        renderTracking();
      });
    });
  }

  function renderBirthdays() {
    const { season, day } = getGameDate();
    const list = root.querySelector('#gift-birthdays-list');

    const upcoming = villagers
      .filter(v => v.birthday)
      .map(v => ({
        ...v,
        days: daysUntil(season, day, v.birthday.season, v.birthday.day),
      }))
      .sort((a, b) => a.days - b.days);

    if (!upcoming.length) {
      list.innerHTML = `<li class="gift-empty">${t('gifts.noBirthdays')}</li>`;
      return;
    }

    list.innerHTML = upcoming.map(v => {
      const dateStr = formatGameDate(v.birthday.season, v.birthday.day, t);
      const loved = (v.loved || []).slice(0, 3).map(giftLabel).join(', ');
      const when = v.days === 0
        ? t('gifts.birthdayToday')
        : t('gifts.birthdayIn', { days: v.days, date: dateStr });
      return `
        <li class="gift-birthday-item${v.days === 0 ? ' gift-birthday-item--today' : ''}">
          <strong>${t(`villagers.${v.id}`)}</strong>
          <span class="gift-birthday-when">${when}</span>
          ${loved ? `<span class="gift-birthday-loved">${t('gifts.lovedGifts')}: ${loved}</span>` : ''}
        </li>
      `;
    }).join('');
  }

  function refreshDatePanels() {
    renderGameDateControls(root.querySelector('#gift-tracking-date'), renderTracking);
    renderGameDateControls(root.querySelector('#gift-birthdays-date'), renderBirthdays);
    renderTracking();
    renderBirthdays();
    const villagerId = root.querySelector('#gift-villager').value;
    if (villagerId) renderVillagerGifts(villagerId);
  }

  root.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('btn--selected', b === btn));
      villagerPanel.classList.toggle('hidden', mode !== 'villager');
      searchPanel.classList.toggle('hidden', mode !== 'search');
      trackingPanel.classList.toggle('hidden', mode !== 'tracking');
      birthdaysPanel.classList.toggle('hidden', mode !== 'birthdays');
      if (mode === 'tracking') refreshDatePanels();
      if (mode === 'birthdays') refreshDatePanels();
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
