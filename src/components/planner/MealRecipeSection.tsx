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
  const [multiplier, setMultiplier] = useState('1');
  const [rescalingGroupId, setRescalingGroupId] = useState<string | null>(null);
  const [rescaleMultiplier, setRescaleMultiplier] = useState('1');

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
  const multiplierValue = Number(multiplier);
  const canAdd =
    selectedRecipe !== undefined &&
    availableItems.length > 0 &&
    multiplierValue > 0 &&
    forbiddenItems.length === 0;

  const resetAddForm = () => {
    setAdding(false);
    setRecipeId('');
    setMultiplier('1');
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
                      step={0.1}
                      min={0.1}
                      value={rescaleMultiplier}
                      onChange={(e) => setRescaleMultiplier(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const value = Number(rescaleMultiplier);
                        if (value > 0) {
                          rescaleRecipeGroup(
                            weekStartDate,
                            date,
                            mealIndex,
                            group.recipeGroupId,
                            value,
                          );
                        }
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
                        const first = group.entries[0];
                        const estimate =
                          first?.baseGrams && first.baseGrams > 0
                            ? Math.round((first.grams / first.baseGrams) * 100) / 100
                            : 1;
                        setRescaleMultiplier(String(estimate));
                        setRescalingGroupId(group.recipeGroupId);
                      }}
                    >
                      倍率変更
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
                  step={0.1}
                  min={0.1}
                  placeholder="倍率"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                />
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
