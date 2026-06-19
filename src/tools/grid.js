import { t } from '../i18n/index.js';

const SPRINKLER_ASSETS = {
  basic: '/assets/basic-sprinkler.png',
  quality: '/assets/quality-sprinkler.png',
  iridium: '/assets/iridium-sprinkler.png',
};

const sprinklerRanges = {
  basic: [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
  ],
  quality: [
    { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
    { x: -1, y: 0 }, { x: 1, y: 0 },
    { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 },
  ],
  iridium: [
    { x: -2, y: -2 }, { x: -1, y: -2 }, { x: 0, y: -2 }, { x: 1, y: -2 }, { x: 2, y: -2 },
    { x: -2, y: -1 }, { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 2, y: -1 },
    { x: -2, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    { x: -2, y: 1 }, { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
    { x: -2, y: 2 }, { x: -1, y: 2 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
  ],
};

const MAX_CELL = 44;
const MIN_CELL = 18;

export function renderGrid() {
  const root = document.createElement('div');
  root.className = 'tool-view tool-view--wide';
  root.innerHTML = `
    <div class="card card--wide">
      <h1>${t('tools.grid.title')}</h1>
      <div class="grid-settings">
        <label for="grid-rows">${t('grid.rows')}</label>
        <input type="number" id="grid-rows" value="10" min="1" max="40">
        <label for="grid-cols">${t('grid.cols')}</label>
        <input type="number" id="grid-cols" value="10" min="1" max="40">
        <button type="button" id="generate-grid" class="btn btn--accent">${t('grid.generate')}</button>
      </div>
      <div class="grid-scroll">
        <div id="grid-container" class="grid-container"></div>
      </div>
      <div class="sprinkler-toolbar">
        <button type="button" class="btn btn--sprinkler" data-sprinkler="basic">
          <img src="${SPRINKLER_ASSETS.basic}" alt="" class="sprinkler-btn__img" width="28" height="28">
          <span>${t('grid.basic')}</span>
        </button>
        <button type="button" class="btn btn--sprinkler" data-sprinkler="quality">
          <img src="${SPRINKLER_ASSETS.quality}" alt="" class="sprinkler-btn__img" width="28" height="28">
          <span>${t('grid.quality')}</span>
        </button>
        <button type="button" class="btn btn--sprinkler" data-sprinkler="iridium">
          <img src="${SPRINKLER_ASSETS.iridium}" alt="" class="sprinkler-btn__img" width="28" height="28">
          <span>${t('grid.iridium')}</span>
        </button>
      </div>
      <button type="button" id="delete-mode" class="btn btn--danger">${t('grid.deleteMode')}</button>
      <div class="materials-cost">
        <h3>${t('grid.materials')}</h3>
        <ul id="materials-list"></ul>
      </div>
    </div>
  `;

  const cleanup = initGridLogic(root);
  root.cleanup = cleanup;
  return root;
}

function initGridLogic(root) {
  let selectedSprinkler = null;
  let deleteMode = false;
  let gridRows = 10;
  let gridCols = 10;
  const counts = { basic: 0, quality: 0, iridium: 0 };

  const gridContainer = root.querySelector('#grid-container');
  const materialsList = root.querySelector('#materials-list');
  const sprinklerButtons = root.querySelectorAll('[data-sprinkler]');

  function getSprinklerType(cell) {
    if (cell.classList.contains('sprinkler-basic')) return 'basic';
    if (cell.classList.contains('sprinkler-quality')) return 'quality';
    if (cell.classList.contains('sprinkler-iridium')) return 'iridium';
    return null;
  }

  function computeCellSize() {
    const scroll = root.querySelector('.grid-scroll');
    const maxW = (scroll?.clientWidth || 640) - 8;
    const maxH = 420;
    const byW = Math.floor(maxW / gridCols);
    const byH = Math.floor(maxH / gridRows);
    return Math.max(MIN_CELL, Math.min(MAX_CELL, byW, byH));
  }

  function applyCellSize() {
    const size = computeCellSize();
    gridContainer.style.gridTemplateColumns = `repeat(${gridCols}, ${size}px)`;
    root.querySelectorAll('.grid-cell').forEach(cell => {
      cell.style.width = `${size}px`;
      cell.style.height = `${size}px`;
    });
  }

  function updateMaterialCosts() {
    materialsList.innerHTML = `
      <li>${t('grid.materialBasic', { copper: counts.basic, iron: counts.basic })}</li>
      <li>${t('grid.materialQuality', { iron: counts.quality, gold: counts.quality, quartz: counts.quality })}</li>
      <li>${t('grid.materialIridium', { gold: counts.iridium, iridium: counts.iridium, battery: counts.iridium })}</li>
    `;
  }

  function recalculateIrrigation() {
    root.querySelectorAll('.grid-cell').forEach(cell => {
      cell.classList.remove('irrigated');
    });

    root.querySelectorAll('.grid-cell').forEach(cell => {
      const type = getSprinklerType(cell);
      if (!type) return;

      const index = parseInt(cell.dataset.index, 10);
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;

      sprinklerRanges[type].forEach(offset => {
        const targetRow = row + offset.y;
        const targetCol = col + offset.x;
        if (targetRow < 0 || targetRow >= gridRows || targetCol < 0 || targetCol >= gridCols) return;

        const targetIndex = targetRow * gridCols + targetCol;
        const targetCell = gridContainer.querySelector(`.grid-cell[data-index="${targetIndex}"]`);
        if (targetCell && !getSprinklerType(targetCell)) {
          targetCell.classList.add('irrigated');
        }
      });
    });
  }

  function setSprinklerSelection(type) {
    selectedSprinkler = type;
    deleteMode = false;
    root.classList.remove('delete-mode-active');
    sprinklerButtons.forEach(btn => {
      btn.classList.toggle('btn--selected', btn.dataset.sprinkler === type);
    });
  }

  function handleCellClick(cell) {
    if (deleteMode) {
      const type = getSprinklerType(cell);
      if (!type) return;
      counts[type]--;
      cell.classList.remove('sprinkler-basic', 'sprinkler-quality', 'sprinkler-iridium', 'irrigated');
      recalculateIrrigation();
      updateMaterialCosts();
      return;
    }

    if (!selectedSprinkler) {
      alert(t('grid.selectSprinkler'));
      return;
    }

    if (getSprinklerType(cell)) return;

    cell.classList.add(`sprinkler-${selectedSprinkler}`);
    counts[selectedSprinkler]++;
    recalculateIrrigation();
    updateMaterialCosts();
  }

  function generateGrid() {
    gridRows = parseInt(root.querySelector('#grid-rows').value, 10) || 10;
    gridCols = parseInt(root.querySelector('#grid-cols').value, 10) || 10;

    gridContainer.innerHTML = '';

    for (let i = 0; i < gridRows * gridCols; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.index = i;
      cell.addEventListener('click', () => handleCellClick(cell));
      gridContainer.appendChild(cell);
    }

    counts.basic = 0;
    counts.quality = 0;
    counts.iridium = 0;
    applyCellSize();
    updateMaterialCosts();
  }

  const onResize = () => applyCellSize();
  window.addEventListener('resize', onResize);

  root.querySelector('#generate-grid').addEventListener('click', generateGrid);

  sprinklerButtons.forEach(button => {
    button.addEventListener('click', () => setSprinklerSelection(button.dataset.sprinkler));
  });

  root.querySelector('#delete-mode').addEventListener('click', () => {
    deleteMode = true;
    selectedSprinkler = null;
    root.classList.add('delete-mode-active');
    sprinklerButtons.forEach(btn => btn.classList.remove('btn--selected'));
  });

  generateGrid();

  return () => window.removeEventListener('resize', onResize);
}
