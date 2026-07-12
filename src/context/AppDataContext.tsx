import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { AppData, DayPlan, Ingredient, Meal, PlanEntry, WeekPlan } from '../types';
import { MAX_MEALS_PER_DAY } from '../types';
import { presetIngredients } from '../data/presetIngredients';
import { getWeekDates } from '../utils/date';
import { createId } from '../utils/id';

const STORAGE_KEY = 'babyFoodApp.v2';
const LEGACY_STORAGE_KEY = 'babyFoodApp.v1';

type Action =
  | { type: 'ADD_INGREDIENT'; ingredient: Ingredient }
  | { type: 'UPDATE_INGREDIENT'; ingredient: Ingredient }
  | { type: 'DELETE_INGREDIENT'; id: string }
  | { type: 'ADD_ENTRY'; weekStartDate: string; date: string; mealIndex: number; entry: PlanEntry }
  | { type: 'UPDATE_ENTRY'; weekStartDate: string; date: string; mealIndex: number; entry: PlanEntry }
  | { type: 'DELETE_ENTRY'; weekStartDate: string; date: string; mealIndex: number; entryId: string }
  | { type: 'ADD_MEAL'; weekStartDate: string; date: string }
  | { type: 'REMOVE_LAST_MEAL'; weekStartDate: string; date: string }
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
    case 'REPLACE_ALL':
      return action.data;
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
    };
  } catch {
    return null;
  }
}

function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return loadLegacyAppData() ?? { ingredients: presetIngredients, weekPlans: [] };
    const parsed = JSON.parse(raw);
    return {
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : presetIngredients,
      weekPlans: Array.isArray(parsed.weekPlans) ? parsed.weekPlans : [],
    };
  } catch {
    return { ingredients: presetIngredients, weekPlans: [] };
  }
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
  updateEntry: (weekStartDate: string, date: string, mealIndex: number, entry: PlanEntry) => void;
  deleteEntry: (weekStartDate: string, date: string, mealIndex: number, entryId: string) => void;
  addMeal: (weekStartDate: string, date: string) => void;
  removeLastMeal: (weekStartDate: string, date: string) => void;
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
    updateEntry: (weekStartDate, date, mealIndex, entry) =>
      dispatch({ type: 'UPDATE_ENTRY', weekStartDate, date, mealIndex, entry }),
    deleteEntry: (weekStartDate, date, mealIndex, entryId) =>
      dispatch({ type: 'DELETE_ENTRY', weekStartDate, date, mealIndex, entryId }),
    addMeal: (weekStartDate, date) => dispatch({ type: 'ADD_MEAL', weekStartDate, date }),
    removeLastMeal: (weekStartDate, date) =>
      dispatch({ type: 'REMOVE_LAST_MEAL', weekStartDate, date }),
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
