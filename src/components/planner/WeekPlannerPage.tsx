import { Fragment } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { FOOD_CATEGORIES, MAX_MEALS_PER_DAY } from '../../types';
import { getDayLabel, getWeekDates, formatMonthDay } from '../../utils/date';
import { WeekSelector } from './WeekSelector';
import { CategoryCell } from './CategoryCell';
import { EmptyMealCell } from './EmptyMealCell';
import { MealSectionHeader } from './MealSectionHeader';
import styles from './PlannerGrid.module.css';

interface Props {
  weekStartDate: string;
  onWeekChange: (weekStartDate: string) => void;
}

export function WeekPlannerPage({ weekStartDate, onWeekChange }: Props) {
  const { data, getWeekPlan } = useAppData();
  const weekPlan = getWeekPlan(weekStartDate);
  const dates = getWeekDates(weekStartDate);
  const mealIndexes = Array.from({ length: MAX_MEALS_PER_DAY }, (_, i) => i);

  return (
    <div className={styles.page}>
      <h1>週間プランナー</h1>
      <WeekSelector weekStartDate={weekStartDate} onChange={onWeekChange} />

      <div className={styles.grid}>
        <div className={styles.headerCell} />
        {dates.map((date) => (
          <div key={date} className={styles.headerCell}>
            {getDayLabel(date, weekStartDate)} <span className={styles.date}>{formatMonthDay(date)}</span>
          </div>
        ))}

        {mealIndexes.map((mealIndex) => (
          <Fragment key={mealIndex}>
            <MealSectionHeader
              weekStartDate={weekStartDate}
              dates={dates}
              mealIndex={mealIndex}
              weekPlan={weekPlan}
            />

            {FOOD_CATEGORIES.map((category) => (
              <Fragment key={category}>
                <div className={styles.rowLabel}>{category}</div>
                {dates.map((date) => {
                  const day = weekPlan?.days.find((d) => d.date === date);
                  // 週プランが未作成の日は「1食目のみ存在する」とみなす(createEmptyWeekPlanの初期状態と一致させる)
                  const mealCount = day ? day.meals.length : 1;

                  if (mealIndex >= mealCount) {
                    return <EmptyMealCell key={`${mealIndex}-${category}-${date}`} category={category} />;
                  }

                  const entries = (day?.meals[mealIndex]?.entries ?? []).filter((e) => {
                    const ing = data.ingredients.find((i) => i.id === e.ingredientId);
                    return (ing?.category ?? '緑') === category;
                  });

                  return (
                    <CategoryCell
                      key={`${mealIndex}-${category}-${date}`}
                      weekStartDate={weekStartDate}
                      date={date}
                      mealIndex={mealIndex}
                      category={category}
                      entries={entries}
                      ingredients={data.ingredients}
                    />
                  );
                })}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
