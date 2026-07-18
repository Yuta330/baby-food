import { useState } from 'react';
import type { Ingredient, Recipe, RecipeItem } from '../../types';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABEL } from '../../types';
import { createId } from '../../utils/id';
import styles from './RecipeForm.module.css';

interface Props {
  ingredients: Ingredient[];
  initial?: Recipe;
  onSave: (name: string, items: RecipeItem[]) => void;
  onCancel: () => void;
}

interface Row {
  key: string;
  ingredientId: string;
  grams: string;
}

function toRows(items?: RecipeItem[]): Row[] {
  if (!items || items.length === 0) return [{ key: createId(), ingredientId: '', grams: '' }];
  return items.map((item) => ({
    key: createId(),
    ingredientId: item.ingredientId,
    grams: String(item.grams),
  }));
}

export function RecipeForm({ ingredients, initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [rows, setRows] = useState<Row[]>(() => toRows(initial?.items));

  const updateRow = (key: string, update: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...update } : r)));

  const removeRow = (key: string) =>
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));

  const validItems: RecipeItem[] = rows
    .filter((r) => r.ingredientId !== '' && Number(r.grams) > 0)
    .map((r) => ({ ingredientId: r.ingredientId, grams: Number(r.grams) }));

  const isValid = name.trim().length > 0 && validItems.length > 0;

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSave(name.trim(), validItems);
      }}
    >
      <input
        type="text"
        placeholder="料理名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />

      <div className={styles.rows}>
        {rows.map((row) => (
          <div key={row.key} className={styles.row}>
            <select
              value={row.ingredientId}
              onChange={(e) => updateRow(row.key, { ingredientId: e.target.value })}
            >
              <option value="">食材を選択</option>
              {FOOD_CATEGORIES.map((category) => {
                const options = ingredients.filter((i) => i.category === category);
                if (options.length === 0) return null;
                return (
                  <optgroup key={category} label={FOOD_CATEGORY_LABEL[category]}>
                    {options.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <input
              type="number"
              min={0}
              placeholder="グラム数"
              value={row.grams}
              onChange={(e) => updateRow(row.key, { grams: e.target.value })}
            />
            <button
              type="button"
              className={styles.removeRow}
              disabled={rows.length <= 1}
              onClick={() => removeRow(row.key)}
              aria-label="行を削除"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.addRow}
        onClick={() =>
          setRows((prev) => [...prev, { key: createId(), ingredientId: '', grams: '' }])
        }
      >
        + 食材を追加
      </button>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" disabled={!isValid}>
          保存
        </button>
      </div>
    </form>
  );
}
