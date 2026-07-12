import { useAppData } from '../../context/AppDataContext';
import { getWeekDates, toDateKey } from '../../utils/date';
import { getEffectiveFirstTriedDateMap } from '../../utils/ingredientHistory';
import { WeekSelector } from './WeekSelector';
import { DayCard } from './DayCard';
import styles from './PlannerGrid.module.css';

interface Props {
  weekStartDate: string;
  onWeekChange: (weekStartDate: string) => void;
}

export function WeekPlannerPage({ weekStartDate, onWeekChange }: Props) {
  const { data, getWeekPlan } = useAppData();
  const weekPlan = getWeekPlan(weekStartDate);
  const dates = getWeekDates(weekStartDate);
  const today = toDateKey(new Date());
  const effectiveDates = getEffectiveFirstTriedDateMap(data.ingredients, data.weekPlans, today);

  return (
    <div className={styles.page}>
      <h1>週間プランナー</h1>
      <WeekSelector weekStartDate={weekStartDate} onChange={onWeekChange} />

      <div className={styles.grid}>
        {dates.map((date) => (
          <DayCard
            key={date}
            weekStartDate={weekStartDate}
            date={date}
            weekPlan={weekPlan}
            ingredients={data.ingredients}
            effectiveDates={effectiveDates}
          />
        ))}
      </div>
    </div>
  );
}
