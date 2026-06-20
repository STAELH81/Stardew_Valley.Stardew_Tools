import { t } from '../i18n/index.js';
import { fish } from './fish.js';

/** Source category per bundle item id */
export const itemSourceKeys = {
  wild_horseradish: 'forage_spring',
  daffodil: 'forage_spring',
  leek: 'forage_spring',
  dandelion: 'forage_spring',
  grape: 'forage_summer',
  spice_berry: 'forage_summer',
  sweet_pea: 'forage_summer',
  red_mushroom: 'forage_summer_fall',
  common_mushroom: 'forage_fall',
  wild_plum: 'forage_fall',
  hazelnut: 'forage_fall',
  blackberry: 'forage_fall',
  winter_root: 'forage_winter',
  crystal_fruit: 'forage_winter',
  snow_yam: 'forage_winter',
  crocus: 'forage_winter',
  wood: 'chop_wood',
  stone: 'mine_stone',
  hardwood: 'chop_hardwood',
  clay: 'mine_clay',
  coconut: 'forage_island',
  cactus_fruit: 'forage_desert',
  cave_carrot: 'mine_cave',
  purple_mushroom: 'forage_mine',
  maple_syrup: 'tapper_maple',
  oak_resin: 'tapper_oak',
  pine_tar: 'tapper_pine',
  parsnip: 'crop_spring',
  green_bean: 'crop_spring',
  cauliflower: 'crop_spring',
  potato: 'crop_spring',
  tomato: 'crop_summer',
  hot_pepper: 'crop_summer',
  blueberry: 'crop_summer',
  melon: 'crop_summer',
  corn: 'crop_fall_summer',
  eggplant: 'crop_fall',
  pumpkin: 'crop_fall',
  yam: 'crop_fall',
  gold_parsnip: 'quality_crop',
  gold_melon: 'quality_crop',
  gold_pumpkin: 'quality_crop',
  gold_corn: 'quality_crop',
  large_milk: 'animal_cow',
  large_brown_egg: 'animal_chicken',
  large_white_egg: 'animal_chicken',
  large_goat_milk: 'animal_goat',
  wool: 'animal_sheep',
  duck_egg: 'animal_duck',
  truffle_oil: 'artisan_oil',
  cloth: 'artisan_loom',
  goat_cheese: 'artisan_cheese',
  cheese: 'artisan_cheese',
  honey: 'artisan_bee',
  jelly: 'artisan_preserves',
  apple: 'fruit_tree',
  apricot: 'fruit_tree',
  orange: 'fruit_tree',
  peach: 'fruit_tree',
  pomegranate: 'fruit_tree',
  cherry: 'fruit_tree',
  copper_bar: 'smelt_copper',
  iron_bar: 'smelt_iron',
  gold_bar: 'smelt_gold',
  refined_quartz: 'smelt_quartz',
  earth_crystal: 'mine_geode',
  frozen_tear: 'mine_geode',
  fire_quartz: 'mine_geode',
  emerald: 'mine_gem',
  aquamarine: 'mine_gem',
  ruby: 'mine_gem',
  amethyst: 'mine_gem',
  topaz: 'mine_gem',
  jade: 'mine_gem',
  tigerseye: 'mine_skull',
  slime: 'combat_slime',
  bat_wing: 'combat_bats',
  solar_essence: 'combat_solar',
  void_essence: 'combat_void',
  gold_2500: 'gold_wallet',
  gold_5000: 'gold_wallet',
  gold_10000: 'gold_wallet',
  gold_25000: 'gold_wallet',
  fiddlehead_fern: 'forage_summer',
  truffle: 'animal_pig',
  poppy: 'crop_summer',
  maki_roll: 'cooking',
  fried_egg: 'cooking',
  cookie: 'cooking',
  hashbrowns: 'cooking',
  pancakes: 'cooking',
  salmon_dinner: 'cooking',
  fish_taco: 'cooking',
  escargot: 'cooking',
  lobster_bisque: 'cooking',
  survival_burger: 'cooking',
  plum_pudding: 'cooking',
  sea_urchin: 'forage_beach',
  sunflower: 'crop_summer_fall',
  duck_feather: 'animal_duck',
  red_cabbage: 'crop_summer',
  sea_cucumber: 'fish',
  squid_ink: 'fish',
  nautilus_shell: 'forage_beach',
  chub: 'fish',
  golden_pumpkin: 'event_spirit',
  wheat: 'crop_summer_fall',
  hay: 'shop_marnie',
  wine: 'artisan_keg',
  rabbits_foot: 'combat_rabbit',
};

const FISH_IDS = new Set([
  'sunfish', 'catfish', 'shad', 'tiger_trout', 'largemouth_bass', 'carp', 'bullhead', 'sturgeon',
  'sardine', 'tuna', 'red_mullet', 'herring', 'walleye', 'bream', 'eel', 'pufferfish', 'ghostfish',
  'sandfish', 'woodskip', 'lobster', 'crayfish', 'crab', 'cockle', 'mussel', 'shrimp', 'snail',
  'periwinkle', 'oyster', 'clam', 'chub', 'sea_cucumber', 'squid_ink',
]);

const CRAB_POT_IDS = new Set(['lobster', 'crayfish', 'crab', 'cockle', 'mussel', 'shrimp', 'snail', 'periwinkle', 'oyster', 'clam']);

function formatFishHint(fishId) {
  const entry = fish.find(f => f.id === fishId);
  if (!entry) {
    if (CRAB_POT_IDS.has(fishId)) return t('bundles.source.crab_pot');
    return t('bundles.source.fish_generic');
  }
  if (entry.crabPot || entry.location === 'crab_pot') return t('bundles.source.crab_pot');
  const seasons = entry.seasons.map(s => t(`season.${s}`)).join(', ');
  const location = t(`fish.location.${entry.location}`);
  const weather = entry.weather !== 'any' ? ` · ${t(`fish.weather.${entry.weather}`)}` : '';
  const time = entry.time === 'any' ? t('fish.timeAny') : entry.time;
  return t('bundles.source.fish_detail', { seasons, location, time, weather });
}

export function getBundleItemHint(itemId) {
  if (FISH_IDS.has(itemId)) return formatFishHint(itemId);
  const key = itemSourceKeys[itemId];
  if (!key) return t('bundles.source.unknown');
  return t(`bundles.source.${key}`);
}

/** Season relevance for priority sorting (0 = not seasonal, 1-4 = best season match) */
export function getItemSeasons(itemId) {
  if (FISH_IDS.has(itemId)) {
    const entry = fish.find(f => f.id === itemId);
    return entry?.seasons || [];
  }
  const key = itemSourceKeys[itemId];
  const seasonMap = {
    forage_spring: ['spring'],
    forage_summer: ['summer'],
    forage_summer_fall: ['summer', 'fall'],
    forage_fall: ['fall'],
    forage_winter: ['winter'],
    crop_spring: ['spring'],
    crop_summer: ['summer'],
    crop_fall: ['fall'],
    crop_fall_summer: ['summer', 'fall'],
    crop_summer_fall: ['summer', 'fall'],
    quality_crop: ['spring', 'summer', 'fall'],
  };
  return seasonMap[key] || [];
}
