import { t } from '../i18n/index.js';
import { SPRINKLER_ASSETS } from '../data/sprinkler-assets.js';

const STORAGE_KEY = 'stardew-tools-grid-layout';

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
      <div class="button-row">
        <button type="button" id="grid-export" class="btn btn--ghost">${t('grid.export')}</button>
        <button type="button" id="grid-import" class="btn btn--ghost">${t('grid.import')}</button>
        <input type="file" id="grid-import-file" accept="application/json,.json" hidden>
      </div>
      <div class="grid-scroll">
        <div id="grid-container" class="grid-container"></div>
      </div>
      <div class="sprinkler-toolbar">
        <button type="button" class="btn btn--sprinkler" data-sprinkler="basic">
          <img src="${SPRINKLER_ASSETS.basic.ui}" alt="" class="sprinkler-btn__img" width="32" height="32" data-fallback="${SPRINKLER_ASSETS.basic.grid}">
          <span>${t('grid.basic')}</span>
        </button>
        <button type="button" class="btn btn--sprinkler" data-sprinkler="quality">
          <img src="${SPRINKLER_ASSETS.quality.ui}" alt="" class="sprinkler-btn__img" width="32" height="32" data-fallback="${SPRINKLER_ASSETS.quality.grid}">
          <span>${t('grid.quality')}</span>
        </button>
        <button type="button" class="btn btn--sprinkler" data-sprinkler="iridium">
          <img src="${SPRINKLER_ASSETS.iridium.ui}" alt="" class="sprinkler-btn__img" width="32" height="32" data-fallback="${SPRINKLER_ASSETS.iridium.grid}">
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

  function serializeLayout() {
    const sprinklers = [];
    root.querySelectorAll('.grid-cell').forEach(cell => {
      const type = getSprinklerType(cell);
      if (type) sprinklers.push({ index: parseInt(cell.dataset.index, 10), type });
    });
    return { version: 1, rows: gridRows, cols: gridCols, sprinklers };
  }

  function saveLayout() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeLayout()));
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
      saveLayout();
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
    saveLayout();
  }

  function buildGridCells() {
    gridContainer.innerHTML = '';
    counts.basic = 0;
    counts.quality = 0;
    counts.iridium = 0;

    for (let i = 0; i < gridRows * gridCols; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.index = i;
      cell.addEventListener('click', () => handleCellClick(cell));
      gridContainer.appendChild(cell);
    }

    applyCellSize();
    updateMaterialCosts();
  }

  function applyLayout(layout) {
    if (!layout?.rows || !layout?.cols || !Array.isArray(layout.sprinklers)) return false;

    gridRows = layout.rows;
    gridCols = layout.cols;
    root.querySelector('#grid-rows').value = gridRows;
    root.querySelector('#grid-cols').value = gridCols;
    buildGridCells();

    layout.sprinklers.forEach(({ index, type }) => {
      if (!['basic', 'quality', 'iridium'].includes(type)) return;
      if (index < 0 || index >= gridRows * gridCols) return;
      const cell = gridContainer.querySelector(`.grid-cell[data-index="${index}"]`);
      if (!cell || getSprinklerType(cell)) return;
      cell.classList.add(`sprinkler-${type}`);
      counts[type]++;
    });

    recalculateIrrigation();
    updateMaterialCosts();
    return true;
  }

  function generateGrid() {
    gridRows = parseInt(root.querySelector('#grid-rows').value, 10) || 10;
    gridCols = parseInt(root.querySelector('#grid-cols').value, 10) || 10;
    buildGridCells();
    saveLayout();
  }

  function loadSavedLayout() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && applyLayout(saved)) return;
    } catch {
      /* ignore */
    }
    generateGrid();
  }

  const onResize = () => applyCellSize();
  window.addEventListener('resize', onResize);

  root.querySelectorAll('.sprinkler-btn__img').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallback) img.src = img.dataset.fallback;
    }, { once: true });
  });

  root.querySelector('#generate-grid').addEventListener('click', generateGrid);

  root.querySelector('#grid-export').addEventListener('click', async () => {
    const json = JSON.stringify(serializeLayout(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      alert(t('grid.exported'));
    } catch {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sprinkler-layout.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  });

  const importFile = root.querySelector('#grid-import-file');
  root.querySelector('#grid-import').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    const file = importFile.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const layout = JSON.parse(reader.result);
        if (!applyLayout(layout)) throw new Error('invalid');
        saveLayout();
        alert(t('grid.importSuccess'));
      } catch {
        alert(t('grid.importError'));
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });

  sprinklerButtons.forEach(button => {
    button.addEventListener('click', () => setSprinklerSelection(button.dataset.sprinkler));
  });

  root.querySelector('#delete-mode').addEventListener('click', () => {
    deleteMode = true;
    selectedSprinkler = null;
    root.classList.add('delete-mode-active');
    sprinklerButtons.forEach(btn => btn.classList.remove('btn--selected'));
  });

  loadSavedLayout();

  return () => window.removeEventListener('resize', onResize);
}
