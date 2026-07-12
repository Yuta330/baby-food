import { useAppData } from '../../context/AppDataContext';
import { summarizeWeek } from '../../utils/summary';
import { toDateKey } from '../../utils/date';
import { getEffectiveFirstTriedDateMap } from '../../utils/ingredientHistory';
import { WeekSelector } from '../planner/WeekSelector';
import { SummaryTable } from './SummaryTable';
import styles from './WeekSummaryPage.module.css';

interface Props {
  weekStartDate: string;
  onWeekChange: (weekStartDate: string) => void;
}

export function WeekSummaryPage({ weekStartDate, onWeekChange }: Props) {
  const { data, getWeekPlan } = useAppData();
  const today = toDateKey(new Date());
  const effectiveDates = getEffectiveFirstTriedDateMap(data.ingredients, data.weekPlans, today);
  const rows = summarizeWeek(weekStartDate, getWeekPlan(weekStartDate), data.ingredients, effectiveDates);

  return (
    <div className={styles.page}>
      <h1>週間サマリー(買い物リスト)</h1>
      <WeekSelector weekStartDate={weekStartDate} onChange={onWeekChange} />
      <SummaryTable rows={rows} />
    </div>
  );
}
