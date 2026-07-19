import { useState } from 'react';
import type { FoodCategory, Ingredient } from '../../types';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABEL } from '../../types';
import { GramsStepper } from '../common/GramsStepper';
import styles from './IngredientForm.module.css';

interface Props {
  initial?: Ingredient;
  onSave: (
    name: string,
    category: FoodCategory,
    firstTriedDate?: string,
    minAgeMonths?: number,
    prohibited?: boolean,
    defaultGrams?: number,
  ) => void;
  onCancel: () => void;
}

export function IngredientForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<FoodCategory>(initial?.category ?? '赤');
  const [firstTriedDate, setFirstTriedDate] = useState(initial?.firstTriedDate ?? '');
  const [minAgeMonths, setMinAgeMonths] = useState(initial?.minAgeMonths?.toString() ?? '');
  const [prohibited, setProhibited] = useState(initial?.prohibited ?? false);
  const [defaultGrams, setDefaultGrams] = useState<number | undefined>(initial?.defaultGrams);

  const isValid = name.trim().length > 0;

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) {
          onSave(
            name.trim(),
            category,
            firstTriedDate || undefined,
            minAgeMonths ? Number(minAgeMonths) : undefined,
            minAgeMonths ? prohibited : false,
            defaultGrams,
          );
        }
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
      <label className={styles.numberField}>
        推奨開始月齢
        <input
          type="number"
          min={0}
          max={36}
          placeholder="未設定"
          value={minAgeMonths}
          onChange={(e) => {
            setMinAgeMonths(e.target.value);
            if (!e.target.value) setProhibited(false);
          }}
        />
        ヶ月〜
      </label>
      <label className={styles.numberField}>
        既定のグラム数
        <GramsStepper value={defaultGrams} onChange={setDefaultGrams} placeholder="未設定" />
      </label>
      <label className={styles.checkboxField}>
        <input
          type="checkbox"
          checked={prohibited}
          disabled={!minAgeMonths}
          onChange={(e) => setProhibited(e.target.checked)}
        />
        それまでは禁止(記録も不可)
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
