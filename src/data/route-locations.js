/** Valley locations for route planning — coords from map POIs */
export const ROUTE_LOCATIONS = [
  { id: 'farmhouse', x: 35.7, y: 40.4, region: 'valley' },
  { id: 'bus_stop', x: 41.6, y: 32.7, region: 'valley' },
  { id: 'community_center', x: 61.7, y: 34.3, region: 'valley' },
  { id: 'pierre', x: 58.9, y: 47.7, region: 'valley' },
  { id: 'joja', x: 72.3, y: 46.1, region: 'valley' },
  { id: 'saloon', x: 59.3, y: 52.6, region: 'valley' },
  { id: 'blacksmith', x: 71.1, y: 57.9, region: 'valley' },
  { id: 'museum', x: 73.5, y: 61.6, region: 'valley' },
  { id: 'willy', x: 67.5, y: 85.9, region: 'valley' },
  { id: 'robin', x: 56.9, y: 23.0, region: 'valley' },
  { id: 'marnie', x: 35.2, y: 57.9, region: 'valley' },
  { id: 'wizard', x: 18.0, y: 57.6, region: 'valley' },
  { id: 'adventurer_guild', x: 72.9, y: 17.9, region: 'valley' },
  { id: 'mines', x: 66.1, y: 16.8, region: 'valley' },
  { id: 'quarry', x: 83.3, y: 22.9, region: 'valley' },
  { id: 'spa', x: 50.3, y: 13.7, region: 'valley' },
  { id: 'sewer', x: 57.4, y: 64.2, region: 'valley' },
  { id: 'beach', x: 67.0, y: 79.5, region: 'valley' },
  { id: 'forest', x: 20.8, y: 69.0, region: 'valley' },
  { id: 'secret_woods', x: 14.1, y: 59.7, region: 'valley' },
  { id: 'desert_bus', x: 43.8, y: 42.6, region: 'desert' },
  { id: 'sandy_shop', x: 10.8, y: 83.8, region: 'desert' },
  { id: 'desert_trader', x: 84.2, y: 38.4, region: 'desert' },
  { id: 'skull_cavern', x: 17.1, y: 9.4, region: 'desert' },
  { id: 'island_pier', x: 50.0, y: 75.8, region: 'island' },
  { id: 'volcano', x: 53.0, y: 27.9, region: 'island' },
  { id: 'island_trader', x: 58.0, y: 36.0, region: 'island' },
];

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Nearest-neighbor route from farmhouse through selected stops */
export function optimizeRoute(selectedIds) {
  const start = ROUTE_LOCATIONS.find(l => l.id === 'farmhouse');
  const stops = selectedIds
    .filter(id => id !== 'farmhouse')
    .map(id => ROUTE_LOCATIONS.find(l => l.id === id))
    .filter(Boolean);

  if (!start || !stops.length) return stops;

  const route = [];
  let current = start;
  const remaining = [...stops];

  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((loc, i) => {
      const d = dist(current, loc);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    route.push(next);
    current = next;
  }

  return route;
}

export function getLocationsByRegion(region) {
  return ROUTE_LOCATIONS.filter(l => l.region === region);
}
