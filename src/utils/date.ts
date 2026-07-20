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

export function formatYmd(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return `${y}/${pad2(m)}/${pad2(d)}`;
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

export function isToday(dateKey: string, today: string): boolean {
  return dateKey === today;
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 誕生日から指定日時点での満月齢を算出。
 * birthday未設定、または'YYYY-MM-DD'形式でない(壊れたバックアップ等)ならnull(制限なし扱い)。
 * atDateが誕生日より前(まだ生まれていない)の場合は0(最も未熟な月齢)にクランプする
 * — nullを返すと「誕生日未設定」と区別できず、禁止食材が無制限扱いになってしまうため。
 * ※フォーマットのみ検証し、暦として妥当か(例: 2026-13-45)までは検証しない。
 */
export function getAgeInMonths(birthday: string | undefined, atDate: string): number | null {
  if (!birthday || !DATE_KEY_RE.test(birthday)) return null;
  const [by, bm, bd] = birthday.split('-').map(Number);
  const [ay, am, ad] = atDate.split('-').map(Number);
  let months = (ay - by) * 12 + (am - bm);
  if (ad < bd) months -= 1;
  return Math.max(0, months);
}
