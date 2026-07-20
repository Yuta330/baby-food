import type { FoodCategory, Ingredient } from '../../types';
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABEL } from '../../types';
import { formatYmd } from '../../utils/date';
import { hasNoPastRecord } from '../../utils/ingredientHistory';
import type { ExperienceFilter, RecommendationFilter } from '../../utils/ingredientFilter';
import { matchesIngredientFilter } from '../../utils/ingredientFilter';
import { getRecommendationStatus } from '../../utils/ingredientRecommendation';
import styles from './IngredientList.module.css';

interface Props {
  ingredients: Ingredient[];
  today: string;
  effectiveDates: Map<string, string>;
  ageMonths: number | null;
  recommendationFilter: RecommendationFilter;
  experienceFilter: ExperienceFilter;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const CATEGORY_CLASS: Record<FoodCategory, string> = {
  赤: styles.red,
  黄: styles.yellow,
  緑: styles.green,
};

export function IngredientList({
  ingredients,
  today,
  effectiveDates,
  ageMonths,
  recommendationFilter,
  experienceFilter,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className={styles.groups}>
      {FOOD_CATEGORIES.map((category) => {
        const categoryItems = ingredients.filter((i) => i.category === category);
        const items = categoryItems.filter((ingredient) => {
          const effectiveDate = effectiveDates.get(ingredient.id);
          const status = getRecommendationStatus(ingredient, ageMonths);
          const hasNoRecord = hasNoPastRecord(effectiveDate, today);
          return matchesIngredientFilter(status, hasNoRecord, {
            recommendation: recommendationFilter,
            experience: experienceFilter,
          });
        });
        return (
          <section key={category} className={styles.group}>
            <h3 className={CATEGORY_CLASS[category]}>{FOOD_CATEGORY_LABEL[category]}</h3>
            {categoryItems.length === 0 ? (
              <p className={styles.empty}>食材がありません</p>
            ) : items.length === 0 ? (
              <p className={styles.empty}>フィルタ条件に一致する食材がありません</p>
            ) : (
              <ul className={styles.list}>
                {items.map((ingredient) => {
                  const effectiveDate = effectiveDates.get(ingredient.id);
                  const isAutoEstimate = !ingredient.firstTriedDate && effectiveDate;
                  const status = getRecommendationStatus(ingredient, ageMonths);
                  return (
                    <li key={ingredient.id} className={styles.item}>
                      <span className={styles.name}>
                        {ingredient.name}
                        {effectiveDate && (
                          <span className={styles.estimate}>
                            ({isAutoEstimate ? `推定 ${formatYmd(effectiveDate)}` : formatYmd(effectiveDate)})
                          </span>
                        )}
                        {hasNoPastRecord(effectiveDate, today) && (
                          <span className={styles.unexperiencedBadge}>まだ</span>
                        )}
                        {status === 'notYetRecommended' && (
                          <span className={styles.notYetRecommendedBadge}>
                            非推奨({ingredient.minAgeMonths}ヶ月〜)
                          </span>
                        )}
                        {status === 'forbidden' && (
                          <span className={styles.forbiddenBadge}>
                            禁止({ingredient.minAgeMonths}ヶ月〜)
                          </span>
                        )}
                      </span>
                      <span className={styles.itemActions}>
                        <button type="button" onClick={() => onEdit(ingredient)}>
                          編集
                        </button>
                        <button type="button" onClick={() => onDelete(ingredient)}>
                          削除
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
