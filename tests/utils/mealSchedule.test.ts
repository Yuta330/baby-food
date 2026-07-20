import { describe, expect, it } from 'vitest';
import { getDefaultMealCount } from '../../src/utils/mealSchedule';

describe('getDefaultMealCount', () => {
  it('スケジュール未設定なら常に1', () => {
    expect(getDefaultMealCount('2026-07-20', undefined)).toBe(1);
  });

  it('secondMealStartDate未到達なら1', () => {
    const schedule = { secondMealStartDate: '2026-08-01' };
    expect(getDefaultMealCount('2026-07-31', schedule)).toBe(1);
  });

  it('secondMealStartDate当日から2', () => {
    const schedule = { secondMealStartDate: '2026-08-01' };
    expect(getDefaultMealCount('2026-08-01', schedule)).toBe(2);
  });

  it('thirdMealStartDate当日から3', () => {
    const schedule = { secondMealStartDate: '2026-08-01', thirdMealStartDate: '2026-09-01' };
    expect(getDefaultMealCount('2026-09-01', schedule)).toBe(3);
    expect(getDefaultMealCount('2026-08-31', schedule)).toBe(2);
  });

  it('thirdMealStartDateがsecondMealStartDateより前(無効)なら3にはならない', () => {
    const schedule = { secondMealStartDate: '2026-08-01', thirdMealStartDate: '2026-07-01' };
    expect(getDefaultMealCount('2026-09-01', schedule)).toBe(2);
  });
});
