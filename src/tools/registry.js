import { renderGrid } from './grid.js';
import { renderQuests } from './quests.js';
import { renderProfit } from './profit.js';
import { renderCalendar } from './calendar.js';
import { renderFish } from './fish.js';
import { renderBundles } from './bundles.js';
import { renderGifts } from './gifts.js';
import { renderMap } from './map.js';
import { renderDayPlanner } from './day-planner.js';

export const tools = [
  {
    id: 'grid',
    icon: 'sprinkler',
    available: true,
    render: renderGrid,
  },
  {
    id: 'quests',
    icon: 'quest',
    available: true,
    render: renderQuests,
  },
  {
    id: 'profit',
    icon: 'crop',
    available: true,
    render: renderProfit,
  },
  {
    id: 'calendar',
    icon: 'calendar',
    available: true,
    render: renderCalendar,
  },
  {
    id: 'fish',
    icon: 'fish',
    available: true,
    render: renderFish,
  },
  {
    id: 'bundles',
    icon: 'bundle',
    available: true,
    render: renderBundles,
  },
  {
    id: 'gifts',
    icon: 'gift',
    available: true,
    render: renderGifts,
  },
  {
    id: 'map',
    icon: 'map',
    available: true,
    render: renderMap,
  },
  {
    id: 'planner',
    icon: 'planner',
    available: true,
    render: renderDayPlanner,
  },
];

export function getTool(id) {
  return tools.find(tool => tool.id === id);
}
