import { useAppData } from '../../context/AppDataContext';
import { MEAL_LABELS } from '../../types';
import styles from './PlannerGrid.module.css';

interface Props {
  weekStartDate: string;
  date: string;
  mealIndex: number;
  mealCount: number;
  entryCount: number;
}

export function MealSectionHeader({ weekStartDate, date, mealIndex, mealCount, entryCount }: Props) {
  const { addMeal, removeLastMeal } = useAppData();

  if (mealCount === mealIndex) {
    return (
      <button
        type="button"
        className={styles.addMealButton}
        onClick={() => addMeal(weekStartDate, date)}
      >
        + {MEAL_LABELS[mealIndex]}を追加
      </button>
    );
  }

  if (mealIndex > 0 && mealCount === mealIndex + 1) {
    return (
      <button
        type="button"
        className={styles.removeMealButton}
        onClick={() => {
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
    );
  }

  return null;
}
