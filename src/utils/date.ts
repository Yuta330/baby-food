const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'] as const;

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** 指定日を含む週の月曜日を 'YYYY-MM-DD' で返す */
export function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=日, 1=月, ... 6=土
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toDateKey(d);
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function getWeekDates(weekStartDate: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));
}

export function formatMonthDay(dateKey: string): string {
  const [, m, d] = dateKey.split('-').map(Number);
  return `${m}/${d}`;
}

export function getDayLabel(dateKey: string, weekStartDate: string): string {
  const index = getWeekDates(weekStartDate).indexOf(dateKey);
  return DAY_LABELS[index] ?? '';
}

export function formatWeekRange(weekStartDate: string): string {
  const dates = getWeekDates(weekStartDate);
  const first = dates[0];
  const last = dates[6];
  return `${formatMonthDay(first)}(月) 〜 ${formatMonthDay(last)}(日)`;
}

export function isDateInWeek(date: string | undefined, weekStartDate: string): boolean {
  if (!date) return false;
  const weekEnd = addDays(weekStartDate, 6);
  return date >= weekStartDate && date <= weekEnd; // YYYY-MM-DD文字列は辞書順=時系列順
}
