import type { Ingredient } from '../types';

export const presetIngredients: Ingredient[] = [
  // 赤 = たんぱく質・体を作る
  { id: 'preset-tofu', name: '豆腐', category: '赤', minAgeMonths: 5 },
  { id: 'preset-shirasu', name: 'しらす', category: '赤', minAgeMonths: 5 },
  { id: 'preset-tai', name: '白身魚(鯛)', category: '赤', minAgeMonths: 5 },
  { id: 'preset-sasami', name: '鶏ささみ', category: '赤', minAgeMonths: 7 },
  { id: 'preset-mune', name: '鶏むね肉', category: '赤', minAgeMonths: 7 },
  { id: 'preset-tamago-oh', name: '卵黄', category: '赤', minAgeMonths: 5 },
  { id: 'preset-natto', name: '納豆', category: '赤', minAgeMonths: 7 },
  { id: 'preset-koya-tofu', name: '高野豆腐', category: '赤', minAgeMonths: 5 },
  { id: 'preset-yogurt', name: 'ヨーグルト', category: '赤', minAgeMonths: 7 },

  // 黄 = 炭水化物・エネルギー源
  { id: 'preset-kayu', name: '米(10倍がゆ)', category: '黄', minAgeMonths: 5 },
  { id: 'preset-pan', name: '食パン', category: '黄', minAgeMonths: 5 },
  { id: 'preset-udon', name: 'うどん', category: '黄', minAgeMonths: 5 },
  { id: 'preset-somen', name: 'そうめん', category: '黄', minAgeMonths: 6 },
  { id: 'preset-satsumaimo', name: 'さつまいも', category: '黄', minAgeMonths: 5 },
  { id: 'preset-jagaimo', name: 'じゃがいも', category: '黄', minAgeMonths: 5 },
  { id: 'preset-oatmeal', name: 'オートミール', category: '黄', minAgeMonths: 5 },

  // 緑 = ビタミン・ミネラル・体を整える
  { id: 'preset-ninjin', name: 'にんじん', category: '緑', minAgeMonths: 5 },
  { id: 'preset-hourensou', name: 'ほうれん草', category: '緑', minAgeMonths: 5 },
  { id: 'preset-kabocha', name: 'かぼちゃ', category: '緑', minAgeMonths: 5 },
  { id: 'preset-broccoli', name: 'ブロッコリー', category: '緑', minAgeMonths: 5 },
  { id: 'preset-daikon', name: '大根', category: '緑', minAgeMonths: 5 },
  { id: 'preset-cabbage', name: 'キャベツ', category: '緑', minAgeMonths: 5 },
  { id: 'preset-tomato', name: 'トマト', category: '緑', minAgeMonths: 5 },
  { id: 'preset-apple', name: 'りんご', category: '緑', minAgeMonths: 5 },
  { id: 'preset-banana', name: 'バナナ', category: '緑', minAgeMonths: 5 },
  { id: 'preset-tamanegi', name: '玉ねぎ', category: '緑', minAgeMonths: 5 },
  {
    id: 'preset-honey',
    name: 'はちみつ',
    category: '緑',
    minAgeMonths: 12,
    prohibited: true,
  },
];
