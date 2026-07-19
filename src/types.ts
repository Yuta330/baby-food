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
  firstTriedDate?: string; // 'YYYY-MM-DD'、初めて食べた日(未設定可)
  minAgeMonths?: number; // 推奨開始月齢。未設定なら月齢制限なし
  prohibited?: boolean; // true: minAgeMonths未満は入力不可(禁止食材)。false/未設定は非推奨のみ(入力は可)
  defaultGrams?: number; // 入力画面の既定グラム数(未設定なら規定値なし)
}

export interface PlanEntry {
  id: string;
  ingredientId: string;
  grams: number;
  recipeId?: string; // 由来した料理マスタのid(マスタ削除後も保持。表示解決用)
  recipeGroupId?: string; // 同じ「料理として追加」操作でまとめて追加されたエントリを束ねるid
  baseGrams?: number; // 倍率再調整の基準となる、追加時点(倍率適用前)のグラム数スナップショット
}

export interface RecipeItem {
  ingredientId: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  items: RecipeItem[];
}

export interface Meal {
  id: string;
  entries: PlanEntry[];
}

export const MAX_MEALS_PER_DAY = 3;

export const MEAL_LABELS: string[] = ['1食目', '2食目', '3食目'];

export const GRAM_STEP = 5;
export const MIN_GRAMS = 0;
export const MAX_GRAMS = 200;

export interface DayPlan {
  date: string; // 'YYYY-MM-DD'
  meals: Meal[]; // 1〜MAX_MEALS_PER_DAY件、常に先頭から連続
}

export interface WeekPlan {
  weekStartDate: string; // その週の月曜日 'YYYY-MM-DD'
  days: DayPlan[]; // 常に7要素、月〜日
}

export interface AppSettings {
  babyBirthday?: string; // 'YYYY-MM-DD'
  presetRecommendationsSeeded?: boolean; // 内部マイグレーション用フラグ(UIには出さない)
  kayuRecipeMigrated?: boolean; // 「米(10倍がゆ)」→食材「米」+料理「10倍がゆ」移行済みフラグ(UIには出さない)
}

export interface AppData {
  ingredients: Ingredient[];
  weekPlans: WeekPlan[];
  settings: AppSettings;
  recipes: Recipe[];
}
