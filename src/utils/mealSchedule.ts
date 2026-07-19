import type { MealCountSchedule } from '../types';

/** 設定された開始日を基準に、指定日時点で既定表示すべき食事数を返す(YYYY-MM-DD文字列比較=時系列順) */
export function getDefaultMealCount(
  date: string,
  schedule: MealCountSchedule | undefined,
): number {
  const { secondMealStartDate, thirdMealStartDate } = schedule ?? {};
  if (
    secondMealStartDate &&
    thirdMealStartDate &&
    thirdMealStartDate >= secondMealStartDate &&
    date >= thirdMealStartDate
  ) {
    return 3;
  }
  if (secondMealStartDate && date >= secondMealStartDate) {
    return 2;
  }
  return 1;
}
