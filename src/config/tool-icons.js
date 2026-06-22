/** Home menu icons — custom PNG assets in public/assets/icons/ */
export const TOOL_ICON_FILES = {
  grid: 'SprinlerIcon.png',
  quests: 'QuestIcon.png',
  profit: 'ProfitIcon.png',
  calendar: 'CalendarIcon.png',
  fish: 'FishIcon.png',
  bundles: 'CCenterIcon.png',
  gifts: 'NPCIcon.png',
  map: 'MapIcon.png',
  planner: 'DailyTemplate.png',
};

export function getToolIconSrc(toolId) {
  const file = TOOL_ICON_FILES[toolId];
  return file ? `/assets/icons/${file}` : null;
}
