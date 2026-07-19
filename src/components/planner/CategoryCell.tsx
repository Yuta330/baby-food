import { useState } from 'react';
import type { FoodCategory, Ingredient, PlanEntry, Recipe } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { createId } from '../../utils/id';
import { isDateInWeek } from '../../utils/date';
import { groupEntriesByIngredient } from '../../utils/entryAggregation';
import { EntryChip } from './EntryChip';
import { AggregatedEntryChip } from './AggregatedEntryChip';
import { IngredientPicker } from './IngredientPicker';
import styles from './CategoryCell.module.css';

function resolveRecipeName(entry: PlanEntry, recipeMap: Map<string, Recipe>): string | undefined {
  return entry.recipeId ? (recipeMap.get(entry.recipeId)?.name ?? '(削除された料理)') : undefined;
}

interface Props {
  weekStartDate: string;
  date: string;
  mealIndex: number;
  category: FoodCategory;
  entries: PlanEntry[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  effectiveDates: Map<string, string>;
  babyBirthday: string | undefined;
}

const CATEGORY_CLASS: Record<FoodCategory, string> = {
  赤: styles.red,
  黄: styles.yellow,
  緑: styles.green,
};

export function CategoryCell({
  weekStartDate,
  date,
  mealIndex,
  category,
  entries,
  ingredients,
  recipes,
  effectiveDates,
  babyBirthday,
}: Props) {
  const { addEntry, updateEntry, deleteEntry } = useAppData();
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  const editingEntry = entries.find((e) => e.id === editingEntryId);

  return (
    <div className={`${styles.cell} ${CATEGORY_CLASS[category]}`}>
      <div className={styles.chips}>
        {groupEntriesByIngredient(entries).map((group) => {
          const ingredientName = ingredientMap.get(group.ingredientId)?.name ?? '(削除された食材)';
          const isFirstThisWeek = isDateInWeek(effectiveDates.get(group.ingredientId), weekStartDate);

          if (group.items.length === 1) {
            const entry = group.items[0];
            return (
              <EntryChip
                key={group.ingredientId}
                entry={entry}
                ingredientName={ingredientName}
                isFirstThisWeek={isFirstThisWeek}
                recipeName={resolveRecipeName(entry, recipeMap)}
                onEdit={() => {
                  setAdding(false);
                  setEditingEntryId(entry.id);
                }}
                onDelete={() => deleteEntry(weekStartDate, date, mealIndex, entry.id)}
              />
            );
          }

          return (
            <AggregatedEntryChip
              key={group.ingredientId}
              ingredientName={ingredientName}
              totalGrams={group.totalGrams}
              isFirstThisWeek={isFirstThisWeek}
              items={group.items.map((entry) => ({
                entry,
                recipeName: resolveRecipeName(entry, recipeMap) ?? '手動追加',
              }))}
              onEditItem={(entryId) => {
                setAdding(false);
                setEditingEntryId(entryId);
              }}
              onDeleteItem={(entryId) => deleteEntry(weekStartDate, date, mealIndex, entryId)}
            />
          );
        })}
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
            date={date}
            babyBirthday={babyBirthday}
            onSave={(ingredientId, grams) => {
              addEntry(weekStartDate, date, mealIndex, { id: createId(), ingredientId, grams });
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        )}
        {editingEntry && (
          <IngredientPicker
            key={editingEntry.id}
            category={category}
            ingredients={ingredients}
            date={date}
            babyBirthday={babyBirthday}
            initial={editingEntry}
            onSave={(ingredientId, grams) => {
              updateEntry(weekStartDate, date, mealIndex, {
                ...editingEntry,
                ingredientId,
                grams,
                baseGrams: editingEntry.baseGrams === undefined ? undefined : grams,
              });
              setEditingEntryId(null);
            }}
            onCancel={() => setEditingEntryId(null)}
          />
        )}
      </div>
    </div>
  );
}
