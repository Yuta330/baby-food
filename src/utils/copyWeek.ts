import type { DayPlan, Ingredient, Meal, WeekPlan } from '../types';
import { createId } from './id';
import { getAgeInMonths } from './date';
import { getRecommendationStatus } from './ingredientRecommendation';

function isDayEmpty(day: DayPlan): boolean {
  return day.meals.every((meal) => meal.entries.length === 0);
}

function cloneMeal(
  meal: Meal,
  date: string,
  ingredients: Ingredient[],
  babyBirthday: string | undefined,
): Meal {
  const ageMonths = getAgeInMonths(babyBirthday, date);
  return {
    id: createId(),
    entries: meal.entries
      .filter((entry) => {
        const ingredient = ingredients.find((i) => i.id === entry.ingredientId);
        // 削除済み食材の参照は既存動作通りそのまま複製する(禁止判定は継続中の食材のみ対象)
        return !ingredient || getRecommendationStatus(ingredient, ageMonths) !== 'forbidden';
      })
      .map((entry) => ({ ...entry, id: createId() })),
  };
}

/** targetのうち全食事が未入力の日だけを、sourceの同じ曜日の内容で埋める(コピー先の日付で禁止判定される食材は除外) */
export function fillEmptyDaysFromWeek(
  source: WeekPlan,
  target: WeekPlan,
  ingredients: Ingredient[],
  babyBirthday: string | undefined,
): WeekPlan {
  return {
    ...target,
    days: target.days.map((day, i) =>
      isDayEmpty(day)
        ? {
            ...day,
            meals: source.days[i].meals.map((meal) =>
              cloneMeal(meal, day.date, ingredients, babyBirthday),
            ),
          }
        : day,
    ),
  };
}

export function weekPlanHasAnyEntry(weekPlan: WeekPlan | undefined): boolean {
  return !!weekPlan && weekPlan.days.some((day) => !isDayEmpty(day));
}
