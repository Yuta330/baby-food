import type { RecommendationStatus } from './ingredientRecommendation';

export type RecommendationFilter = 'all' | RecommendationStatus;
export type ExperienceFilter = 'all' | 'noRecord' | 'hasRecord';

export interface IngredientFilters {
  recommendation: RecommendationFilter;
  experience: ExperienceFilter;
}

export const DEFAULT_INGREDIENT_FILTERS: IngredientFilters = {
  recommendation: 'all',
  experience: 'all',
};

export function matchesIngredientFilter(
  status: RecommendationStatus,
  hasNoRecord: boolean,
  filters: IngredientFilters,
): boolean {
  if (filters.recommendation !== 'all' && status !== filters.recommendation) return false;
  if (filters.experience === 'noRecord' && !hasNoRecord) return false;
  if (filters.experience === 'hasRecord' && hasNoRecord) return false;
  return true;
}
