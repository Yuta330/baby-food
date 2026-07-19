import type { Recipe } from '../types';

// 新しいプリセットをここに追加したら、src/context/AppDataContext.tsxのNEW_PRESET_RECIPE_IDSにも
// idを追記すること(忘れると既存ユーザーには反映されない)。
export const presetRecipes: Recipe[] = [
  {
    id: 'preset-recipe-kayu',
    name: '10倍がゆ',
    items: [{ ingredientId: 'preset-kayu', grams: 30 }],
  },
];
