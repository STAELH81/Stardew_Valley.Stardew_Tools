import { renderGrid } from './grid.js';
import { renderQuests } from './quests.js';
import { renderProfit } from './profit.js';
import { renderComingSoon } from './coming-soon.js';

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
    available: false,
    render: () => renderComingSoon('calendar'),
  },
  {
    id: 'fish',
    icon: 'fish',
    available: false,
    render: () => renderComingSoon('fish'),
  },
  {
    id: 'bundles',
    icon: 'bundle',
    available: false,
    render: () => renderComingSoon('bundles'),
  },
  {
    id: 'gifts',
    icon: 'gift',
    available: false,
    render: () => renderComingSoon('gifts'),
  },
  {
    id: 'map',
    icon: 'map',
    available: false,
    render: () => renderComingSoon('map'),
  },
];

export function getTool(id) {
  return tools.find(tool => tool.id === id);
}
