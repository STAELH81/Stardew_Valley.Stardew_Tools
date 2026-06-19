import { t } from '../i18n/index.js';
import { bundleRooms } from '../data/bundles.js';
import { getBundleItemLabel } from '../data/bundle-item-labels.js';

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

export function renderBundles() {
  const root = document.createElement('div');
  root.className = 'tool-view tool-view--wide';
  root.innerHTML = `
    <div class="card card--wide">
      <h1>${t('tools.bundles.title')}</h1>
      <p class="hint">${t('bundles.hint')}</p>
      <div class="bundle-progress-bar">
        <div id="bundle-progress-fill" class="bundle-progress-bar__fill"></div>
      </div>
      <p id="bundle-progress-text" class="bundle-progress-text"></p>
      <button type="button" id="bundle-reset" class="btn btn--ghost btn--small">${t('bundles.reset')}</button>
      <div id="bundle-rooms" class="bundle-rooms"></div>
    </div>
  `;

  const roomsEl = root.querySelector('#bundle-rooms');
  let progress = getProgress();

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
          const li = document.createElement('li');
          li.className = 'bundle-item';

          const label = document.createElement('label');
          label.className = 'bundle-item__label';
          label.innerHTML = `
            <input type="checkbox" data-key="${key}" ${progress[key] ? 'checked' : ''}>
            <span class="bundle-item__text">${itemLabel(item.id)}${item.qty > 1 ? ` ×${item.qty}` : ''}</span>
          `;

          label.querySelector('input').addEventListener('change', (e) => {
            progress[key] = e.target.checked;
            saveProgress(progress);
            updateProgressBar();
            renderRooms();
          });

          li.appendChild(label);
          list.appendChild(li);
        });

        section.appendChild(bundleEl);
      });

      roomsEl.appendChild(section);
    });
  }

  root.querySelector('#bundle-reset').addEventListener('click', () => {
    if (!confirm(t('bundles.resetConfirm'))) return;
    progress = {};
    saveProgress(progress);
    updateProgressBar();
    renderRooms();
  });

  updateProgressBar();
  renderRooms();
  return root;
}
