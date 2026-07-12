import { useAppData } from '../../context/AppDataContext';
import type { WeekPlan } from '../../types';
import { MEAL_LABELS } from '../../types';
import styles from './PlannerGrid.module.css';

interface Props {
  weekStartDate: string;
  dates: string[];
  mealIndex: number;
  weekPlan: WeekPlan | undefined;
}

export function MealSectionHeader({ weekStartDate, dates, mealIndex, weekPlan }: Props) {
  const { addMeal, removeLastMeal } = useAppData();

  return (
    <>
      <div className={styles.mealSectionLabel}>{MEAL_LABELS[mealIndex]}</div>
      {dates.map((date) => {
        const mealCount = weekPlan?.days.find((d) => d.date === date)?.meals.length ?? 1;

        if (mealCount === mealIndex) {
          return (
            <div key={date} className={styles.mealHeaderCell}>
              <button
                type="button"
                className={styles.addMealButton}
                onClick={() => addMeal(weekStartDate, date)}
              >
                + {MEAL_LABELS[mealIndex]}を追加
              </button>
            </div>
          );
        }

        if (mealIndex > 0 && mealCount === mealIndex + 1) {
          return (
            <div key={date} className={styles.mealHeaderCell}>
              <button
                type="button"
                className={styles.removeMealButton}
                onClick={() => {
                  const day = weekPlan?.days.find((d) => d.date === date);
                  const entryCount =
                    day?.meals[mealIndex]?.entries.length ?? 0;
                  const message =
                    entryCount > 0
                      ? `${entryCount}件のエントリを含む${MEAL_LABELS[mealIndex]}を削除しますか?`
                      : `${MEAL_LABELS[mealIndex]}を削除しますか?`;
                  if (window.confirm(message)) {
                    removeLastMeal(weekStartDate, date);
                  }
                }}
              >
                － 削除
              </button>
            </div>
          );
        }

        return <div key={date} className={styles.mealHeaderCell} />;
      })}
    </>
  );
}
