import type { DayPlan, Meal, WeekPlan } from '../types';
import { createId } from './id';

function isDayEmpty(day: DayPlan): boolean {
  return day.meals.every((meal) => meal.entries.length === 0);
}

function cloneMeal(meal: Meal): Meal {
  return {
    id: createId(),
    entries: meal.entries.map((entry) => ({ ...entry, id: createId() })),
  };
}

/** targetのうち全食事が未入力の日だけを、sourceの同じ曜日の内容で埋める */
export function fillEmptyDaysFromWeek(source: WeekPlan, target: WeekPlan): WeekPlan {
  return {
    ...target,
    days: target.days.map((day, i) =>
      isDayEmpty(day) ? { ...day, meals: source.days[i].meals.map(cloneMeal) } : day,
    ),
  };
}

export function weekPlanHasAnyEntry(weekPlan: WeekPlan | undefined): boolean {
  return !!weekPlan && weekPlan.days.some((day) => !isDayEmpty(day));
}
