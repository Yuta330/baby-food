import type { ExperienceFilter, RecommendationFilter } from '../../utils/ingredientFilter';
import styles from './IngredientFilterBar.module.css';

interface Props {
  recommendation: RecommendationFilter;
  experience: ExperienceFilter;
  onRecommendationChange: (value: RecommendationFilter) => void;
  onExperienceChange: (value: ExperienceFilter) => void;
}

export function IngredientFilterBar({
  recommendation,
  experience,
  onRecommendationChange,
  onExperienceChange,
}: Props) {
  return (
    <div className={styles.bar}>
      <label className={styles.field}>
        推奨状況
        <select
          value={recommendation}
          onChange={(e) => onRecommendationChange(e.target.value as RecommendationFilter)}
        >
          <option value="all">全て</option>
          <option value="recommended">推奨</option>
          <option value="notYetRecommended">非推奨</option>
          <option value="forbidden">禁止</option>
        </select>
      </label>
      <label className={styles.field}>
        経験
        <select
          value={experience}
          onChange={(e) => onExperienceChange(e.target.value as ExperienceFilter)}
        >
          <option value="all">全て</option>
          <option value="noRecord">未経験(まだ)</option>
          <option value="hasRecord">経験済み</option>
        </select>
      </label>
    </div>
  );
}
