import { useAppData } from '../../context/AppDataContext';
import { summarizeWeek } from '../../utils/summary';
import { getEffectiveFirstTriedDateMap } from '../../utils/ingredientHistory';
import { WeekSelector } from '../planner/WeekSelector';
import { SummaryTable } from './SummaryTable';
import styles from './WeekSummaryPage.module.css';

interface Props {
  weekStartDate: string;
  onWeekChange: (weekStartDate: string) => void;
  todayWeekStart: string;
}

export function WeekSummaryPage({ weekStartDate, onWeekChange, todayWeekStart }: Props) {
  const { data, getWeekPlan } = useAppData();
  const effectiveDates = getEffectiveFirstTriedDateMap(data.ingredients, data.weekPlans);
  const rows = summarizeWeek(weekStartDate, getWeekPlan(weekStartDate), data.ingredients, effectiveDates);

  return (
    <div className={styles.page}>
      <WeekSelector weekStartDate={weekStartDate} onChange={onWeekChange} todayWeekStart={todayWeekStart} />
      <SummaryTable rows={rows} />
    </div>
  );
}
