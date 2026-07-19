import type { Ingredient, Recipe, WeekPlan } from '../../types';
import { FOOD_CATEGORIES, MAX_MEALS_PER_DAY, MEAL_LABELS } from '../../types';
import { getDayLabel, formatMonthDay } from '../../utils/date';
import { CategoryCell } from './CategoryCell';
import { EmptyMealCell } from './EmptyMealCell';
import { MealSectionHeader } from './MealSectionHeader';
import { MealRecipeSection } from './MealRecipeSection';
import styles from './PlannerGrid.module.css';

interface Props {
  weekStartDate: string;
  date: string;
  weekPlan: WeekPlan | undefined;
  ingredients: Ingredient[];
  recipes: Recipe[];
  effectiveDates: Map<string, string>;
  babyBirthday: string | undefined;
}

const MEAL_INDEXES = Array.from({ length: MAX_MEALS_PER_DAY }, (_, i) => i);

export function DayCard({
  weekStartDate,
  date,
  weekPlan,
  ingredients,
  recipes,
  effectiveDates,
  babyBirthday,
}: Props) {
  const day = weekPlan?.days.find((d) => d.date === date);
  const mealCount = day ? day.meals.length : 1;

  return (
    <div className={styles.dayCard}>
      <div className={styles.dayHeader}>
        {getDayLabel(date, weekStartDate)} <span className={styles.date}>{formatMonthDay(date)}</span>
      </div>

      {MEAL_INDEXES.map((mealIndex) => {
        if (mealIndex > mealCount) return null; // 前の食事が無ければまだ表示しない

        const meal = day?.meals[mealIndex];

        return (
          <div key={mealIndex} className={styles.mealSection}>
            <div className={styles.mealSectionHeaderRow}>
              <span className={styles.mealSectionLabel}>{MEAL_LABELS[mealIndex]}</span>
              <MealSectionHeader
                weekStartDate={weekStartDate}
                date={date}
                mealIndex={mealIndex}
                mealCount={mealCount}
                entryCount={meal?.entries.length ?? 0}
              />
            </div>

            {mealIndex < mealCount && (
              <MealRecipeSection
                weekStartDate={weekStartDate}
                date={date}
                mealIndex={mealIndex}
                meal={meal}
                recipes={recipes}
                ingredients={ingredients}
                babyBirthday={babyBirthday}
              />
            )}

            {FOOD_CATEGORIES.map((category) => (
              <div key={category} className={styles.categoryRow}>
                <span className={styles.categoryLabel}>{category}</span>
                {mealIndex >= mealCount ? (
                  <EmptyMealCell category={category} />
                ) : (
                  <CategoryCell
                    weekStartDate={weekStartDate}
                    date={date}
                    mealIndex={mealIndex}
                    category={category}
                    entries={(meal?.entries ?? []).filter((e) => {
                      const ing = ingredients.find((i) => i.id === e.ingredientId);
                      return (ing?.category ?? '緑') === category;
                    })}
                    ingredients={ingredients}
                    recipes={recipes}
                    effectiveDates={effectiveDates}
                    babyBirthday={babyBirthday}
                  />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
