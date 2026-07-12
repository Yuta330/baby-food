import { useAppData } from '../../context/AppDataContext';
import { addDays, getWeekDates, toDateKey } from '../../utils/date';
import { getEffectiveFirstTriedDateMap } from '../../utils/ingredientHistory';
import { weekPlanHasAnyEntry } from '../../utils/copyWeek';
import { WeekSelector } from './WeekSelector';
import { DayCard } from './DayCard';
import styles from './PlannerGrid.module.css';

interface Props {
  weekStartDate: string;
  onWeekChange: (weekStartDate: string) => void;
}

export function WeekPlannerPage({ weekStartDate, onWeekChange }: Props) {
  const { data, getWeekPlan, copyWeek } = useAppData();
  const weekPlan = getWeekPlan(weekStartDate);
  const dates = getWeekDates(weekStartDate);
  const today = toDateKey(new Date());
  const effectiveDates = getEffectiveFirstTriedDateMap(data.ingredients, data.weekPlans, today);
  const previousWeekStartDate = addDays(weekStartDate, -7);
  const canCopyPreviousWeek = weekPlanHasAnyEntry(getWeekPlan(previousWeekStartDate));

  return (
    <div className={styles.page}>
      <h1>週間プランナー</h1>
      <WeekSelector
        weekStartDate={weekStartDate}
        onChange={onWeekChange}
        onCopyPreviousWeek={() => copyWeek(previousWeekStartDate, weekStartDate)}
        canCopyPreviousWeek={canCopyPreviousWeek}
      />

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
