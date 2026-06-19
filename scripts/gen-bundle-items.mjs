import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, '../src/data/bundle-item-labels.js'), 'utf8');

const items = {};
const re = /(\w+):\s*\{\s*en:\s*'((?:\\'|[^'])*)',\s*fr:\s*'((?:\\'|[^'])*)'/g;
let m;
while ((m = re.exec(src))) {
  items[m[1]] = { en: m[2].replace(/\\'/g, "'"), fr: m[3].replace(/\\'/g, "'") };
}

items.fiddlehead_fern = {
  en: 'Fiddlehead Fern',
  fr: 'Crosse de fougère',
};

const de = {
  wild_horseradish: 'Wilder Meerrettich', daffodil: 'Narzisse', leek: 'Lauch', dandelion: 'Löwenzahn',
  grape: 'Traube', spice_berry: 'Würzbeere', sweet_pea: 'Süßerbse', red_mushroom: 'Roter Pilz',
  common_mushroom: 'Champignon', wild_plum: 'Wildpflaume', hazelnut: 'Haselnuss', blackberry: 'Brombeere',
  winter_root: 'Winterwurzel', crystal_fruit: 'Kristallfrucht', snow_yam: 'Schneejamswurzel', crocus: 'Krokus',
  wood: 'Holz', stone: 'Stein', hardwood: 'Hartholz', clay: 'Lehm',
  coconut: 'Kokosnuss', cactus_fruit: 'Kaktusfrucht', cave_carrot: 'Höhlenkarotte', purple_mushroom: 'Lila Pilz',
  maple_syrup: 'Ahornsirup', oak_resin: 'Eichenharz', pine_tar: 'Pinteer',
  parsnip: 'Pastinake', green_bean: 'Grüne Bohne', cauliflower: 'Blumenkohl', potato: 'Kartoffel',
  tomato: 'Tomate', hot_pepper: 'Scharfe Paprika', blueberry: 'Blaubeere', melon: 'Melone',
  corn: 'Mais', eggplant: 'Aubergine', pumpkin: 'Kürbis', yam: 'Igname',
  gold_parsnip: 'Pastinake (Gold)', gold_melon: 'Melone (Gold)', gold_pumpkin: 'Kürbis (Gold)', gold_corn: 'Mais (Gold)',
  large_milk: 'Große Milch', large_brown_egg: 'Großes braunes Ei', large_white_egg: 'Großes weißes Ei',
  large_goat_milk: 'Große Ziegenmilch', wool: 'Wolle', duck_egg: 'Entenei',
  truffle_oil: 'Trüffelöl', cloth: 'Stoff', goat_cheese: 'Ziegenkäse', cheese: 'Käse', honey: 'Honig',
  jelly: 'Gelee (beliebig)', apple: 'Apfel', apricot: 'Aprikose', orange: 'Orange', peach: 'Pfirsich',
  pomegranate: 'Granatapfel', cherry: 'Kirsche',
  sunfish: 'Sonnenbarsch', catfish: 'Wels', shad: 'Alse', tiger_trout: 'Tigerforelle',
  largemouth_bass: 'Forellenbarsch', carp: 'Karpfen', bullhead: 'Katzenwels', sturgeon: 'Stör',
  sardine: 'Sardine', tuna: 'Thunfisch', red_mullet: 'Rotbarbe', herring: 'Hering',
  walleye: 'Zander', bream: 'Brasse', eel: 'Aal', pufferfish: 'Kugelfisch', ghostfish: 'Geisterfisch',
  sandfish: 'Sandfisch', woodskip: 'Holzskipp', lobster: 'Hummer', crayfish: 'Flusskrebs', crab: 'Krabbe',
  cockle: 'Herzmuschel', mussel: 'Miesmuschel', shrimp: 'Garnele', snail: 'Schnecke', periwinkle: 'Strandschnecke',
  oyster: 'Auster', clam: 'Muschel',
  copper_bar: 'Kupferbarren', iron_bar: 'Eisenbarren', gold_bar: 'Goldbarren', refined_quartz: 'Raffinierter Quarz',
  earth_crystal: 'Erdkristall', frozen_tear: 'Gefrorene Träne', fire_quartz: 'Feuerquarz',
  emerald: 'Smaragd', aquamarine: 'Aquamarin', ruby: 'Rubin', amethyst: 'Amethyst', topaz: 'Topas', jade: 'Jade',
  tigerseye: 'Tigerauge', slime: 'Schleim', bat_wing: 'Fledermausflügel',
  solar_essence: 'Sonnenessenz', void_essence: 'Leerenessenz',
  gold_2500: 'Spende 2.500g', gold_5000: 'Spende 5.000g', gold_10000: 'Spende 10.000g', gold_25000: 'Spende 25.000g',
  truffle: 'Trüffel', poppy: 'Mohn', maki_roll: 'Maki-Rolle', fried_egg: 'Spiegelei', cookie: 'Keks',
  hashbrowns: 'Rösti', pancakes: 'Pfannkuchen', salmon_dinner: 'Lachsgericht', fish_taco: 'Fischtaco',
  escargot: 'Escargot', lobster_bisque: 'Hummersuppe', survival_burger: 'Überlebensburger',
  plum_pudding: 'Pflaumenpudding', sea_urchin: 'Seeigel', sunflower: 'Sonnenblume',
  duck_feather: 'Entenfeder', red_cabbage: 'Rotkohl', sea_cucumber: 'Seegurke', squid_ink: 'Tintenfischtinte',
  nautilus_shell: 'Nautilusschale', chub: 'Döbel', golden_pumpkin: 'Goldener Kürbis',
  wheat: 'Weizen', hay: 'Heu', wine: 'Wein', rabbits_foot: 'Hasenpfote',
  fiddlehead_fern: 'Farnkraut',
};

const es = {
  wild_horseradish: 'Rábano silvestre', daffodil: 'Narciso', leek: 'Puerro', dandelion: 'Diente de león',
  grape: 'Uva', spice_berry: 'Baya picante', sweet_pea: 'Guisante de olor', red_mushroom: 'Champiñón rojo',
  common_mushroom: 'Champiñón común', wild_plum: 'Ciruela silvestre', hazelnut: 'Avellana', blackberry: 'Mora',
  winter_root: 'Raíz de invierno', crystal_fruit: 'Fruta de cristal', snow_yam: 'Ñame de nieve', crocus: 'Azafrán',
  wood: 'Madera', stone: 'Piedra', hardwood: 'Madera dura', clay: 'Arcilla',
  coconut: 'Coco', cactus_fruit: 'Fruta de cactus', cave_carrot: 'Zanahoria de cueva', purple_mushroom: 'Champiñón morado',
  maple_syrup: 'Jarabe de arce', oak_resin: 'Resina de roble', pine_tar: 'Alquitrán de pino',
  parsnip: 'Chirivía', green_bean: 'Judía verde', cauliflower: 'Coliflor', potato: 'Patata',
  tomato: 'Tomate', hot_pepper: 'Pimiento picante', blueberry: 'Arándano', melon: 'Melón',
  corn: 'Maíz', eggplant: 'Berenjena', pumpkin: 'Calabaza', yam: 'Ñame',
  gold_parsnip: 'Chirivía de oro', gold_melon: 'Melón de oro', gold_pumpkin: 'Calabaza de oro', gold_corn: 'Maíz de oro',
  large_milk: 'Leche grande', large_brown_egg: 'Huevo grande marrón', large_white_egg: 'Huevo grande blanco',
  large_goat_milk: 'Leche de cabra grande', wool: 'Lana', duck_egg: 'Huevo de pato',
  truffle_oil: 'Aceite de trufa', cloth: 'Tela', goat_cheese: 'Queso de cabra', cheese: 'Queso', honey: 'Miel',
  jelly: 'Mermelada (cualquiera)', apple: 'Manzana', apricot: 'Albaricoque', orange: 'Naranja', peach: 'Melocotón',
  pomegranate: 'Granada', cherry: 'Cereza',
  sunfish: 'Pez sol', catfish: 'Pez gato', shad: 'Sábalo', tiger_trout: 'Trucha tigre',
  largemouth_bass: 'Lobina', carp: 'Carpa', bullhead: 'Pez gato', sturgeon: 'Esturión',
  sardine: 'Sardina', tuna: 'Atún', red_mullet: 'Salmonete', herring: 'Arenque',
  walleye: 'Lucioperca', bream: 'Brema', eel: 'Anguila', pufferfish: 'Pez globo', ghostfish: 'Pez fantasma',
  sandfish: 'Pez de arena', woodskip: 'Pez madera', lobster: 'Langosta', crayfish: 'Cangrejo de río', crab: 'Cangrejo',
  cockle: 'Berberecho', mussel: 'Mejillón', shrimp: 'Camarón', snail: 'Caracol', periwinkle: 'Buccino',
  oyster: 'Ostra', clam: 'Almeja',
  copper_bar: 'Lingote de cobre', iron_bar: 'Lingote de hierro', gold_bar: 'Lingote de oro', refined_quartz: 'Cuarzo refinado',
  earth_crystal: 'Cristal de tierra', frozen_tear: 'Lágrima congelada', fire_quartz: 'Cuarzo de fuego',
  emerald: 'Esmeralda', aquamarine: 'Aguamarina', ruby: 'Rubí', amethyst: 'Amatista', topaz: 'Topacio', jade: 'Jade',
  tigerseye: 'Ojo de tigre', slime: 'Baba', bat_wing: 'Ala de murciélago',
  solar_essence: 'Esencia solar', void_essence: 'Esencia nula',
  gold_2500: 'Donación 2.500g', gold_5000: 'Donación 5.000g', gold_10000: 'Donación 10.000g', gold_25000: 'Donación 25.000g',
  truffle: 'Trufa', poppy: 'Amapola', maki_roll: 'Maki', fried_egg: 'Huevo frito', cookie: 'Galleta',
  hashbrowns: 'Patatas fritas', pancakes: 'Tortitas', salmon_dinner: 'Cena de salmón', fish_taco: 'Taco de pescado',
  escargot: 'Escargot', lobster_bisque: 'Bisque de langosta', survival_burger: 'Hamburguesa de supervivencia',
  plum_pudding: 'Pudín de ciruelas', sea_urchin: 'Erizo de mar', sunflower: 'Girasol',
  duck_feather: 'Pluma de pato', red_cabbage: 'Col roja', sea_cucumber: 'Pepino de mar', squid_ink: 'Tinta de calamar',
  nautilus_shell: 'Concha de nautilo', chub: 'Cacho', golden_pumpkin: 'Calabaza dorada',
  wheat: 'Trigo', hay: 'Heno', wine: 'Vino', rabbits_foot: 'Pata de conejo',
  fiddlehead_fern: 'Helecho',
};

const ru = {
  wild_horseradish: 'Дикий редис', daffodil: 'Нарцисс', leek: 'Лук-порей', dandelion: 'Одуванчик',
  grape: 'Виноград', spice_berry: 'Пряная ягода', sweet_pea: 'Душистый горошек', red_mushroom: 'Красный гриб',
  common_mushroom: 'Обычный гриб', wild_plum: 'Дикая слива', hazelnut: 'Фундук', blackberry: 'Ежевика',
  winter_root: 'Зимний корень', crystal_fruit: 'Кристальный фрукт', snow_yam: 'Снежный батат', crocus: 'Крокус',
  wood: 'Дерево', stone: 'Камень', hardwood: 'Твёрдая древесина', clay: 'Глина',
  coconut: 'Кокос', cactus_fruit: 'Кактусовый фрукт', cave_carrot: 'Пещерная морковь', purple_mushroom: 'Фиолетовый гриб',
  maple_syrup: 'Клёновый сироп', oak_resin: 'Дубовая смола', pine_tar: 'Смолистая сосновая смола',
  parsnip: 'Пастернак', green_bean: 'Зелёная фасоль', cauliflower: 'Цветная капуста', potato: 'Картофель',
  tomato: 'Помидор', hot_pepper: 'Острый перец', blueberry: 'Черника', melon: 'Дыня',
  corn: 'Кукуруза', eggplant: 'Баклажан', pumpkin: 'Тыква', yam: 'Ямс',
  gold_parsnip: 'Пастернак (золото)', gold_melon: 'Дыня (золото)', gold_pumpkin: 'Тыква (золото)', gold_corn: 'Кукуруза (золото)',
  large_milk: 'Большое молоко', large_brown_egg: 'Большое коричневое яйцо', large_white_egg: 'Большое белое яйцо',
  large_goat_milk: 'Большое козье молоко', wool: 'Шерсть', duck_egg: 'Утиное яйцо',
  truffle_oil: 'Трюфельное масло', cloth: 'Ткань', goat_cheese: 'Козий сыр', cheese: 'Сыр', honey: 'Мёд',
  jelly: 'Джем (любой)', apple: 'Яблоко', apricot: 'Абрикос', orange: 'Апельсин', peach: 'Персик',
  pomegranate: 'Гранат', cherry: 'Вишня',
  sunfish: 'Солнечник', catfish: 'Сом', shad: 'Шэд', tiger_trout: 'Тигровая форель',
  largemouth_bass: 'Ачиган', carp: 'Карп', bullhead: 'Бычок', sturgeon: 'Осётр',
  sardine: 'Сардина', tuna: 'Тунец', red_mullet: 'Красная кефаль', herring: 'Сельдь',
  walleye: 'Судак', bream: 'Лещ', eel: 'Угорь', pufferfish: 'Рыба-фугу', ghostfish: 'Призрачная рыба',
  sandfish: 'Песчаная рыба', woodskip: 'Рыба-дерево', lobster: 'Омар', crayfish: 'Рак', crab: 'Краб',
  cockle: 'Сердцевидка', mussel: 'Мидия', shrimp: 'Креветка', snail: 'Улитка', periwinkle: 'Улитка-литора',
  oyster: 'Устрица', clam: 'Моллюск',
  copper_bar: 'Медный слиток', iron_bar: 'Железный слиток', gold_bar: 'Золотой слиток', refined_quartz: 'Очищенный кварц',
  earth_crystal: 'Земляной кристалл', frozen_tear: 'Замёрзшая слеза', fire_quartz: 'Огненный кварц',
  emerald: 'Изумруд', aquamarine: 'Аквамарин', ruby: 'Рубин', amethyst: 'Аметист', topaz: 'Топаз', jade: 'Нефрит',
  tigerseye: 'Тигровый глаз', slime: 'Слайм', bat_wing: 'Крыло летучей мыши',
  solar_essence: 'Солнечная сущность', void_essence: 'Сущность пустоты',
  gold_2500: 'Пожертвование 2 500g', gold_5000: 'Пожертвование 5 000g', gold_10000: 'Пожертвование 10 000g', gold_25000: 'Пожертвование 25 000g',
  truffle: 'Трюфель', poppy: 'Мак', maki_roll: 'Маки', fried_egg: 'Яичница', cookie: 'Печенье',
  hashbrowns: 'Драники', pancakes: 'Блины', salmon_dinner: 'Ужин с лососем', fish_taco: 'Рыбный тако',
  escargot: 'Эскарго', lobster_bisque: 'Биск из омара', survival_burger: 'Бургер выживания',
  plum_pudding: 'Сливовый пудинг', sea_urchin: 'Морской ёж', sunflower: 'Подсолнух',
  duck_feather: 'Утиное перо', red_cabbage: 'Красная капуста', sea_cucumber: 'Морской огурец', squid_ink: 'Чернила кальмара',
  nautilus_shell: 'Раковина наутилуса', chub: 'Голавль', golden_pumpkin: 'Золотая тыква',
  wheat: 'Пшеница', hay: 'Сено', wine: 'Вино', rabbits_foot: 'Кроличья лапка',
  fiddlehead_fern: 'Папоротник',
};

const outDir = path.join(__dirname, '../src/i18n/bundle-items');
fs.mkdirSync(outDir, { recursive: true });

for (const [locale, extra] of [['en', {}], ['fr', {}], ['de', de], ['es', es], ['ru', ru]]) {
  const out = {};
  for (const [id, labels] of Object.entries(items)) {
    out[id] = extra[id] ?? labels[locale] ?? labels.en;
  }
  if (locale === 'de' || locale === 'es' || locale === 'ru') {
    for (const [id, label] of Object.entries(extra)) {
      if (!out[id]) out[id] = label;
    }
  }
  fs.writeFileSync(path.join(outDir, `${locale}.json`), JSON.stringify(out, null, 2) + '\n');
}

console.log('Generated', Object.keys(items).length, 'bundle items x 5 locales');
