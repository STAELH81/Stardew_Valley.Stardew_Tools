import { t } from '../i18n/index.js';
import { MAP_REGIONS, MAP_CATEGORIES, MAP_REGION_ORDER, DEFAULT_MAP_REGION } from '../data/map-pois.js';
import {
  loadRegionPois,
  savePoiPosition,
  resetRegionPois,
  exportPoiJson,
  MAP_POI_EDIT_ENABLED,
} from '../data/map-poi-storage.js';

const MIN_ZOOM_FACTOR = 0.6;
const MAX_ZOOM_FACTOR = 3.5;

const IMAGE_MISSING_HINTS = {
  desert: 'map.imageMissingHintDesert',
  valley: 'map.imageMissingHint',
  island: 'map.imageMissingHintIsland',
};

/** Pin diameter in px — valley tiny, island slightly below old default, desert large */
const REGION_PIN_SIZES = {
  valley: { read: 5, edit: 4 },
  island: { read: 9, edit: 8 },
  desert: { read: 28, edit: 24 },
};

const regionTabsHtml = MAP_REGION_ORDER.map((regionId) => {
  const selected = regionId === DEFAULT_MAP_REGION ? ' btn--selected' : '';
  return `<button type="button" class="btn map-region-tab${selected}" data-region="${regionId}" role="tab">${t(`map.region.${regionId}`)}</button>`;
}).join('');

const editToolbarHtml = MAP_POI_EDIT_ENABLED
  ? `
        <button type="button" id="map-edit-toggle" class="btn btn--ghost btn--small">${t('map.editMode')}</button>`
  : '';

const editBarHtml = MAP_POI_EDIT_ENABLED
  ? `
      <div id="map-edit-bar" class="map-edit-bar hidden">
        <label for="map-edit-poi">${t('map.editSelectPoi')}</label>
        <select id="map-edit-poi"></select>
        <button type="button" id="map-reset-pois" class="btn btn--ghost btn--small">${t('map.resetPois')}</button>
        <button type="button" id="map-export-pois" class="btn btn--ghost btn--small">${t('map.exportPois')}</button>
        <p id="map-edit-status" class="hint map-edit-status"></p>
      </div>`
  : '';

export function renderMap() {
  const root = document.createElement('div');
  root.className = 'tool-view tool-view--wide';
  root.innerHTML = `
    <div class="card card--wide">
      <h1>${t('tools.map.title')}</h1>
      <p id="map-hint" class="hint">${t(MAP_POI_EDIT_ENABLED ? 'map.hintDev' : 'map.hint')}</p>
      <div class="map-region-tabs" role="tablist">
        ${regionTabsHtml}
      </div>
      <div class="map-toolbar">
        <label for="map-category">${t('map.filterCategory')}</label>
        <select id="map-category">
          ${MAP_CATEGORIES.map(cat => `<option value="${cat}">${t(`map.category.${cat}`)}</option>`).join('')}
        </select>
        ${editToolbarHtml}
        <div class="map-zoom-controls">
          <button type="button" id="map-zoom-out" class="btn btn--ghost btn--small" aria-label="${t('map.zoomOut')}">−</button>
          <button type="button" id="map-zoom-reset" class="btn btn--ghost btn--small">${t('map.resetView')}</button>
          <button type="button" id="map-zoom-in" class="btn btn--ghost btn--small" aria-label="${t('map.zoomIn')}">+</button>
        </div>
      </div>
      ${editBarHtml}
      <div id="map-missing" class="map-missing hidden"></div>
      <div id="map-viewport" class="map-viewport hidden">
        <div id="map-stage" class="map-stage">
          <img id="map-image" class="map-image" alt="" draggable="false">
          <div id="map-poi-layer" class="map-poi-layer"></div>
        </div>
      </div>
      <div id="map-poi-panel" class="map-poi-panel hidden">
        <h3 id="map-poi-title"></h3>
        <p id="map-poi-desc" class="hint"></p>
        <button type="button" id="map-poi-close" class="btn btn--ghost btn--small">${t('map.closePoi')}</button>
      </div>
      <p id="map-poi-count" class="hint map-poi-count"></p>
    </div>
  `;

  const cleanup = initMapLogic(root);
  root.cleanup = cleanup;
  return root;
}

function initMapLogic(root) {
  const viewport = root.querySelector('#map-viewport');
  const stage = root.querySelector('#map-stage');
  const img = root.querySelector('#map-image');
  const poiLayer = root.querySelector('#map-poi-layer');
  const missingEl = root.querySelector('#map-missing');
  const panel = root.querySelector('#map-poi-panel');
  const countEl = root.querySelector('#map-poi-count');
  const hintEl = root.querySelector('#map-hint');
  const editBar = root.querySelector('#map-edit-bar');
  const editPoiSelect = root.querySelector('#map-edit-poi');
  const editStatus = root.querySelector('#map-edit-status');
  const editToggle = root.querySelector('#map-edit-toggle');

  let regionId = DEFAULT_MAP_REGION;
  let regionPois = loadRegionPois(regionId);
  let editMode = false;
  let selectedEditPoiId = regionPois[0]?.id ?? '';
  let fitScale = 1;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let dragging = false;
  let pinDragging = null;
  let panStart = null;
  let lastX = 0;
  let lastY = 0;
  let activePoi = null;
  let candidateIndex = -1;
  const pointers = new Map();

  function reloadPois() {
    regionPois = loadRegionPois(regionId);
    if (!regionPois.some(p => p.id === selectedEditPoiId)) {
      selectedEditPoiId = regionPois[0]?.id ?? '';
    }
    populateEditSelect();
    renderPois();
  }

  function populateEditSelect() {
    if (!MAP_POI_EDIT_ENABLED || !editPoiSelect) return;
    editPoiSelect.innerHTML = regionPois
      .map(poi => `<option value="${poi.id}">${t(`map.poi.${poi.id}`)}</option>`)
      .join('');
    editPoiSelect.value = selectedEditPoiId;
  }

  function setEditStatus(message) {
    if (!MAP_POI_EDIT_ENABLED || !editStatus) return;
    editStatus.textContent = message;
    if (!message) return;
    window.clearTimeout(setEditStatus._timer);
    setEditStatus._timer = window.setTimeout(() => {
      editStatus.textContent = '';
    }, 2500);
  }

  function getFitScale() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const sw = stage.offsetWidth;
    const sh = stage.offsetHeight;
    if (!vw || !vh || !sw || !sh) return 1;
    return Math.min(vw / sw, vh / sh);
  }

  function updateFitScale() {
    fitScale = getFitScale();
  }

  function applyTransform() {
    stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  function clampView() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const sw = stage.offsetWidth * scale;
    const sh = stage.offsetHeight * scale;

    if (sw <= vw) tx = (vw - sw) / 2;
    else tx = Math.min(0, Math.max(vw - sw, tx));

    if (sh <= vh) ty = (vh - sh) / 2;
    else ty = Math.min(0, Math.max(vh - sh, ty));

    applyTransform();
  }

  function resetView() {
    updateFitScale();
    scale = fitScale;
    tx = 0;
    ty = 0;
    clampView();
  }

  function zoom(delta, cx, cy) {
    const prev = scale;
    scale = Math.max(fitScale * MIN_ZOOM_FACTOR, Math.min(fitScale * MAX_ZOOM_FACTOR, scale + delta));
    const ratio = scale / prev;
    tx = cx - (cx - tx) * ratio;
    ty = cy - (cy - ty) * ratio;
    clampView();
  }

  function syncStageLayout() {
    const w = img.naturalWidth || img.clientWidth;
    const h = img.naturalHeight || img.clientHeight;
    if (!w || !h) return;
    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
    poiLayer.style.width = `${w}px`;
    poiLayer.style.height = `${h}px`;
  }

  function clientToMapPercent(clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    const sx = (clientX - rect.left - tx) / scale;
    const sy = (clientY - rect.top - ty) / scale;
    const w = img.naturalWidth || img.clientWidth;
    const h = img.naturalHeight || img.clientHeight;
    const x = Math.max(0, Math.min(100, (sx / w) * 100));
    const y = Math.max(0, Math.min(100, (sy / h) * 100));
    return {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    };
  }

  function movePoi(poiId, x, y) {
    savePoiPosition(regionId, poiId, x, y);
    const poi = regionPois.find(p => p.id === poiId);
    if (poi) {
      poi.x = x;
      poi.y = y;
    }
    renderPois();
    setEditStatus(t('map.poiSaved', { name: t(`map.poi.${poiId}`), x, y }));
  }

  function showPoi(poi) {
    if (editMode) {
      selectedEditPoiId = poi.id;
      editPoiSelect.value = poi.id;
      return;
    }
    activePoi = poi;
    root.querySelector('#map-poi-title').textContent = t(`map.poi.${poi.id}`);
    root.querySelector('#map-poi-desc').textContent = t(`map.poi.${poi.id}.desc`);
    panel.classList.remove('hidden');
    poiLayer.querySelectorAll('.map-poi').forEach(btn => {
      btn.classList.toggle('map-poi--active', btn.dataset.poi === poi.id);
    });
  }

  function hidePoi() {
    activePoi = null;
    panel.classList.add('hidden');
    poiLayer.querySelectorAll('.map-poi').forEach(btn => btn.classList.remove('map-poi--active'));
  }

  function renderPois() {
    const category = root.querySelector('#map-category').value;
    const filtered = editMode
      ? regionPois
      : regionPois.filter(poi => category === 'all' || poi.category === category);
    const w = img.naturalWidth || img.clientWidth;
    const h = img.naturalHeight || img.clientHeight;

    poiLayer.innerHTML = '';
    filtered.forEach(poi => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `map-poi map-poi--${poi.category}`;
      if (editMode && poi.id === selectedEditPoiId) btn.classList.add('map-poi--edit-selected');
      btn.dataset.poi = poi.id;
      btn.style.left = `${(poi.x / 100) * w}px`;
      btn.style.top = `${(poi.y / 100) * h}px`;
      btn.title = editMode
        ? `${t(`map.poi.${poi.id}`)} (${poi.x}%, ${poi.y}%)`
        : t(`map.poi.${poi.id}`);
      btn.setAttribute('aria-label', t(`map.poi.${poi.id}`));

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPoi(poi);
      });

      if (editMode) {
        btn.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          e.preventDefault();
          selectedEditPoiId = poi.id;
          editPoiSelect.value = poi.id;
          pinDragging = poi.id;
          btn.classList.add('map-poi--dragging');
          poiLayer.querySelectorAll('.map-poi').forEach(el => {
            el.classList.toggle('map-poi--edit-selected', el.dataset.poi === poi.id);
          });
          btn.setPointerCapture(e.pointerId);
        });
      }

      poiLayer.appendChild(btn);
    });

    countEl.textContent = editMode
      ? t('map.editPoiCount', { count: regionPois.length })
      : t('map.poiCount', { count: filtered.length });
    if (activePoi && !filtered.some(p => p.id === activePoi.id)) hidePoi();
  }

  function setEditMode(on) {
    if (!MAP_POI_EDIT_ENABLED) return;
    editMode = on;
    editToggle.textContent = on ? t('map.editModeOff') : t('map.editMode');
    editToggle.classList.toggle('btn--selected', on);
    editBar.classList.toggle('hidden', !on);
    viewport.classList.toggle('map-viewport--edit', on);
    hintEl.textContent = on ? t('map.editHint') : t('map.hintDev');
    hidePoi();
    if (on) populateEditSelect();
    syncRegionPinSize();
    renderPois();
  }

  function showMissing() {
    const hintKey = IMAGE_MISSING_HINTS[regionId] || 'map.imageMissingHint';
    missingEl.innerHTML = `
      <p>${t('map.imageMissing')}</p>
      <p class="hint">${t(hintKey)}</p>
    `;
    missingEl.classList.remove('hidden');
    viewport.classList.add('hidden');
    countEl.textContent = '';
  }

  function showMap() {
    missingEl.classList.add('hidden');
    viewport.classList.remove('hidden');
    syncStageLayout();
    resetView();
    reloadPois();
  }

  function tryNextImage() {
    const images = MAP_REGIONS[regionId].images;
    candidateIndex += 1;
    if (candidateIndex >= images.length) {
      showMissing();
      return;
    }
    img.src = images[candidateIndex];
  }

  function syncRegionPinSize() {
    const sizes = REGION_PIN_SIZES[regionId] ?? REGION_PIN_SIZES.valley;
    const px = editMode ? sizes.edit : sizes.read;
    viewport.style.setProperty('--map-poi-size', `${px}px`);
    viewport.style.setProperty('--map-poi-border', regionId === 'desert' ? '2px' : '1px');
  }

  function syncRegionViewportClass() {
    viewport.classList.remove('map-viewport--region-desert', 'map-viewport--region-valley', 'map-viewport--region-island');
    viewport.classList.add(`map-viewport--region-${regionId}`);
    syncRegionPinSize();
  }

  function switchRegion(nextRegionId) {
    if (nextRegionId === regionId) return;
    regionId = nextRegionId;
    candidateIndex = -1;
    hidePoi();
    syncRegionViewportClass();
    root.querySelectorAll('.map-region-tab').forEach(tab => {
      tab.classList.toggle('btn--selected', tab.dataset.region === nextRegionId);
    });
    tryNextImage();
  }

  img.addEventListener('load', showMap);
  img.addEventListener('error', tryNextImage);

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    zoom((e.deltaY < 0 ? 0.12 : -0.12) * fitScale, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });

  viewport.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.map-poi')) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastX = e.clientX;
    lastY = e.clientY;
    panStart = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (pinDragging) {
      const { x, y } = clientToMapPercent(e.clientX, e.clientY);
      const btn = poiLayer.querySelector(`[data-poi="${pinDragging}"]`);
      if (btn) {
        const w = img.naturalWidth || img.clientWidth;
        const h = img.naturalHeight || img.clientHeight;
        btn.style.left = `${(x / 100) * w}px`;
        btn.style.top = `${(y / 100) * h}px`;
      }
      return;
    }

    if (!pointers.has(e.pointerId)) return;

    if (pointers.size === 1) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (panStart && Math.hypot(e.clientX - panStart.x, e.clientY - panStart.y) > 6) {
        panStart.moved = true;
        viewport.classList.add('map-viewport--dragging');
      }
      if (!editMode || panStart?.moved) {
        tx += dx;
        ty += dy;
        lastX = e.clientX;
        lastY = e.clientY;
        clampView();
      }
      return;
    }

    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const pts2 = [...pointers.values()];
      const dist2 = Math.hypot(pts2[0].x - pts2[1].x, pts2[0].y - pts2[1].y);
      const rect = viewport.getBoundingClientRect();
      zoom((dist2 - dist) * 0.004, rect.width / 2, rect.height / 2);
    }
  });

  function endPointer(e) {
    if (pinDragging) {
      const { x, y } = clientToMapPercent(e.clientX, e.clientY);
      movePoi(pinDragging, x, y);
      pinDragging = null;
      poiLayer.querySelectorAll('.map-poi--dragging').forEach(el => el.classList.remove('map-poi--dragging'));
      return;
    }

    if (editMode && panStart && e.pointerId === panStart.id && !panStart.moved && selectedEditPoiId) {
      const { x, y } = clientToMapPercent(e.clientX, e.clientY);
      movePoi(selectedEditPoiId, x, y);
    }

    panStart = null;
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      dragging = false;
      viewport.classList.remove('map-viewport--dragging');
    }
  }

  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);

  root.querySelector('#map-zoom-in').addEventListener('click', () => {
    zoom(0.25 * fitScale, viewport.clientWidth / 2, viewport.clientHeight / 2);
  });

  root.querySelector('#map-zoom-out').addEventListener('click', () => {
    zoom(-0.25 * fitScale, viewport.clientWidth / 2, viewport.clientHeight / 2);
  });

  root.querySelector('#map-zoom-reset').addEventListener('click', resetView);
  root.querySelector('#map-category').addEventListener('change', renderPois);
  root.querySelector('#map-poi-close').addEventListener('click', hidePoi);

  root.querySelectorAll('.map-region-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchRegion(tab.dataset.region));
  });

  if (MAP_POI_EDIT_ENABLED && editToggle) {
    editToggle.addEventListener('click', () => setEditMode(!editMode));

    editPoiSelect.addEventListener('change', () => {
      selectedEditPoiId = editPoiSelect.value;
      renderPois();
    });

    root.querySelector('#map-reset-pois').addEventListener('click', () => {
      if (!window.confirm(t('map.resetPoisConfirm'))) return;
      resetRegionPois(regionId);
      reloadPois();
      setEditStatus(t('map.poisReset'));
    });

    root.querySelector('#map-export-pois').addEventListener('click', async () => {
      const json = exportPoiJson();
      try {
        await navigator.clipboard.writeText(json);
        setEditStatus(t('map.exportCopied'));
      } catch {
        window.prompt(t('map.exportPois'), json);
      }
    });
  }

  if (MAP_POI_EDIT_ENABLED) populateEditSelect();
  syncRegionViewportClass();
  tryNextImage();

  const onResize = () => {
    syncStageLayout();
    const prevFit = fitScale;
    updateFitScale();
    if (prevFit > 0) scale *= fitScale / prevFit;
    renderPois();
    clampView();
  };
  window.addEventListener('resize', onResize);

  return () => window.removeEventListener('resize', onResize);
}
