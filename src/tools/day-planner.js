import { t } from '../i18n/index.js';
import { SEASONS, DAYS_PER_SEASON, formatGameDate } from '../data/game-date.js';
import { PRESET_TASKS, TOOL_UPGRADES } from '../data/planner-data.js';
import { optimizeRoute, getLocationsByRegion } from '../data/route-locations.js';

const STORAGE_KEY = 'stardew-tools-day-planner';
const GAME_DATE_KEY = 'stardew-tools-game-date';

function loadState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    checked: {},
    customTasks: [],
    routeSelected: [],
    upgradeDone: {},
  };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getGameDate() {
  const saved = JSON.parse(localStorage.getItem(GAME_DATE_KEY));
  if (saved?.season && saved?.day) return saved;
  return { season: 'spring', day: 1 };
}

function saveGameDate(season, day) {
  localStorage.setItem(GAME_DATE_KEY, JSON.stringify({ season, day: Number(day) }));
}

export function renderDayPlanner() {
  const root = document.createElement('div');
  root.className = 'tool-view tool-view--wide';
  let state = loadState();

  root.innerHTML = `
    <div class="card card--wide">
      <h1>${t('tools.planner.title')}</h1>
      <p class="hint">${t('planner.hint')}</p>

      <section class="planner-section">
        <h2>${t('planner.gameDate')}</h2>
        <div id="planner-game-date" class="game-date-row"></div>
      </section>

      <section class="planner-section">
        <h2>${t('planner.checklistTitle')}</h2>
        <ul id="planner-checklist" class="planner-checklist"></ul>
        <div class="planner-add-task">
          <input type="text" id="planner-custom-input" placeholder="${t('planner.addTaskPlaceholder')}">
          <button type="button" id="planner-add-task" class="btn btn--small">${t('planner.addTask')}</button>
        </div>
        <button type="button" id="planner-clear-done" class="btn btn--ghost btn--small">${t('planner.clearDone')}</button>
      </section>

      <section class="planner-section">
        <h2>${t('planner.routeTitle')}</h2>
        <p class="hint">${t('planner.routeHint')}</p>
        <div class="planner-route-regions">
          ${['valley', 'desert', 'island'].map(region => `
            <div class="planner-route-region">
              <h3>${t(`map.region.${region}`)}</h3>
              <div class="planner-route-stops" data-region="${region}"></div>
            </div>
          `).join('')}
        </div>
        <button type="button" id="planner-optimize" class="btn">${t('planner.optimizeRoute')}</button>
        <ol id="planner-route-result" class="planner-route-result"></ol>
        <p class="hint planner-route-note">${t('planner.routeNote')}</p>
      </section>

      <section class="planner-section">
        <h2>${t('planner.upgradesTitle')}</h2>
        <p class="hint">${t('planner.upgradesHint')}</p>
        <ul id="planner-upgrades" class="planner-upgrades"></ul>
      </section>
    </div>
  `;

  function renderGameDate() {
    const { season, day } = getGameDate();
    const el = root.querySelector('#planner-game-date');
    el.innerHTML = `
      <label for="planner-season">${t('gifts.gameSeason')}</label>
      <select id="planner-season">
        ${SEASONS.map(s => `<option value="${s}"${s === season ? ' selected' : ''}>${t(`season.${s}`)}</option>`).join('')}
      </select>
      <label for="planner-day">${t('gifts.gameDay')}</label>
      <input type="number" id="planner-day" min="1" max="${DAYS_PER_SEASON}" value="${day}">
      <span class="planner-date-display">${formatGameDate(season, day, t)}</span>
    `;
    el.querySelector('#planner-season').addEventListener('change', () => {
      saveGameDate(el.querySelector('#planner-season').value, el.querySelector('#planner-day').value);
      renderGameDate();
    });
    el.querySelector('#planner-day').addEventListener('change', () => {
      saveGameDate(el.querySelector('#planner-season').value, el.querySelector('#planner-day').value);
      renderGameDate();
    });
  }

  function renderChecklist() {
    const list = root.querySelector('#planner-checklist');
    list.innerHTML = '';

    PRESET_TASKS.forEach(taskId => {
      const key = `preset_${taskId}`;
      list.appendChild(createCheckItem(key, t(`planner.task.${taskId}`), state.checked[key]));
    });

    state.customTasks.forEach(task => {
      list.appendChild(createCheckItem(task.id, task.text, state.checked[task.id], true));
    });
  }

  function createCheckItem(key, label, checked, isCustom = false) {
    const li = document.createElement('li');
    li.className = `planner-check-item${checked ? ' planner-check-item--done' : ''}`;
    li.innerHTML = `
      <label>
        <input type="checkbox" data-key="${key}" ${checked ? 'checked' : ''}>
        <span>${label}</span>
      </label>
      ${isCustom ? `<button type="button" class="btn btn--ghost btn--small planner-remove-task" data-key="${key}">×</button>` : ''}
    `;
    li.querySelector('input').addEventListener('change', (e) => {
      state.checked[key] = e.target.checked;
      saveState(state);
      renderChecklist();
    });
    li.querySelector('.planner-remove-task')?.addEventListener('click', () => {
      state.customTasks = state.customTasks.filter(tk => tk.id !== key);
      delete state.checked[key];
      saveState(state);
      renderChecklist();
    });
    return li;
  }

  function renderRouteStops() {
    ['valley', 'desert', 'island'].forEach(region => {
      const container = root.querySelector(`.planner-route-stops[data-region="${region}"]`);
      container.innerHTML = getLocationsByRegion(region).map(loc => `
        <label class="planner-route-stop">
          <input type="checkbox" value="${loc.id}" ${state.routeSelected.includes(loc.id) ? 'checked' : ''}>
          ${t(`map.poi.${loc.id}`)}
        </label>
      `).join('');

      container.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
          if (input.checked) {
            if (!state.routeSelected.includes(input.value)) state.routeSelected.push(input.value);
          } else {
            state.routeSelected = state.routeSelected.filter(id => id !== input.value);
          }
          saveState(state);
          renderRouteResult();
        });
      });
    });
  }

  function renderRouteResult() {
    const result = root.querySelector('#planner-route-result');
    const selected = state.routeSelected.filter(id => id !== 'farmhouse');
    if (!selected.length) {
      result.innerHTML = '';
      return;
    }
    const route = optimizeRoute(selected);
    result.innerHTML = `
      <li class="planner-route-start">${t('planner.startFrom')}: ${t('map.poi.farmhouse')}</li>
      ${route.map((loc, i) => `
        <li>
          <span class="planner-route-step">${i + 1}</span>
          ${t(`map.poi.${loc.id}`)}
          <a href="#/map" class="planner-route-map-link">${t('planner.openMap')}</a>
        </li>
      `).join('')}
    `;
  }

  function renderUpgrades() {
    const list = root.querySelector('#planner-upgrades');
    list.innerHTML = TOOL_UPGRADES.map(up => {
      const done = state.upgradeDone[up.id];
      const mats = up.materials.map(m => `${t(`planner.material.${m.id}`)} ×${m.qty}`).join(', ');
      return `
        <li class="planner-upgrade-item${done ? ' planner-upgrade-item--done' : ''}">
          <label>
            <input type="checkbox" data-upgrade="${up.id}" ${done ? 'checked' : ''}>
            <span>
              <strong>${t(`planner.tool.${up.tool}`)} — ${t(`planner.tier.${up.tier}`)}</strong>
              <span class="planner-upgrade-meta">${up.cost.toLocaleString()}g · ${mats}</span>
            </span>
          </label>
        </li>
      `;
    }).join('');

    list.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', () => {
        state.upgradeDone[input.dataset.upgrade] = input.checked;
        saveState(state);
        renderUpgrades();
      });
    });
  }

  root.querySelector('#planner-add-task').addEventListener('click', () => {
    const input = root.querySelector('#planner-custom-input');
    const text = input.value.trim();
    if (!text) return;
    const id = `custom_${Date.now()}`;
    state.customTasks.push({ id, text });
    saveState(state);
    input.value = '';
    renderChecklist();
  });

  root.querySelector('#planner-custom-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') root.querySelector('#planner-add-task').click();
  });

  root.querySelector('#planner-clear-done').addEventListener('click', () => {
    Object.keys(state.checked).forEach(key => {
      if (state.checked[key]) state.checked[key] = false;
    });
    saveState(state);
    renderChecklist();
  });

  root.querySelector('#planner-optimize').addEventListener('click', renderRouteResult);

  renderGameDate();
  renderChecklist();
  renderRouteStops();
  renderRouteResult();
  renderUpgrades();

  return root;
}
