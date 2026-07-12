import { useState } from 'react';
import type { FoodCategory, Ingredient } from '../../types';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABEL } from '../../types';
import styles from './IngredientForm.module.css';

interface Props {
  initial?: Ingredient;
  onSave: (name: string, category: FoodCategory, firstTriedDate?: string) => void;
  onCancel: () => void;
}

export function IngredientForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<FoodCategory>(initial?.category ?? '赤');
  const [firstTriedDate, setFirstTriedDate] = useState(initial?.firstTriedDate ?? '');

  const isValid = name.trim().length > 0;

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSave(name.trim(), category, firstTriedDate || undefined);
      }}
    >
      <input
        type="text"
        placeholder="食材名"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <select value={category} onChange={(e) => setCategory(e.target.value as FoodCategory)}>
        {FOOD_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {FOOD_CATEGORY_LABEL[c]}
          </option>
        ))}
      </select>
      <label className={styles.dateField}>
        初めて食べた日
        <input
          type="date"
          value={firstTriedDate}
          onChange={(e) => setFirstTriedDate(e.target.value)}
        />
      </label>
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
