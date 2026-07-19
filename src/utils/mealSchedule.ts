import { MAX_MEALS_PER_DAY, type MealCountSchedule } from '../types';

/** 設定された開始日を基準に、指定日時点で既定表示すべき食事数を返す(YYYY-MM-DD文字列比較=時系列順) */
export function getDefaultMealCount(
  date: string,
  schedule: MealCountSchedule | undefined,
): number {
  if (schedule?.thirdMealStartDate && date >= schedule.thirdMealStartDate) {
    return Math.min(3, MAX_MEALS_PER_DAY);
  }
  if (schedule?.secondMealStartDate && date >= schedule.secondMealStartDate) {
    return Math.min(2, MAX_MEALS_PER_DAY);
  }
  return 1;
}
