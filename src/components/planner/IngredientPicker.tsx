import { useState } from 'react';
import type { FoodCategory, Ingredient, PlanEntry } from '../../types';
import { getAgeInMonths } from '../../utils/date';
import { getRecommendationStatus } from '../../utils/ingredientRecommendation';
import { GramsStepper } from '../common/GramsStepper';
import styles from './IngredientPicker.module.css';

interface Props {
  category: FoodCategory;
  ingredients: Ingredient[];
  date: string;
  babyBirthday: string | undefined;
  initial?: PlanEntry;
  onSave: (ingredientId: string, grams: number) => void;
  onCancel: () => void;
}

export function IngredientPicker({
  category,
  ingredients,
  date,
  babyBirthday,
  initial,
  onSave,
  onCancel,
}: Props) {
  const options = ingredients.filter((i) => i.category === category);
  const ageMonths = getAgeInMonths(babyBirthday, date);
  const optionStatus = new Map(options.map((i) => [i.id, getRecommendationStatus(i, ageMonths)]));
  const [ingredientId, setIngredientId] = useState(() => {
    const selectable = options.find((i) => optionStatus.get(i.id) !== 'forbidden');
    return initial?.ingredientId ?? selectable?.id ?? options[0]?.id ?? '';
  });
  const [grams, setGrams] = useState<number | undefined>(initial?.grams);

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

  const selectedIngredient = options.find((i) => i.id === ingredientId);
  const blockedSelection =
    optionStatus.get(ingredientId) === 'forbidden' && ingredientId !== initial?.ingredientId;
  const hasUsableAmount =
    grams !== undefined ? grams > 0 : selectedIngredient?.defaultGrams !== undefined;
  const isValid = ingredientId !== '' && hasUsableAmount && !blockedSelection;
  const resolvedGrams = grams ?? selectedIngredient?.defaultGrams ?? 0;

  return (
    <div className={styles.popover}>
      <select value={ingredientId} onChange={(e) => setIngredientId(e.target.value)}>
        {options.map((i) => {
          const status = optionStatus.get(i.id);
          const disabled = status === 'forbidden' && i.id !== initial?.ingredientId;
          const suffix =
            status === 'forbidden'
              ? ` (禁止・${i.minAgeMonths}ヶ月〜)`
              : status === 'notYetRecommended'
                ? ` (${i.minAgeMonths}ヶ月〜)`
                : '';
          return (
            <option key={i.id} value={i.id} disabled={disabled}>
              {i.name}
              {suffix}
            </option>
          );
        })}
      </select>
      <GramsStepper
        value={grams}
        onChange={setGrams}
        placeholder={
          selectedIngredient?.defaultGrams !== undefined
            ? `既定 ${selectedIngredient.defaultGrams}g`
            : 'グラム数'
        }
      />
      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={() => onSave(ingredientId, resolvedGrams)}
        >
          保存
        </button>
      </div>
    </div>
  );
}
