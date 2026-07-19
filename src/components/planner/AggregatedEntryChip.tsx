import { useState } from 'react';
import type { PlanEntry } from '../../types';
import { IngredientNameLabel } from './IngredientNameLabel';
import chipStyles from './EntryChip.module.css';
import styles from './AggregatedEntryChip.module.css';

export interface AggregatedEntryChipItem {
  entry: PlanEntry;
  recipeName: string; // 解決済み: レシピ名 / '(削除された料理)' / '手動追加'
}

interface Props {
  ingredientName: string;
  totalGrams: number;
  isFirstThisWeek: boolean;
  items: AggregatedEntryChipItem[];
  onEditItem: (entryId: string) => void;
  onDeleteItem: (entryId: string) => void;
}

export function AggregatedEntryChip({
  ingredientName,
  totalGrams,
  isFirstThisWeek,
  items,
  onEditItem,
  onDeleteItem,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span className={styles.wrap}>
      <span className={isFirstThisWeek ? `${chipStyles.chip} ${chipStyles.first}` : chipStyles.chip}>
        <span className={chipStyles.label}>
          <IngredientNameLabel name={ingredientName} isFirstThisWeek={isFirstThisWeek} />{' '}
          {totalGrams}g
        </span>
        <button
          type="button"
          className={styles.infoButton}
          onClick={() => setOpen((v) => !v)}
          aria-label="内訳を表示"
        >
          ⓘ
        </button>
      </span>

      {open && (
        <div className={styles.popover}>
          <ul className={styles.list}>
            {items.map(({ entry, recipeName }) => (
              <li key={entry.id} className={styles.row}>
                <span className={styles.rowLabel}>
                  {recipeName} {entry.grams}g
                </span>
                <span className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onEditItem(entry.id);
                    }}
                  >
                    編集
                  </button>
                  <button type="button" onClick={() => onDeleteItem(entry.id)} aria-label="削除">
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <button type="button" onClick={() => setOpen(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
