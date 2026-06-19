import { t } from '../i18n/index.js';
import { crops } from '../data/crops.js';

export function renderProfit() {
  const root = document.createElement('div');
  root.className = 'tool-view';

  const cropOptions = crops.map(crop =>
    `<option value="${crop.id}">${t(`crops.${crop.id}`)}</option>`
  ).join('');

  root.innerHTML = `
    <div class="card">
      <h1>${t('tools.profit.title')}</h1>
      <label for="profit-crop">${t('profit.crop')}</label>
      <select id="profit-crop">
        <option value="">${t('profit.selectCropOption')}</option>
        ${cropOptions}
      </select>
      <label for="profit-quality">${t('profit.quality')}</label>
      <select id="profit-quality">
        <option value="normal">${t('quality.normal')}</option>
        <option value="silver">${t('quality.silver')}</option>
        <option value="gold">${t('quality.gold')}</option>
        <option value="iridium">${t('quality.iridium')}</option>
      </select>
      <label for="profit-plots">${t('profit.plots')}</label>
      <input type="number" id="profit-plots" value="1" min="1">
      <label for="profit-harvests">${t('profit.harvests')}</label>
      <input type="number" id="profit-harvests" value="1" min="1">
      <label class="checkbox-label">
        <input type="checkbox" id="profit-greenhouse">
        ${t('profit.greenhouse')}
      </label>
      <p id="profit-greenhouse-hint" class="hint hidden">${t('profit.greenhouseHint')}</p>
      <button type="button" id="profit-calc" class="btn">${t('profit.calculate')}</button>
      <div id="profit-result" class="result-box"></div>
    </div>
  `;

  const cropSelect = root.querySelector('#profit-crop');
  const harvestsInput = root.querySelector('#profit-harvests');
  const greenhouseCheck = root.querySelector('#profit-greenhouse');
  const greenhouseHint = root.querySelector('#profit-greenhouse-hint');

  cropSelect.addEventListener('change', () => {
    const crop = crops.find(c => c.id === cropSelect.value);
    if (crop?.harvests) harvestsInput.value = crop.harvests;
  });

  greenhouseCheck.addEventListener('change', () => {
    greenhouseHint.classList.toggle('hidden', !greenhouseCheck.checked);
  });

  root.querySelector('#profit-calc').addEventListener('click', () => {
    const cropId = cropSelect.value;
    const quality = root.querySelector('#profit-quality').value;
    const plots = parseInt(root.querySelector('#profit-plots').value, 10) || 1;
    const harvests = parseInt(harvestsInput.value, 10) || 1;
    const resultEl = root.querySelector('#profit-result');

    if (!cropId) {
      resultEl.textContent = t('profit.selectCrop');
      return;
    }

    const crop = crops.find(c => c.id === cropId);
    const cost = crop.cost * plots;
    const price = crop.prices[quality];
    const revenue = price * plots * harvests;
    const profit = revenue - cost;
    const revenueTiller = Math.round(price * 1.1) * plots * harvests;
    const profitTiller = revenueTiller - cost;

    resultEl.innerHTML = `
      <p>${t('profit.cost', { cost })}</p>
      <p>${t('profit.revenue', { revenue })}</p>
      <p><strong>${t('profit.netProfit', { profit: Math.round(profit) })}</strong></p>
      <p>${t('profit.result', { plots, crop: t(`crops.${cropId}`), profit: Math.round(profit) })}</p>
      <p>${t('profit.withTiller', { profit: Math.round(profitTiller) })}</p>
      ${greenhouseCheck.checked ? `<p class="hint">${t('profit.greenhouseHint')}</p>` : ''}
    `;
  });

  return root;
}
