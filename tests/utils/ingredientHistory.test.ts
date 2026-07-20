import { describe, expect, it } from 'vitest';
import type { Ingredient, WeekPlan } from '../../src/types';
import { getEffectiveFirstTriedDateMap, hasNoPastRecord } from '../../src/utils/ingredientHistory';

function ingredient(id: string, overrides: Partial<Ingredient> = {}): Ingredient {
  return { id, name: id, category: '赤', ...overrides };
}

function weekPlanWithEntry(weekStartDate: string, date: string, ingredientId: string): WeekPlan {
  return {
    weekStartDate,
    days: [
      {
        date,
        meals: [{ id: 'm1', entries: [{ id: 'e1', ingredientId, grams: 10 }] }],
      },
    ],
  };
}

describe('getEffectiveFirstTriedDateMap', () => {
  it('手動firstTriedDateが自動推定より優先される(未来日でも優先)', () => {
    const ingredients = [ingredient('a', { firstTriedDate: '2099-01-01' })];
    const weekPlans = [weekPlanWithEntry('2026-07-20', '2026-07-21', 'a')];
    const result = getEffectiveFirstTriedDateMap(ingredients, weekPlans);
    expect(result.get('a')).toBe('2099-01-01');
  });

  it('手動未設定なら週プラン全体(過去・未来問わず)から最短日を採用する', () => {
    const ingredients = [ingredient('a')];
    const weekPlans = [
      weekPlanWithEntry('2026-07-20', '2026-07-22', 'a'),
      weekPlanWithEntry('2026-07-13', '2026-07-15', 'a'),
    ];
    const result = getEffectiveFirstTriedDateMap(ingredients, weekPlans);
    expect(result.get('a')).toBe('2026-07-15');
  });

  it('記録が全くない食材はMapに含まれない', () => {
    const ingredients = [ingredient('a')];
    const result = getEffectiveFirstTriedDateMap(ingredients, []);
    expect(result.has('a')).toBe(false);
  });
});

describe('hasNoPastRecord', () => {
  it('undefinedはtrue', () => {
    expect(hasNoPastRecord(undefined, '2026-07-20')).toBe(true);
  });

  it('未来日はtrue', () => {
    expect(hasNoPastRecord('2026-07-21', '2026-07-20')).toBe(true);
  });

  it('当日はfalse', () => {
    expect(hasNoPastRecord('2026-07-20', '2026-07-20')).toBe(false);
  });

  it('過去日はfalse', () => {
    expect(hasNoPastRecord('2026-07-19', '2026-07-20')).toBe(false);
  });
});
