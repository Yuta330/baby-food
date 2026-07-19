import type { PlanEntry } from '../../types';
import { IngredientNameLabel } from './IngredientNameLabel';
import styles from './EntryChip.module.css';

interface Props {
  entry: PlanEntry;
  ingredientName: string;
  isFirstThisWeek: boolean;
  recipeName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function EntryChip({
  entry,
  ingredientName,
  isFirstThisWeek,
  recipeName,
  onEdit,
  onDelete,
}: Props) {
  return (
    <span className={isFirstThisWeek ? `${styles.chip} ${styles.first}` : styles.chip}>
      <button type="button" className={styles.label} onClick={onEdit}>
        {recipeName && <span className={styles.recipeTag}>{recipeName}</span>}
        <IngredientNameLabel name={ingredientName} isFirstThisWeek={isFirstThisWeek} />{' '}
        {entry.grams}g
      </button>
      <button type="button" className={styles.remove} onClick={onDelete} aria-label="削除">
        ×
      </button>
    </span>
  );
}
