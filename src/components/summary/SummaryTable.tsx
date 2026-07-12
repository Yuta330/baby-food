import type { FoodCategory } from '../../types';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABEL } from '../../types';
import type { SummaryRow } from '../../utils/summary';
import styles from './SummaryTable.module.css';

interface Props {
  rows: SummaryRow[];
}

const CATEGORY_CLASS: Record<FoodCategory, string> = {
  赤: styles.red,
  黄: styles.yellow,
  緑: styles.green,
};

export function SummaryTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p className={styles.empty}>この週の食材はまだ登録されていません。</p>;
  }

  return (
    <div className={styles.groups}>
      {FOOD_CATEGORIES.map((category) => {
        const items = rows.filter((r) => r.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category} className={styles.group}>
            <h3 className={CATEGORY_CLASS[category]}>{FOOD_CATEGORY_LABEL[category]}</h3>
            <ul className={styles.list}>
              {items.map((row) => (
                <li key={row.ingredientId} className={styles.item}>
                  <span>{row.name}</span>
                  <span className={styles.grams}>{row.grams}g</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
