import { MAP_REGIONS } from './map-pois.js';

const STORAGE_KEY = 'stardew-tools-map-pois';

/** Pin calibration UI + localStorage overrides — dev only (`npm run dev`). */
export const MAP_POI_EDIT_ENABLED = import.meta.env.DEV;

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadRegionPois(regionId) {
  const defaults = MAP_REGIONS[regionId]?.pois ?? [];
  if (!MAP_POI_EDIT_ENABLED) {
    return defaults.map(poi => ({ ...poi }));
  }
  const saved = readStore()[regionId] || {};
  return defaults.map(poi => {
    const override = saved[poi.id];
    if (!override) return { ...poi };
    return { ...poi, x: override.x, y: override.y };
  });
}

export function savePoiPosition(regionId, poiId, x, y) {
  if (!MAP_POI_EDIT_ENABLED) return;
  const store = readStore();
  if (!store[regionId]) store[regionId] = {};
  store[regionId][poiId] = {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
  writeStore(store);
}

export function resetRegionPois(regionId) {
  if (!MAP_POI_EDIT_ENABLED) return;
  const store = readStore();
  delete store[regionId];
  writeStore(store);
}

export function exportPoiJson() {
  return JSON.stringify(readStore(), null, 2);
}

export function hasCustomPois(regionId) {
  const saved = readStore()[regionId];
  return Boolean(saved && Object.keys(saved).length);
}
