import { useState } from 'react';
import type { Ingredient, Meal, PlanEntry, Recipe } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { createId } from '../../utils/id';
import { getAgeInMonths } from '../../utils/date';
import { getRecommendationStatus } from '../../utils/ingredientRecommendation';
import styles from './MealRecipeSection.module.css';

interface Props {
  weekStartDate: string;
  date: string;
  mealIndex: number;
  meal: Meal | undefined;
  recipes: Recipe[];
  ingredients: Ingredient[];
  babyBirthday: string | undefined;
}

interface RecipeGroup {
  recipeGroupId: string;
  recipeId: string | undefined;
  entries: PlanEntry[];
}

function collectGroups(entries: PlanEntry[]): RecipeGroup[] {
  const groups = new Map<string, RecipeGroup>();
  for (const entry of entries) {
    if (!entry.recipeGroupId) continue;
    const existing = groups.get(entry.recipeGroupId);
    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.set(entry.recipeGroupId, {
        recipeGroupId: entry.recipeGroupId,
        recipeId: entry.recipeId,
        entries: [entry],
      });
    }
  }
  return [...groups.values()];
}

export function MealRecipeSection({
  weekStartDate,
  date,
  mealIndex,
  meal,
  recipes,
  ingredients,
  babyBirthday,
}: Props) {
  const { addEntries, deleteRecipeGroup, rescaleRecipeGroup } = useAppData();
  const [adding, setAdding] = useState(false);
  const [recipeId, setRecipeId] = useState('');
  const [targetGrams, setTargetGrams] = useState('');
  const [rescalingGroupId, setRescalingGroupId] = useState<string | null>(null);
  const [rescaleGrams, setRescaleGrams] = useState('');

  const groups = collectGroups(meal?.entries ?? []);
  const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));
  const ageMonths = getAgeInMonths(babyBirthday, date);

  const selectedRecipe = recipes.find((r) => r.id === recipeId);
  const availableItems = (selectedRecipe?.items ?? []).filter((item) =>
    ingredientMap.has(item.ingredientId),
  );
  const forbiddenItems = availableItems.filter((item) => {
    const ingredient = ingredientMap.get(item.ingredientId);
    return ingredient && getRecommendationStatus(ingredient, ageMonths) === 'forbidden';
  });
  const defaultTotalGrams = availableItems.reduce((sum, item) => sum + item.grams, 0);
  const effectiveGrams = targetGrams.trim() === '' ? defaultTotalGrams : Number(targetGrams);
  const multiplierValue = defaultTotalGrams > 0 ? effectiveGrams / defaultTotalGrams : 0;
  const canAdd =
    selectedRecipe !== undefined &&
    availableItems.length > 0 &&
    effectiveGrams > 0 &&
    forbiddenItems.length === 0;

  const resetAddForm = () => {
    setAdding(false);
    setRecipeId('');
    setTargetGrams('');
  };

  return (
    <div className={styles.section}>
      {groups.length > 0 && (
        <div className={styles.groups}>
          {groups.map((group) => {
            const recipe = recipes.find((r) => r.id === group.recipeId);
            const recipeName = recipe?.name ?? '(削除された料理)';
            const isRescaling = rescalingGroupId === group.recipeGroupId;
            return (
              <div key={group.recipeGroupId} className={styles.group}>
                <span className={styles.groupName}>{recipeName}</span>
                {isRescaling ? (
                  <span className={styles.rescaleForm}>
                    <input
                      type="number"
                      step={1}
                      min={1}
                      value={rescaleGrams}
                      onChange={(e) => setRescaleGrams(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      disabled={!(Number(rescaleGrams) > 0)}
                      onClick={() => {
                        const entered = Number(rescaleGrams);
                        const baseTotal = group.entries.reduce(
                          (sum, e) => sum + (e.baseGrams ?? e.grams),
                          0,
                        );
                        const multiplier = baseTotal > 0 ? entered / baseTotal : 1;
                        rescaleRecipeGroup(
                          weekStartDate,
                          date,
                          mealIndex,
                          group.recipeGroupId,
                          multiplier,
                        );
                        setRescalingGroupId(null);
                      }}
                    >
                      保存
                    </button>
                    <button type="button" onClick={() => setRescalingGroupId(null)}>
                      キャンセル
                    </button>
                  </span>
                ) : (
                  <span className={styles.groupActions}>
                    <button
                      type="button"
                      onClick={() => {
                        const currentTotal = group.entries.reduce((sum, e) => sum + e.grams, 0);
                        setRescaleGrams(String(currentTotal));
                        setRescalingGroupId(group.recipeGroupId);
                      }}
                    >
                      グラム数を変更
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const message = `「${recipeName}」の食材${group.entries.length}件をまとめて削除しますか?`;
                        if (window.confirm(message)) {
                          deleteRecipeGroup(weekStartDate, date, mealIndex, group.recipeGroupId);
                        }
                      }}
                    >
                      削除
                    </button>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.addWrap}>
        <button type="button" className={styles.addButton} onClick={() => setAdding(true)}>
          + 料理から追加
        </button>
        {adding && (
          <div className={styles.popover}>
            {recipes.length === 0 ? (
              <p className={styles.empty}>
                料理がまだありません。「料理マスタ」から追加してください。
              </p>
            ) : (
              <>
                <select value={recipeId} onChange={(e) => setRecipeId(e.target.value)}>
                  <option value="">料理を選択</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step={1}
                  min={1}
                  placeholder={
                    selectedRecipe && availableItems.length > 0
                      ? `合計グラム数(既定 ${defaultTotalGrams}g)`
                      : '合計グラム数'
                  }
                  value={targetGrams}
                  onChange={(e) => setTargetGrams(e.target.value)}
                />
                {selectedRecipe && availableItems.length > 0 && (
                  <p className={styles.hint}>
                    未入力の場合は既定の{defaultTotalGrams}gで追加されます。
                  </p>
                )}
                {selectedRecipe && availableItems.length === 0 && (
                  <p className={styles.empty}>構成食材がすべて削除されています。</p>
                )}
                {forbiddenItems.length > 0 && (
                  <p className={styles.warning}>
                    {forbiddenItems
                      .map((item) => ingredientMap.get(item.ingredientId)?.name)
                      .filter(Boolean)
                      .join('、')}
                    が月齢的に禁止のため追加できません。
                  </p>
                )}
              </>
            )}
            <div className={styles.actions}>
              <button type="button" onClick={resetAddForm}>
                キャンセル
              </button>
              <button
                type="button"
                disabled={!canAdd}
                onClick={() => {
                  if (!selectedRecipe) return;
                  const recipeGroupId = createId();
                  const entries: PlanEntry[] = availableItems.map((item) => ({
                    id: createId(),
                    ingredientId: item.ingredientId,
                    grams: Math.max(1, Math.round(item.grams * multiplierValue)),
                    recipeId: selectedRecipe.id,
                    recipeGroupId,
                    baseGrams: item.grams,
                  }));
                  addEntries(weekStartDate, date, mealIndex, entries);
                  resetAddForm();
                }}
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
