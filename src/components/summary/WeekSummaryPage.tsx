import { useAppData } from '../../context/AppDataContext';
import { summarizeWeek } from '../../utils/summary';
import { WeekSelector } from '../planner/WeekSelector';
import { SummaryTable } from './SummaryTable';
import styles from './WeekSummaryPage.module.css';

interface Props {
  weekStartDate: string;
  onWeekChange: (weekStartDate: string) => void;
}

export function WeekSummaryPage({ weekStartDate, onWeekChange }: Props) {
  const { data, getWeekPlan } = useAppData();
  const rows = summarizeWeek(weekStartDate, getWeekPlan(weekStartDate), data.ingredients);

  return (
    <div className={styles.page}>
      <h1>週間サマリー(買い物リスト)</h1>
      <WeekSelector weekStartDate={weekStartDate} onChange={onWeekChange} />
      <SummaryTable rows={rows} />
    </div>
  );
}
