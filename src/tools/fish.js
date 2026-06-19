import { t, getLocale } from '../i18n/index.js';
import { fish, FISH_WEATHER, FISH_LOCATIONS } from '../data/fish.js';
import { getFishLabel } from '../data/fish-labels.js';
import { SEASONS } from '../data/crops.js';

function fishName(id) {
  return getFishLabel(id, getLocale());
}

function formatSeasons(seasons) {
  if (seasons.length === 4) return t('fish.allSeasons');
  return seasons.map(s => t(`season.${s}`)).join(', ');
}

function formatWeather(weather) {
  if (weather === 'rain') return t('fish.weather.rain');
  if (weather === 'sunny') return t('fish.weather.sunny');
  return t('fish.weather.any');
}

export function renderFish() {
  const root = document.createElement('div');
  root.className = 'tool-view tool-view--wide';
  root.innerHTML = `
    <div class="card card--wide">
      <h1>${t('tools.fish.title')}</h1>
      <p class="hint">${t('fish.hint')}</p>
      <div class="fish-filters">
        <label for="fish-search">${t('fish.search')}</label>
        <input type="text" id="fish-search" placeholder="${t('fish.searchPlaceholder')}">
        <label for="fish-season">${t('fish.filterSeason')}</label>
        <select id="fish-season">
          <option value="">${t('fish.allSeasons')}</option>
          ${SEASONS.map(s => `<option value="${s}">${t(`season.${s}`)}</option>`).join('')}
        </select>
        <label for="fish-weather">${t('fish.filterWeather')}</label>
        <select id="fish-weather">
          <option value="">${t('fish.weather.any')}</option>
          ${FISH_WEATHER.filter(w => w !== 'any').map(w => `<option value="${w}">${t(`fish.weather.${w}`)}</option>`).join('')}
        </select>
        <label for="fish-location">${t('fish.filterLocation')}</label>
        <select id="fish-location">
          <option value="">${t('fish.allLocations')}</option>
          ${FISH_LOCATIONS.map(loc => `<option value="${loc}">${t(`fish.location.${loc}`)}</option>`).join('')}
        </select>
      </div>
      <div id="fish-content" class="calendar-content"></div>
    </div>
  `;

  const content = root.querySelector('#fish-content');

  function renderTable() {
    const query = root.querySelector('#fish-search').value.toLowerCase();
    const season = root.querySelector('#fish-season').value;
    const weather = root.querySelector('#fish-weather').value;
    const location = root.querySelector('#fish-location').value;

    const filtered = fish.filter(entry => {
      const name = fishName(entry.id).toLowerCase();
      if (query && !name.includes(query) && !entry.id.includes(query)) return false;
      if (season && !entry.seasons.includes(season)) return false;
      if (weather && entry.weather !== 'any' && entry.weather !== weather) return false;
      if (location && entry.location !== location) return false;
      return true;
    }).sort((a, b) => fishName(a.id).localeCompare(fishName(b.id)));

    if (!filtered.length) {
      content.innerHTML = `<p class="calendar-empty">${t('fish.noResults')}</p>`;
      return;
    }

    content.innerHTML = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>${t('fish.name')}</th>
              <th>${t('fish.location')}</th>
              <th>${t('fish.seasons')}</th>
              <th>${t('fish.weatherLabel')}</th>
              <th>${t('fish.time')}</th>
              <th>${t('fish.difficulty')}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(entry => `
              <tr>
                <td>${fishName(entry.id)}${entry.crabPot ? ` <span class="fish-badge">${t('fish.crabPot')}</span>` : ''}</td>
                <td>${t(`fish.location.${entry.location}`)}</td>
                <td>${formatSeasons(entry.seasons)}</td>
                <td>${formatWeather(entry.weather)}</td>
                <td>${entry.time === 'any' ? t('fish.timeAny') : entry.time}</td>
                <td>${entry.crabPot ? '—' : entry.difficulty}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <p class="hint fish-count">${t('fish.count', { count: filtered.length })}</p>
    `;
  }

  root.querySelector('#fish-search').addEventListener('input', renderTable);
  root.querySelector('#fish-season').addEventListener('change', renderTable);
  root.querySelector('#fish-weather').addEventListener('change', renderTable);
  root.querySelector('#fish-location').addEventListener('change', renderTable);

  renderTable();
  return root;
}
