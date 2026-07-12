import { useState } from 'react';
import type { FoodCategory, Ingredient, PlanEntry } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { createId } from '../../utils/id';
import { isDateInWeek } from '../../utils/date';
import { EntryChip } from './EntryChip';
import { IngredientPicker } from './IngredientPicker';
import styles from './CategoryCell.module.css';

interface Props {
  weekStartDate: string;
  date: string;
  mealIndex: number;
  category: FoodCategory;
  entries: PlanEntry[];
  ingredients: Ingredient[];
}

const CATEGORY_CLASS: Record<FoodCategory, string> = {
  赤: styles.red,
  黄: styles.yellow,
  緑: styles.green,
};

export function CategoryCell({ weekStartDate, date, mealIndex, category, entries, ingredients }: Props) {
  const { addEntry, updateEntry, deleteEntry } = useAppData();
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));
  const editingEntry = entries.find((e) => e.id === editingEntryId);

  return (
    <div className={`${styles.cell} ${CATEGORY_CLASS[category]}`}>
      <div className={styles.chips}>
        {entries.map((entry) => (
          <EntryChip
            key={entry.id}
            entry={entry}
            ingredientName={ingredientMap.get(entry.ingredientId)?.name ?? '(削除された食材)'}
            isFirstThisWeek={isDateInWeek(
              ingredientMap.get(entry.ingredientId)?.firstTriedDate,
              weekStartDate,
            )}
            onEdit={() => {
              setAdding(false);
              setEditingEntryId(entry.id);
            }}
            onDelete={() => deleteEntry(weekStartDate, date, mealIndex, entry.id)}
          />
        ))}
      </div>

      <div className={styles.addWrap}>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => {
            setEditingEntryId(null);
            setAdding(true);
          }}
        >
          + 追加
        </button>
        {adding && (
          <IngredientPicker
            category={category}
            ingredients={ingredients}
            onSave={(ingredientId, grams) => {
              addEntry(weekStartDate, date, mealIndex, { id: createId(), ingredientId, grams });
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}
        {editingEntry && (
          <IngredientPicker
            category={category}
            ingredients={ingredients}
            initial={editingEntry}
            onSave={(ingredientId, grams) => {
              updateEntry(weekStartDate, date, mealIndex, { id: editingEntry.id, ingredientId, grams });
              setEditingEntryId(null);
            }}
            onCancel={() => setEditingEntryId(null)}
          />
        )}
      </div>
    </div>
  );
}
