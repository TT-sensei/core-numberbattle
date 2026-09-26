export const NAVIAN_MONSTERS = [
  ["ぷるんスライム","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/zako/purun-little-magic-slime.webp"],
  ["こもりんナイトバット","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/zako/komorin-little-night-bat.webp"],
  ["ひのこイモリ","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/zako/hinoko-ember-newt.webp"],
  ["はっぱリス","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/zako/happa-squirrel-leafy.webp"],
  ["りんごキノコ","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/zako/kinoko-apple-mushroom.webp"],
  ["みずたまカッパ","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/zako/mizutama-kappa.webp"]
];
const EVO_MONSTERS = [
  ["フォレストプル","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/zako-evolved/forest-puru-evolved.webp"],
  ["ダスクブレードフォックス","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/zako-evolved/duskblade-fox-evolved.webp"],
  ["エンバーウイングレイヴン","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/zako-evolved/emberwing-raven-evolved.webp"]
];
const BOSS_MONSTERS = [
  ["スカイルーングリフォン","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/boss/sky-ruin-griffon.webp"],
  ["ボルケーノボアキング","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/boss/volcano-boar-king.webp"],
  ["サンダーグリフォン","https://tt-sensei.github.io/navi-character-/assets/web/fantasy/monsters/boss/thunder-griffon.webp"]
];
export function getMonsterPool(difficulty){return difficulty==="normal"?EVO_MONSTERS:difficulty==="hard"?BOSS_MONSTERS:NAVIAN_MONSTERS;}