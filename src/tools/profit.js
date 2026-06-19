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
      <button type="button" id="profit-calc" class="btn">${t('profit.calculate')}</button>
      <div id="profit-result" class="result-box"></div>
    </div>
  `;

  root.querySelector('#profit-calc').addEventListener('click', () => {
    const cropId = root.querySelector('#profit-crop').value;
    const quality = root.querySelector('#profit-quality').value;
    const plots = parseInt(root.querySelector('#profit-plots').value, 10) || 1;
    const resultEl = root.querySelector('#profit-result');

    if (!cropId) {
      resultEl.textContent = t('profit.selectCrop');
      return;
    }

    const crop = crops.find(c => c.id === cropId);
    const cost = crop.cost * plots;
    const price = crop.prices[quality];
    const profit = price * plots - cost;
    const profitTiller = Math.round(price * 1.1) * plots - cost;

    resultEl.innerHTML = `
      <p>${t('profit.result', { plots, crop: t(`crops.${cropId}`), profit: Math.round(profit) })}</p>
      <p>${t('profit.withTiller', { profit: Math.round(profitTiller) })}</p>
    `;
  });

  return root;
}
