import { t } from '../i18n/index.js';
import { crops, SEASONS } from '../data/crops.js';

export function renderCalendar() {
  const root = document.createElement('div');
  root.className = 'tool-view tool-view--wide';
  root.innerHTML = `
    <div class="card card--wide">
      <h1>${t('tools.calendar.title')}</h1>
      <p class="hint">${t('calendar.hint')}</p>
      <div class="season-tabs" role="tablist">
        ${SEASONS.map((season, i) => `
          <button type="button" class="btn season-tab${i === 0 ? ' btn--selected' : ''}" data-season="${season}" role="tab">
            ${t(`season.${season}`)}
          </button>
        `).join('')}
      </div>
      <div id="calendar-content" class="calendar-content"></div>
    </div>
  `;

  const content = root.querySelector('#calendar-content');
  let activeSeason = 'spring';

  function renderSeason(season) {
    activeSeason = season;
    root.querySelectorAll('.season-tab').forEach(tab => {
      tab.classList.toggle('btn--selected', tab.dataset.season === season);
    });

    if (season === 'winter') {
      content.innerHTML = `<p class="calendar-empty">${t('calendar.winterEmpty')}</p>`;
      return;
    }

    const seasonCrops = crops
      .filter(crop => crop.seasons.includes(season))
      .sort((a, b) => a.growDays - b.growDays);

    if (!seasonCrops.length) {
      content.innerHTML = `<p class="calendar-empty">${t('calendar.noCrops')}</p>`;
      return;
    }

    content.innerHTML = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>${t('calendar.crop')}</th>
              <th>${t('calendar.growDays')}</th>
              <th>${t('calendar.regrow')}</th>
              <th>${t('calendar.seedCost')}</th>
              <th>${t('calendar.seasons')}</th>
            </tr>
          </thead>
          <tbody>
            ${seasonCrops.map(crop => `
              <tr>
                <td>${t(`crops.${crop.id}`)}</td>
                <td>${crop.growDays}</td>
                <td>${crop.regrowDays ? crop.regrowDays : '—'}</td>
                <td>${crop.cost}g</td>
                <td>${crop.seasons.map(s => t(`season.${s}`)).join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  root.querySelectorAll('.season-tab').forEach(tab => {
    tab.addEventListener('click', () => renderSeason(tab.dataset.season));
  });

  renderSeason(activeSeason);
  return root;
}
