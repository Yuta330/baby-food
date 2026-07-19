import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { AppData, DayPlan, Ingredient, Meal, PlanEntry, Recipe, WeekPlan } from '../types';
import { MAX_MEALS_PER_DAY } from '../types';
import { presetIngredients } from '../data/presetIngredients';
import { presetRecipes } from '../data/presetRecipes';
import { getWeekDates } from '../utils/date';
import { createId } from '../utils/id';
import { fillEmptyDaysFromWeek } from '../utils/copyWeek';

const STORAGE_KEY = 'babyFoodApp.v2';
const LEGACY_STORAGE_KEY = 'babyFoodApp.v1';

type Action =
  | { type: 'ADD_INGREDIENT'; ingredient: Ingredient }
  | { type: 'UPDATE_INGREDIENT'; ingredient: Ingredient }
  | { type: 'DELETE_INGREDIENT'; id: string }
  | { type: 'ADD_ENTRY'; weekStartDate: string; date: string; mealIndex: number; entry: PlanEntry }
  | { type: 'ADD_ENTRIES'; weekStartDate: string; date: string; mealIndex: number; entries: PlanEntry[] }
  | { type: 'UPDATE_ENTRY'; weekStartDate: string; date: string; mealIndex: number; entry: PlanEntry }
  | { type: 'DELETE_ENTRY'; weekStartDate: string; date: string; mealIndex: number; entryId: string }
  | { type: 'ADD_MEAL'; weekStartDate: string; date: string }
  | { type: 'REMOVE_LAST_MEAL'; weekStartDate: string; date: string }
  | { type: 'COPY_WEEK'; sourceWeekStartDate: string; targetWeekStartDate: string }
  | { type: 'SET_BABY_BIRTHDAY'; babyBirthday: string | undefined }
  | { type: 'ADD_RECIPE'; recipe: Recipe }
  | { type: 'UPDATE_RECIPE'; recipe: Recipe }
  | { type: 'DELETE_RECIPE'; id: string }
  | {
      type: 'DELETE_RECIPE_GROUP';
      weekStartDate: string;
      date: string;
      mealIndex: number;
      recipeGroupId: string;
    }
  | {
      type: 'RESCALE_RECIPE_GROUP';
      weekStartDate: string;
      date: string;
      mealIndex: number;
      recipeGroupId: string;
      multiplier: number;
    }
  | { type: 'REPLACE_ALL'; data: AppData };

function createEmptyMeal(): Meal {
  return { id: createId(), entries: [] };
}

function createEmptyWeekPlan(weekStartDate: string): WeekPlan {
  return {
    weekStartDate,
    days: getWeekDates(weekStartDate).map((date): DayPlan => ({ date, meals: [createEmptyMeal()] })),
  };
}

function updateDay(weekPlan: WeekPlan, date: string, update: (day: DayPlan) => DayPlan): WeekPlan {
  return {
    ...weekPlan,
    days: weekPlan.days.map((day) => (day.date === date ? update(day) : day)),
  };
}

function updateMealAt(day: DayPlan, mealIndex: number, update: (meal: Meal) => Meal): DayPlan {
  return {
    ...day,
    meals: day.meals.map((meal, i) => (i === mealIndex ? update(meal) : meal)),
  };
}

function withWeekPlan(
  weekPlans: WeekPlan[],
  weekStartDate: string,
  update: (weekPlan: WeekPlan) => WeekPlan,
): WeekPlan[] {
  const existing = weekPlans.find((w) => w.weekStartDate === weekStartDate);
  const base = existing ?? createEmptyWeekPlan(weekStartDate);
  const updated = update(base);
  return existing
    ? weekPlans.map((w) => (w.weekStartDate === weekStartDate ? updated : w))
    : [...weekPlans, updated];
}

function appDataReducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'ADD_INGREDIENT':
      return { ...state, ingredients: [...state.ingredients, action.ingredient] };
    case 'UPDATE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.map((i) =>
          i.id === action.ingredient.id ? action.ingredient : i,
        ),
      };
    case 'DELETE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.filter((i) => i.id !== action.id),
      };
    case 'ADD_ENTRY':
      return {
        ...state,
        weekPlans: withWeekPlan(state.weekPlans, action.weekStartDate, (weekPlan) =>
          updateDay(weekPlan, action.date, (day) =>
            updateMealAt(day, action.mealIndex, (meal) => ({
              ...meal,
              entries: [...meal.entries, action.entry],
            })),
          ),
        ),
      };
    case 'ADD_ENTRIES':
      return {
        ...state,
        weekPlans: withWeekPlan(state.weekPlans, action.weekStartDate, (weekPlan) =>
          updateDay(weekPlan, action.date, (day) =>
            updateMealAt(day, action.mealIndex, (meal) => ({
              ...meal,
              entries: [...meal.entries, ...action.entries],
            })),
          ),
        ),
      };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        weekPlans: withWeekPlan(state.weekPlans, action.weekStartDate, (weekPlan) =>
          updateDay(weekPlan, action.date, (day) =>
            updateMealAt(day, action.mealIndex, (meal) => ({
              ...meal,
              entries: meal.entries.map((e) => (e.id === action.entry.id ? action.entry : e)),
            })),
          ),
        ),
      };
    case 'DELETE_ENTRY':
      return {
        ...state,
        weekPlans: withWeekPlan(state.weekPlans, action.weekStartDate, (weekPlan) =>
          updateDay(weekPlan, action.date, (day) =>
            updateMealAt(day, action.mealIndex, (meal) => ({
              ...meal,
              entries: meal.entries.filter((e) => e.id !== action.entryId),
            })),
          ),
        ),
      };
    case 'ADD_MEAL':
      return {
        ...state,
        weekPlans: withWeekPlan(state.weekPlans, action.weekStartDate, (weekPlan) =>
          updateDay(weekPlan, action.date, (day) =>
            day.meals.length >= MAX_MEALS_PER_DAY
              ? day
              : { ...day, meals: [...day.meals, createEmptyMeal()] },
          ),
        ),
      };
    case 'REMOVE_LAST_MEAL':
      return {
        ...state,
        weekPlans: withWeekPlan(state.weekPlans, action.weekStartDate, (weekPlan) =>
          updateDay(weekPlan, action.date, (day) =>
            day.meals.length <= 1 ? day : { ...day, meals: day.meals.slice(0, -1) },
          ),
        ),
      };
    case 'COPY_WEEK': {
      const source = state.weekPlans.find((w) => w.weekStartDate === action.sourceWeekStartDate);
      if (!source) return state;
      return {
        ...state,
        weekPlans: withWeekPlan(state.weekPlans, action.targetWeekStartDate, (weekPlan) =>
          fillEmptyDaysFromWeek(source, weekPlan, state.ingredients, state.settings.babyBirthday),
        ),
      };
    }
    case 'SET_BABY_BIRTHDAY':
      return { ...state, settings: { ...state.settings, babyBirthday: action.babyBirthday } };
    case 'ADD_RECIPE':
      return { ...state, recipes: [...state.recipes, action.recipe] };
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map((r) => (r.id === action.recipe.id ? action.recipe : r)),
      };
    case 'DELETE_RECIPE':
      return { ...state, recipes: state.recipes.filter((r) => r.id !== action.id) };
    case 'DELETE_RECIPE_GROUP':
      return {
        ...state,
        weekPlans: withWeekPlan(state.weekPlans, action.weekStartDate, (weekPlan) =>
          updateDay(weekPlan, action.date, (day) =>
            updateMealAt(day, action.mealIndex, (meal) => ({
              ...meal,
              entries: meal.entries.filter((e) => e.recipeGroupId !== action.recipeGroupId),
            })),
          ),
        ),
      };
    case 'RESCALE_RECIPE_GROUP':
      return {
        ...state,
        weekPlans: withWeekPlan(state.weekPlans, action.weekStartDate, (weekPlan) =>
          updateDay(weekPlan, action.date, (day) =>
            updateMealAt(day, action.mealIndex, (meal) => ({
              ...meal,
              entries: meal.entries.map((e) =>
                e.recipeGroupId === action.recipeGroupId
                  ? { ...e, grams: Math.max(1, Math.round((e.baseGrams ?? e.grams) * action.multiplier)) }
                  : e,
              ),
            })),
          ),
        ),
      };
    case 'REPLACE_ALL':
      return migrateKayuToRecipe(seedNewPresetsAndBackfill(action.data));
    default:
      return state;
  }
}

interface LegacyDayPlan {
  date: string;
  entries: PlanEntry[];
}

interface LegacyWeekPlan {
  weekStartDate: string;
  days: LegacyDayPlan[];
}

function migrateLegacyWeekPlans(weekPlans: unknown): WeekPlan[] {
  if (!Array.isArray(weekPlans)) return [];
  return (weekPlans as LegacyWeekPlan[]).map((week) => ({
    weekStartDate: week.weekStartDate,
    days: (week.days ?? []).map((day) => ({
      date: day.date,
      meals: [{ id: createId(), entries: Array.isArray(day.entries) ? day.entries : [] }],
    })),
  }));
}

function loadLegacyAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : presetIngredients,
      weekPlans: migrateLegacyWeekPlans(parsed.weekPlans),
      settings: {},
      recipes: [],
    };
  } catch {
    return null;
  }
}

const PRESET_MAP = new Map(presetIngredients.map((i) => [i.id, i]));
// この機能で新規追加したプリセットのみ対象(過去に削除された他のプリセットは復活させない)。
// 新しいプリセットをpresetIngredients.tsに追加する際は、既存ユーザーにも反映されるよう
// 必ずここにもidを追記すること(忘れるとpresetRecommendationsSeeded済みの既存ユーザーには
// 永久に反映されない)。
const NEW_PRESET_IDS = ['preset-honey'];

function backfillRecommendationData(ingredients: Ingredient[]): Ingredient[] {
  const merged = ingredients.map((ing) => {
    const preset = PRESET_MAP.get(ing.id);
    if (!preset || ing.minAgeMonths !== undefined) return ing;
    return { ...ing, minAgeMonths: preset.minAgeMonths, prohibited: preset.prohibited };
  });
  const existingIds = new Set(merged.map((i) => i.id));
  const missing = presetIngredients.filter(
    (p) => NEW_PRESET_IDS.includes(p.id) && !existingIds.has(p.id),
  );
  return [...merged, ...missing];
}

// 既存プリセットへの月齢データ補完と新規プリセットの追加を1回だけ行う。
// loadAppData(起動時)とREPLACE_ALL(バックアップ復元時)の両方から呼ぶことで、
// 復元直後もマイグレーション未適用のまま放置されないようにする。
function seedNewPresetsAndBackfill(data: AppData): AppData {
  if (data.settings.presetRecommendationsSeeded) return data;
  return {
    ...data,
    ingredients: backfillRecommendationData(data.ingredients),
    settings: { ...data.settings, presetRecommendationsSeeded: true },
  };
}

// 「米(10倍がゆ)」食材を「米」食材+「10倍がゆ」料理に置き換える1回限りの移行。
// 食材名の強制上書きを含む破壊的変更のため、presetRecommendationsSeededとは独立した
// フラグ(kayuRecipeMigrated)で1回のみ実行する。
// このマイグレーションはkayuRecipeMigratedフラグにより1ユーザーにつき1回しか実行されないため、
// 「過去に削除されたプリセット料理を復活させない」ための許可リストは不要
// (実行時点でpreset-recipe-kayuをユーザーが削除している余地がそもそもない)。
// 参照先の食材が削除済みの場合は壊れた料理を残さないよう追加しない。
function migrateKayuToRecipe(data: AppData): AppData {
  if (data.settings.kayuRecipeMigrated) return data;
  const ingredientIds = new Set(data.ingredients.map((i) => i.id));
  const existingRecipeIds = new Set(data.recipes.map((r) => r.id));
  const newRecipes = presetRecipes.filter(
    (r) => !existingRecipeIds.has(r.id) && r.items.every((item) => ingredientIds.has(item.ingredientId)),
  );
  return {
    ...data,
    ingredients: data.ingredients.map((ing) =>
      ing.id === 'preset-kayu' ? { ...ing, name: '米' } : ing,
    ),
    recipes: newRecipes.length > 0 ? [...data.recipes, ...newRecipes] : data.recipes,
    settings: { ...data.settings, kayuRecipeMigrated: true },
  };
}

function loadAppData(): AppData {
  const base = ((): AppData => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return (
          loadLegacyAppData() ?? {
            ingredients: presetIngredients,
            weekPlans: [],
            settings: {},
            recipes: [],
          }
        );
      }
      const parsed = JSON.parse(raw);
      return {
        ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : presetIngredients,
        weekPlans: Array.isArray(parsed.weekPlans) ? parsed.weekPlans : [],
        settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {},
        recipes: Array.isArray(parsed.recipes) ? parsed.recipes : [],
      };
    } catch {
      return { ingredients: presetIngredients, weekPlans: [], settings: {}, recipes: [] };
    }
  })();

  return migrateKayuToRecipe(seedNewPresetsAndBackfill(base));
}

function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 保存に失敗しても画面操作は継続させる(容量超過等)
  }
}

interface AppDataContextValue {
  data: AppData;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  addEntry: (weekStartDate: string, date: string, mealIndex: number, entry: PlanEntry) => void;
  addEntries: (weekStartDate: string, date: string, mealIndex: number, entries: PlanEntry[]) => void;
  updateEntry: (weekStartDate: string, date: string, mealIndex: number, entry: PlanEntry) => void;
  deleteEntry: (weekStartDate: string, date: string, mealIndex: number, entryId: string) => void;
  addMeal: (weekStartDate: string, date: string) => void;
  removeLastMeal: (weekStartDate: string, date: string) => void;
  copyWeek: (sourceWeekStartDate: string, targetWeekStartDate: string) => void;
  setBabyBirthday: (babyBirthday: string | undefined) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  deleteRecipeGroup: (
    weekStartDate: string,
    date: string,
    mealIndex: number,
    recipeGroupId: string,
  ) => void;
  rescaleRecipeGroup: (
    weekStartDate: string,
    date: string,
    mealIndex: number,
    recipeGroupId: string,
    multiplier: number,
  ) => void;
  replaceAllData: (data: AppData) => void;
  getWeekPlan: (weekStartDate: string) => WeekPlan | undefined;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appDataReducer, undefined, loadAppData);

  useEffect(() => {
    saveAppData(state);
  }, [state]);

  const value: AppDataContextValue = {
    data: state,
    addIngredient: (ingredient) => dispatch({ type: 'ADD_INGREDIENT', ingredient }),
    updateIngredient: (ingredient) => dispatch({ type: 'UPDATE_INGREDIENT', ingredient }),
    deleteIngredient: (id) => dispatch({ type: 'DELETE_INGREDIENT', id }),
    addEntry: (weekStartDate, date, mealIndex, entry) =>
      dispatch({ type: 'ADD_ENTRY', weekStartDate, date, mealIndex, entry }),
    addEntries: (weekStartDate, date, mealIndex, entries) =>
      dispatch({ type: 'ADD_ENTRIES', weekStartDate, date, mealIndex, entries }),
    updateEntry: (weekStartDate, date, mealIndex, entry) =>
      dispatch({ type: 'UPDATE_ENTRY', weekStartDate, date, mealIndex, entry }),
    deleteEntry: (weekStartDate, date, mealIndex, entryId) =>
      dispatch({ type: 'DELETE_ENTRY', weekStartDate, date, mealIndex, entryId }),
    addMeal: (weekStartDate, date) => dispatch({ type: 'ADD_MEAL', weekStartDate, date }),
    removeLastMeal: (weekStartDate, date) =>
      dispatch({ type: 'REMOVE_LAST_MEAL', weekStartDate, date }),
    copyWeek: (sourceWeekStartDate, targetWeekStartDate) =>
      dispatch({ type: 'COPY_WEEK', sourceWeekStartDate, targetWeekStartDate }),
    setBabyBirthday: (babyBirthday) => dispatch({ type: 'SET_BABY_BIRTHDAY', babyBirthday }),
    addRecipe: (recipe) => dispatch({ type: 'ADD_RECIPE', recipe }),
    updateRecipe: (recipe) => dispatch({ type: 'UPDATE_RECIPE', recipe }),
    deleteRecipe: (id) => dispatch({ type: 'DELETE_RECIPE', id }),
    deleteRecipeGroup: (weekStartDate, date, mealIndex, recipeGroupId) =>
      dispatch({ type: 'DELETE_RECIPE_GROUP', weekStartDate, date, mealIndex, recipeGroupId }),
    rescaleRecipeGroup: (weekStartDate, date, mealIndex, recipeGroupId, multiplier) =>
      dispatch({
        type: 'RESCALE_RECIPE_GROUP',
        weekStartDate,
        date,
        mealIndex,
        recipeGroupId,
        multiplier,
      }),
    replaceAllData: (data) => dispatch({ type: 'REPLACE_ALL', data }),
    getWeekPlan: (weekStartDate) => state.weekPlans.find((w) => w.weekStartDate === weekStartDate),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
