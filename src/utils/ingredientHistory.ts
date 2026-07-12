import type { Ingredient, WeekPlan } from '../types';

/**
 * 食材ごとの「有効な初めて食べた日」をまとめて算出する。
 * 優先度: Ingredient.firstTriedDate(手動、未来日も可) >
 *         週間プランナー全体で今日以前に登場した最も早い日付(自動推定)
 */
export function getEffectiveFirstTriedDateMap(
  ingredients: Ingredient[],
  weekPlans: WeekPlan[],
  today: string,
): Map<string, string> {
  const autoEarliest = new Map<string, string>();
  for (const week of weekPlans) {
    for (const day of week.days) {
      if (day.date > today) continue;
      for (const meal of day.meals) {
        for (const entry of meal.entries) {
          const current = autoEarliest.get(entry.ingredientId);
          if (!current || day.date < current) {
            autoEarliest.set(entry.ingredientId, day.date);
          }
        }
      }
    }
  }

  const result = new Map<string, string>();
  for (const ingredient of ingredients) {
    const effective = ingredient.firstTriedDate ?? autoEarliest.get(ingredient.id);
    if (effective) result.set(ingredient.id, effective);
  }
  return result;
}

/** 今日以前に食べた実績が一切ない(＝未経験)かどうか */
export function hasNoPastRecord(effectiveDate: string | undefined, today: string): boolean {
  return !effectiveDate || effectiveDate > today;
}
