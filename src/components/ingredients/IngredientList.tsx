import type { FoodCategory, Ingredient } from '../../types';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABEL } from '../../types';
import { isDateInWeek } from '../../utils/date';
import styles from './IngredientList.module.css';

interface Props {
  ingredients: Ingredient[];
  thisWeekStart: string;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const CATEGORY_CLASS: Record<FoodCategory, string> = {
  赤: styles.red,
  黄: styles.yellow,
  緑: styles.green,
};

export function IngredientList({ ingredients, thisWeekStart, onEdit, onDelete }: Props) {
  return (
    <div className={styles.groups}>
      {FOOD_CATEGORIES.map((category) => {
        const items = ingredients.filter((i) => i.category === category);
        return (
          <section key={category} className={styles.group}>
            <h3 className={CATEGORY_CLASS[category]}>{FOOD_CATEGORY_LABEL[category]}</h3>
            {items.length === 0 ? (
              <p className={styles.empty}>食材がありません</p>
            ) : (
              <ul className={styles.list}>
                {items.map((ingredient) => (
                  <li key={ingredient.id} className={styles.item}>
                    <span className={styles.name}>
                      {ingredient.name}
                      {isDateInWeek(ingredient.firstTriedDate, thisWeekStart) && (
                        <span className={styles.badge}>はじめて</span>
                      )}
                    </span>
                    <span className={styles.itemActions}>
                      <button type="button" onClick={() => onEdit(ingredient)}>
                        編集
                      </button>
                      <button type="button" onClick={() => onDelete(ingredient)}>
                        削除
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
