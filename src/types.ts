export type FoodCategory = '赤' | '黄' | '緑';

export const FOOD_CATEGORIES: FoodCategory[] = ['赤', '黄', '緑'];

export const FOOD_CATEGORY_LABEL: Record<FoodCategory, string> = {
  赤: '赤(たんぱく質・体を作る)',
  黄: '黄(炭水化物・エネルギー源)',
  緑: '緑(ビタミン・ミネラル・体を整える)',
};

export interface Ingredient {
  id: string;
  name: string;
  category: FoodCategory;
}

export interface PlanEntry {
  id: string;
  ingredientId: string;
  grams: number;
}

export interface Meal {
  id: string;
  entries: PlanEntry[];
}

export const MAX_MEALS_PER_DAY = 3;

export const MEAL_LABELS: string[] = ['1食目', '2食目', '3食目'];

export interface DayPlan {
  date: string; // 'YYYY-MM-DD'
  meals: Meal[]; // 1〜MAX_MEALS_PER_DAY件、常に先頭から連続
}

export interface WeekPlan {
  weekStartDate: string; // その週の月曜日 'YYYY-MM-DD'
  days: DayPlan[]; // 常に7要素、月〜日
}

export interface AppData {
  ingredients: Ingredient[];
  weekPlans: WeekPlan[];
}
