import { describe, expect, it } from 'vitest';
import { matchesIngredientFilter } from '../../src/utils/ingredientFilter';

describe('matchesIngredientFilter', () => {
  it('推奨・経験ともにallなら常にtrue', () => {
    expect(
      matchesIngredientFilter('forbidden', true, { recommendation: 'all', experience: 'all' }),
    ).toBe(true);
  });

  it('推奨状況が一致しない場合はfalse', () => {
    expect(
      matchesIngredientFilter('recommended', true, {
        recommendation: 'notYetRecommended',
        experience: 'all',
      }),
    ).toBe(false);
  });

  it('推奨状況が一致する場合はtrue', () => {
    expect(
      matchesIngredientFilter('forbidden', true, {
        recommendation: 'forbidden',
        experience: 'all',
      }),
    ).toBe(true);
  });

  it('経験フィルタnoRecordは未経験のみtrue', () => {
    expect(
      matchesIngredientFilter('recommended', true, { recommendation: 'all', experience: 'noRecord' }),
    ).toBe(true);
    expect(
      matchesIngredientFilter('recommended', false, { recommendation: 'all', experience: 'noRecord' }),
    ).toBe(false);
  });

  it('経験フィルタhasRecordは経験済みのみtrue', () => {
    expect(
      matchesIngredientFilter('recommended', false, { recommendation: 'all', experience: 'hasRecord' }),
    ).toBe(true);
    expect(
      matchesIngredientFilter('recommended', true, { recommendation: 'all', experience: 'hasRecord' }),
    ).toBe(false);
  });

  it('推奨・経験の両方の条件を満たす必要がある', () => {
    expect(
      matchesIngredientFilter('recommended', true, {
        recommendation: 'recommended',
        experience: 'hasRecord',
      }),
    ).toBe(false);
  });
});
