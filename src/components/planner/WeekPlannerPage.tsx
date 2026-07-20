import { useAppData } from '../../context/AppDataContext';
import { addDays, getWeekDates } from '../../utils/date';
import { getEffectiveFirstTriedDateMap } from '../../utils/ingredientHistory';
import { weekPlanHasAnyEntry } from '../../utils/copyWeek';
import { WeekSelector } from './WeekSelector';
import { DayCard } from './DayCard';
import styles from './PlannerGrid.module.css';

interface Props {
  weekStartDate: string;
  onWeekChange: (weekStartDate: string) => void;
  today: string;
  todayWeekStart: string;
}

export function WeekPlannerPage({ weekStartDate, onWeekChange, today, todayWeekStart }: Props) {
  const { data, getWeekPlan, copyWeek } = useAppData();
  const weekPlan = getWeekPlan(weekStartDate);
  const dates = getWeekDates(weekStartDate);
  const effectiveDates = getEffectiveFirstTriedDateMap(data.ingredients, data.weekPlans);
  const babyBirthday = data.settings.babyBirthday;
  const mealCountSchedule = data.settings.mealCountSchedule;
  const previousWeekStartDate = addDays(weekStartDate, -7);
  const canCopyPreviousWeek = weekPlanHasAnyEntry(getWeekPlan(previousWeekStartDate));

  return (
    <div className={styles.page}>
      <WeekSelector
        weekStartDate={weekStartDate}
        onChange={onWeekChange}
        todayWeekStart={todayWeekStart}
        onCopyPreviousWeek={() => copyWeek(previousWeekStartDate, weekStartDate)}
        canCopyPreviousWeek={canCopyPreviousWeek}
      />

      <div className={styles.grid}>
        {dates.map((date) => (
          <DayCard
            key={date}
            weekStartDate={weekStartDate}
            date={date}
            today={today}
            weekPlan={weekPlan}
            ingredients={data.ingredients}
            recipes={data.recipes}
            effectiveDates={effectiveDates}
            babyBirthday={babyBirthday}
            mealCountSchedule={mealCountSchedule}
          />
        ))}
      </div>
    </div>
  );
}
