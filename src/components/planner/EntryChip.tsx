import type { PlanEntry } from '../../types';
import styles from './EntryChip.module.css';

interface Props {
  entry: PlanEntry;
  ingredientName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function EntryChip({ entry, ingredientName, onEdit, onDelete }: Props) {
  return (
    <span className={styles.chip}>
      <button type="button" className={styles.label} onClick={onEdit}>
        {ingredientName} {entry.grams}g
      </button>
      <button type="button" className={styles.remove} onClick={onDelete} aria-label="削除">
        ×
      </button>
    </span>
  );
}
