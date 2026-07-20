import type { Ingredient, MealCountSchedule, Recipe, WeekPlan } from '../../types';
import { FOOD_CATEGORIES, MAX_MEALS_PER_DAY, MEAL_LABELS } from '../../types';
import { getDayLabel, formatMonthDay, isToday } from '../../utils/date';
import { getDefaultMealCount } from '../../utils/mealSchedule';
import { CategoryCell } from './CategoryCell';
import { MealRecipeSection } from './MealRecipeSection';
import styles from './PlannerGrid.module.css';

interface Props {
  weekStartDate: string;
  date: string;
  today: string;
  weekPlan: WeekPlan | undefined;
  ingredients: Ingredient[];
  recipes: Recipe[];
  effectiveDates: Map<string, string>;
  babyBirthday: string | undefined;
  mealCountSchedule: MealCountSchedule | undefined;
}

const MEAL_INDEXES = Array.from({ length: MAX_MEALS_PER_DAY }, (_, i) => i);

export function DayCard({
  weekStartDate,
  date,
  today,
  weekPlan,
  ingredients,
  recipes,
  effectiveDates,
  babyBirthday,
  mealCountSchedule,
}: Props) {
  const day = weekPlan?.days.find((d) => d.date === date);
  const mealCount = Math.max(day ? day.meals.length : 0, getDefaultMealCount(date, mealCountSchedule));

  return (
    <div className={styles.dayCard}>
      <div className={styles.dayHeader}>
        {getDayLabel(date, weekStartDate)}{' '}
        <span className={isToday(date, today) ? `${styles.date} ${styles.today}` : styles.date}>
          {formatMonthDay(date)}
        </span>
      </div>

      {MEAL_INDEXES.map((mealIndex) => {
        if (mealIndex >= mealCount) return null;

        const meal = day?.meals[mealIndex];

        return (
          <div key={mealIndex} className={styles.mealSection}>
            <div className={styles.mealSectionHeaderRow}>
              <span className={styles.mealSectionLabel}>{MEAL_LABELS[mealIndex]}</span>
            </div>

            <MealRecipeSection
              weekStartDate={weekStartDate}
              date={date}
              mealIndex={mealIndex}
              meal={meal}
              recipes={recipes}
              ingredients={ingredients}
              babyBirthday={babyBirthday}
            />

            {FOOD_CATEGORIES.map((category) => (
              <div key={category} className={styles.categoryRow}>
                <span className={styles.categoryLabel}>{category}</span>
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
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
