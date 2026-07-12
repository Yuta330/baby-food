import type { Ingredient } from '../types';

export type RecommendationStatus = 'recommended' | 'notYetRecommended' | 'forbidden';

/**
 * 月齢に応じた食材の推奨ステータスを判定する。
 * ageMonths未設定(誕生日未設定)なら常に'recommended'(制限なし)。
 */
export function getRecommendationStatus(
  ingredient: Ingredient,
  ageMonths: number | null,
): RecommendationStatus {
  if (ageMonths === null) return 'recommended';
  if (ingredient.minAgeMonths === undefined || ageMonths >= ingredient.minAgeMonths) {
    return 'recommended';
  }
  return ingredient.prohibited ? 'forbidden' : 'notYetRecommended';
}
