import { useState } from 'react';
import type { FoodCategory, Ingredient, WeekPlan } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { createId } from '../../utils/id';
import { getMonday } from '../../utils/date';
import { IngredientForm } from './IngredientForm';
import { IngredientList } from './IngredientList';
import styles from './IngredientMasterPage.module.css';

function countUsage(ingredientId: string, weekPlans: WeekPlan[]): number {
  let count = 0;
  for (const week of weekPlans) {
    for (const day of week.days) {
      for (const meal of day.meals) {
        count += meal.entries.filter((e) => e.ingredientId === ingredientId).length;
      }
    }
  }
  return count;
}

export function IngredientMasterPage() {
  const { data, addIngredient, updateIngredient, deleteIngredient } = useAppData();
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [adding, setAdding] = useState(false);
  const thisWeekStart = getMonday(new Date());

  return (
    <div className={styles.page}>
      <h1>食材マスタ</h1>

      {adding && (
        <IngredientForm
          onSave={(name, category: FoodCategory, firstTriedDate) => {
            addIngredient({ id: createId(), name, category, firstTriedDate });
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {editing && (
        <IngredientForm
          initial={editing}
          onSave={(name, category, firstTriedDate) => {
            updateIngredient({ id: editing.id, name, category, firstTriedDate });
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {!adding && !editing && (
        <button type="button" className={styles.addButton} onClick={() => setAdding(true)}>
          + 食材を追加
        </button>
      )}

      <IngredientList
        ingredients={data.ingredients}
        thisWeekStart={thisWeekStart}
        onEdit={(ingredient) => {
          setAdding(false);
          setEditing(ingredient);
        }}
        onDelete={(ingredient) => {
          const usage = countUsage(ingredient.id, data.weekPlans);
          const message =
            usage > 0
              ? `「${ingredient.name}」は${usage}件のプランで使用中です。削除しますか?`
              : `「${ingredient.name}」を削除しますか?`;
          if (window.confirm(message)) {
            deleteIngredient(ingredient.id);
          }
        }}
      />
    </div>
  );
}
