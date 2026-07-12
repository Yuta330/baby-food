import type { FoodCategory, Ingredient, WeekPlan } from '../types';
import { FOOD_CATEGORIES } from '../types';

export interface SummaryRow {
  ingredientId: string;
  name: string;
  category: FoodCategory;
  grams: number;
}

export function summarizeWeek(
  weekPlan: WeekPlan | undefined,
  ingredients: Ingredient[],
): SummaryRow[] {
  const totals = new Map<string, number>();
  for (const day of weekPlan?.days ?? []) {
    for (const meal of day.meals) {
      for (const entry of meal.entries) {
        totals.set(entry.ingredientId, (totals.get(entry.ingredientId) ?? 0) + entry.grams);
      }
    }
  }

  const categoryOrder = new Map(FOOD_CATEGORIES.map((c, i) => [c, i]));

  return [...totals.entries()]
    .map(([ingredientId, grams]) => {
      const ing = ingredients.find((i) => i.id === ingredientId);
      return {
        ingredientId,
        name: ing?.name ?? '(削除された食材)',
        category: ing?.category ?? '緑',
        grams,
      };
    })
    .sort(
      (a, b) =>
        (categoryOrder.get(a.category) ?? 0) - (categoryOrder.get(b.category) ?? 0) ||
        a.name.localeCompare(b.name, 'ja'),
    );
}
