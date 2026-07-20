import { describe, expect, it } from 'vitest';
import type { Ingredient } from '../../src/types';
import { getRecommendationStatus } from '../../src/utils/ingredientRecommendation';

function ingredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return { id: 'a', name: 'a', category: '赤', ...overrides };
}

describe('getRecommendationStatus', () => {
  it('ageMonthsがnull(誕生日未設定)なら常にrecommended', () => {
    const result = getRecommendationStatus(ingredient({ minAgeMonths: 12, prohibited: true }), null);
    expect(result).toBe('recommended');
  });

  it('minAgeMonths未設定ならrecommended', () => {
    expect(getRecommendationStatus(ingredient(), 3)).toBe('recommended');
  });

  it('ageMonthsがminAgeMonths以上ならrecommended', () => {
    const result = getRecommendationStatus(ingredient({ minAgeMonths: 6 }), 6);
    expect(result).toBe('recommended');
  });

  it('minAgeMonths未達かつprohibitedでないならnotYetRecommended', () => {
    const result = getRecommendationStatus(ingredient({ minAgeMonths: 6 }), 5);
    expect(result).toBe('notYetRecommended');
  });

  it('minAgeMonths未達かつprohibitedならforbidden', () => {
    const result = getRecommendationStatus(ingredient({ minAgeMonths: 6, prohibited: true }), 5);
    expect(result).toBe('forbidden');
  });
});
