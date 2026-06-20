import { t } from '../i18n/index.js';
import { bundleRooms } from '../data/bundles.js';
import { getBundleItemLabel } from '../data/bundle-item-labels.js';
import { getBundleItemHint, getItemSeasons } from '../data/bundle-sources.js';
import { SEASONS } from '../data/game-date.js';

const STORAGE_KEY = 'stardew-tools-bundles';

function getProgress() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function itemKey(roomId, bundleId, index) {
  return `${roomId}:${bundleId}:${index}`;
}

function itemLabel(id) {
  return getBundleItemLabel(id);
}

function collectRemaining(progress, seasonFilter) {
  const items = [];
  bundleRooms.forEach(room => {
    room.bundles.forEach(bundle => {
      bundle.items.forEach((item, index) => {
        const key = itemKey(room.id, bundle.id, index);
        if (progress[key]) return;
        const seasons = getItemSeasons(item.id);
        if (seasonFilter && seasons.length && !seasons.includes(seasonFilter)) return;
        items.push({
          key,
          roomId: room.id,
          bundleId: bundle.id,
          item,
          index,
          seasons,
        });
      });
    });
  });

  items.sort((a, b) => {
    if (seasonFilter) {
      const aMatch = a.seasons.includes(seasonFilter) ? 0 : 1;
      const bMatch = b.seasons.includes(seasonFilter) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }
    return t(`bundles.room.${a.roomId}`).localeCompare(t(`bundles.room.${b.roomId}`));
  });

  return items;
}

export function renderBundles() {
  const root = document.createElement('div');
  root.className = 'tool-view tool-view--wide';
  root.innerHTML = `
    <div class="card card--wide">
      <h1>${t('tools.bundles.title')}</h1>
      <p class="hint">${t('bundles.hint')}</p>
      <div class="bundle-mode-tabs">
        <button type="button" class="btn btn--selected" data-mode="all">${t('bundles.tabAll')}</button>
        <button type="button" class="btn" data-mode="remaining">${t('bundles.tabRemaining')}</button>
      </div>
      <div class="bundle-progress-bar">
        <div id="bundle-progress-fill" class="bundle-progress-bar__fill"></div>
      </div>
      <p id="bundle-progress-text" class="bundle-progress-text"></p>
      <button type="button" id="bundle-reset" class="btn btn--ghost btn--small">${t('bundles.reset')}</button>
      <div id="bundle-remaining-panel" class="hidden">
        <div class="bundle-remaining-filters">
          <label for="bundle-season-filter">${t('bundles.filterSeason')}</label>
          <select id="bundle-season-filter">
            <option value="">${t('bundles.allSeasons')}</option>
            ${SEASONS.map(s => `<option value="${s}">${t(`season.${s}`)}</option>`).join('')}
          </select>
        </div>
        <p id="bundle-remaining-count" class="bundle-remaining-count"></p>
        <ul id="bundle-remaining-list" class="bundle-remaining-list"></ul>
      </div>
      <div id="bundle-rooms" class="bundle-rooms"></div>
    </div>
  `;

  const roomsEl = root.querySelector('#bundle-rooms');
  const remainingPanel = root.querySelector('#bundle-remaining-panel');
  const remainingList = root.querySelector('#bundle-remaining-list');
  let progress = getProgress();
  let mode = 'all';

  function countTotals() {
    let total = 0;
    let done = 0;
    bundleRooms.forEach(room => {
      room.bundles.forEach(bundle => {
        bundle.items.forEach((_, index) => {
          total++;
          const key = itemKey(room.id, bundle.id, index);
          if (progress[key]) done++;
        });
      });
    });
    return { total, done };
  }

  function updateProgressBar() {
    const { total, done } = countTotals();
    const pct = total ? Math.round((done / total) * 100) : 0;
    root.querySelector('#bundle-progress-fill').style.width = `${pct}%`;
    root.querySelector('#bundle-progress-text').textContent = t('bundles.progress', { done, total, pct });
  }

  function renderRemaining() {
    const seasonFilter = root.querySelector('#bundle-season-filter').value;
    const remaining = collectRemaining(progress, seasonFilter || null);
    root.querySelector('#bundle-remaining-count').textContent = t('bundles.remainingCount', { count: remaining.length });
    remainingList.innerHTML = '';

    if (!remaining.length) {
      remainingList.innerHTML = `<li class="bundle-remaining-empty">${t('bundles.remainingEmpty')}</li>`;
      return;
    }

    remaining.forEach(({ key, roomId, bundleId, item }) => {
      const li = document.createElement('li');
      li.className = 'bundle-remaining-item';
      const hint = getBundleItemHint(item.id);
      li.innerHTML = `
        <label class="bundle-remaining-item__main">
          <input type="checkbox" data-key="${key}">
          <span>
            <strong>${itemLabel(item.id)}${item.qty > 1 ? ` ×${item.qty}` : ''}</strong>
            <span class="bundle-remaining-item__meta">${t(`bundles.room.${roomId}`)} · ${t(`bundles.bundle.${bundleId}`)}</span>
          </span>
        </label>
        <p class="bundle-remaining-item__hint">${hint}</p>
      `;
      li.querySelector('input').addEventListener('change', (e) => {
        progress[key] = e.target.checked;
        saveProgress(progress);
        updateProgressBar();
        renderRemaining();
        if (mode === 'all') renderRooms();
      });
      remainingList.appendChild(li);
    });
  }

  function renderRooms() {
    roomsEl.innerHTML = '';

    bundleRooms.forEach(room => {
      const section = document.createElement('section');
      section.className = 'bundle-room';

      let roomDone = 0;
      let roomTotal = 0;
      room.bundles.forEach(bundle => {
        roomTotal += bundle.items.length;
        bundle.items.forEach((_, index) => {
          if (progress[itemKey(room.id, bundle.id, index)]) roomDone++;
        });
      });

      section.innerHTML = `
        <h2 class="bundle-room__title">
          ${t(`bundles.room.${room.id}`)}
          <span class="bundle-room__count">${roomDone}/${roomTotal}</span>
        </h2>
      `;

      room.bundles.forEach(bundle => {
        const bundleEl = document.createElement('div');
        bundleEl.className = 'bundle-card';

        const bundleDone = bundle.items.filter((_, i) => progress[itemKey(room.id, bundle.id, i)]).length;
        const complete = bundleDone === bundle.items.length;

        bundleEl.innerHTML = `
          <h3 class="bundle-card__title${complete ? ' bundle-card__title--done' : ''}">
            ${t(`bundles.bundle.${bundle.id}`)}
            <span class="bundle-card__count">${bundleDone}/${bundle.items.length}</span>
          </h3>
          <p class="bundle-card__reward">${t(`bundles.reward.${bundle.id}`)}</p>
          <ul class="bundle-items" data-room="${room.id}" data-bundle="${bundle.id}"></ul>
        `;

        const list = bundleEl.querySelector('.bundle-items');
        bundle.items.forEach((item, index) => {
          const key = itemKey(room.id, bundle.id, index);
          const checked = progress[key];
          const li = document.createElement('li');
          li.className = `bundle-item${checked ? ' bundle-item--done' : ''}`;

          const label = document.createElement('label');
          label.className = 'bundle-item__label';
          label.innerHTML = `
            <input type="checkbox" data-key="${key}" ${checked ? 'checked' : ''}>
            <span class="bundle-item__text">
              ${itemLabel(item.id)}${item.qty > 1 ? ` ×${item.qty}` : ''}
              ${!checked ? `<span class="bundle-item__hint">${getBundleItemHint(item.id)}</span>` : ''}
            </span>
          `;

          label.querySelector('input').addEventListener('change', (e) => {
            progress[key] = e.target.checked;
            saveProgress(progress);
            updateProgressBar();
            renderRooms();
            if (mode === 'remaining') renderRemaining();
          });

          li.appendChild(label);
          list.appendChild(li);
        });

        section.appendChild(bundleEl);
      });

      roomsEl.appendChild(section);
    });
  }

  function setMode(next) {
    mode = next;
    root.querySelectorAll('[data-mode]').forEach(btn => {
      btn.classList.toggle('btn--selected', btn.dataset.mode === mode);
    });
    roomsEl.classList.toggle('hidden', mode !== 'all');
    remainingPanel.classList.toggle('hidden', mode !== 'remaining');
    if (mode === 'remaining') renderRemaining();
  }

  root.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  root.querySelector('#bundle-season-filter').addEventListener('change', renderRemaining);

  root.querySelector('#bundle-reset').addEventListener('click', () => {
    if (!confirm(t('bundles.resetConfirm'))) return;
    progress = {};
    saveProgress(progress);
    updateProgressBar();
    renderRooms();
    if (mode === 'remaining') renderRemaining();
  });

  updateProgressBar();
  renderRooms();
  return root;
}
