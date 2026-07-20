import { describe, expect, it } from 'vitest';
import {
  addDays,
  formatMonthDay,
  formatWeekRange,
  formatYmd,
  getAgeInMonths,
  getDayLabel,
  getMonday,
  getWeekDates,
  isDateInWeek,
} from './date';

describe('getMonday', () => {
  it('週の途中の日付から月曜日を返す', () => {
    // 2026-07-22 は水曜日
    expect(getMonday(new Date(2026, 6, 22))).toBe('2026-07-20');
  });

  it('日曜日は前日ではなく同じ週の月曜日を返す', () => {
    // 2026-07-26 は日曜日
    expect(getMonday(new Date(2026, 6, 26))).toBe('2026-07-20');
  });

  it('月曜日自身はそのまま返す', () => {
    expect(getMonday(new Date(2026, 6, 20))).toBe('2026-07-20');
  });
});

describe('addDays', () => {
  it('月をまたぐ加算を正しく処理する', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('年をまたぐ加算を正しく処理する', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('負の日数で過去方向に計算できる', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('0日を渡すと同じ日付を返す', () => {
    expect(addDays('2026-07-20', 0)).toBe('2026-07-20');
  });
});

describe('getWeekDates', () => {
  it('月曜始まりの7日間を返す', () => {
    expect(getWeekDates('2026-07-20')).toEqual([
      '2026-07-20',
      '2026-07-21',
      '2026-07-22',
      '2026-07-23',
      '2026-07-24',
      '2026-07-25',
      '2026-07-26',
    ]);
  });
});

describe('isDateInWeek', () => {
  it('undefinedはfalseを返す', () => {
    expect(isDateInWeek(undefined, '2026-07-20')).toBe(false);
  });

  it('週の開始日ちょうどはtrue', () => {
    expect(isDateInWeek('2026-07-20', '2026-07-20')).toBe(true);
  });

  it('週の終了日ちょうどはtrue', () => {
    expect(isDateInWeek('2026-07-26', '2026-07-20')).toBe(true);
  });

  it('週の外の日付はfalse', () => {
    expect(isDateInWeek('2026-07-27', '2026-07-20')).toBe(false);
    expect(isDateInWeek('2026-07-19', '2026-07-20')).toBe(false);
  });
});

describe('getAgeInMonths', () => {
  it('birthday未設定ならnullを返す', () => {
    expect(getAgeInMonths(undefined, '2026-07-20')).toBeNull();
  });

  it('不正フォーマットならnullを返す', () => {
    expect(getAgeInMonths('2026/07/20', '2026-07-20')).toBeNull();
  });

  it('誕生日当日は0ヶ月', () => {
    expect(getAgeInMonths('2026-07-20', '2026-07-20')).toBe(0);
  });

  it('誕生日の前日はまだ加算しない(日境界)', () => {
    expect(getAgeInMonths('2026-01-15', '2026-07-14')).toBe(5);
  });

  it('誕生日の当日を過ぎると加算する(日境界)', () => {
    expect(getAgeInMonths('2026-01-15', '2026-07-15')).toBe(6);
  });

  it('atDateが誕生日より前の場合は0にクランプする', () => {
    expect(getAgeInMonths('2026-07-20', '2026-01-01')).toBe(0);
  });
});

describe('getDayLabel', () => {
  it('週内の日付には対応する曜日ラベルを返す', () => {
    expect(getDayLabel('2026-07-20', '2026-07-20')).toBe('月');
    expect(getDayLabel('2026-07-26', '2026-07-20')).toBe('日');
  });

  it('週に含まれない日付は空文字を返す', () => {
    expect(getDayLabel('2026-07-27', '2026-07-20')).toBe('');
  });
});

describe('formatMonthDay / formatYmd / formatWeekRange', () => {
  it('formatMonthDayはゼロ埋めなしのM/D形式', () => {
    expect(formatMonthDay('2026-07-05')).toBe('7/5');
  });

  it('formatYmdはゼロ埋めありのYYYY/MM/DD形式', () => {
    expect(formatYmd('2026-07-05')).toBe('2026/07/05');
  });

  it('formatWeekRangeは開始〜終了の範囲表記を返す', () => {
    expect(formatWeekRange('2026-07-20')).toBe('7/20(月) 〜 7/26(日)');
  });
});
