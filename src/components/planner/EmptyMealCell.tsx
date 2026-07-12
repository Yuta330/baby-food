import type { FoodCategory } from '../../types';
import styles from './CategoryCell.module.css';

const CATEGORY_CLASS: Record<FoodCategory, string> = {
  赤: styles.red,
  黄: styles.yellow,
  緑: styles.green,
};

interface Props {
  category: FoodCategory;
}

export function EmptyMealCell({ category }: Props) {
  return <div className={`${styles.cell} ${styles.empty} ${CATEGORY_CLASS[category]}`} />;
}
