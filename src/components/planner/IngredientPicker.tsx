import { useState } from 'react';
import type { FoodCategory, Ingredient, PlanEntry } from '../../types';
import styles from './IngredientPicker.module.css';

interface Props {
  category: FoodCategory;
  ingredients: Ingredient[];
  initial?: PlanEntry;
  onSave: (ingredientId: string, grams: number) => void;
  onCancel: () => void;
}

export function IngredientPicker({ category, ingredients, initial, onSave, onCancel }: Props) {
  const options = ingredients.filter((i) => i.category === category);
  const [ingredientId, setIngredientId] = useState(initial?.ingredientId ?? options[0]?.id ?? '');
  const [grams, setGrams] = useState(initial ? String(initial.grams) : '');

  if (options.length === 0) {
    return (
      <div className={styles.popover}>
        <p className={styles.empty}>
          このカテゴリの食材がまだありません。「食材マスタ」から追加してください。
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel}>
            閉じる
          </button>
        </div>
      </div>
    );
  }

  const gramsValue = Number(grams);
  const isValid = ingredientId !== '' && grams !== '' && gramsValue > 0;

  return (
    <div className={styles.popover}>
      <select value={ingredientId} onChange={(e) => setIngredientId(e.target.value)}>
        {options.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        placeholder="グラム数"
        value={grams}
        onChange={(e) => setGrams(e.target.value)}
      />
      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={() => onSave(ingredientId, gramsValue)}
        >
          保存
        </button>
      </div>
    </div>
  );
}
