import { useAppData } from '../../context/AppDataContext';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { data, setBabyBirthday, setMealCountSchedule } = useAppData();
  const schedule = data.settings.mealCountSchedule ?? {};
  const scheduleInvalid =
    !!schedule.thirdMealStartDate &&
    (!schedule.secondMealStartDate || schedule.thirdMealStartDate < schedule.secondMealStartDate);

  return (
    <div className={styles.page}>
      <h1>設定</h1>
      <label className={styles.field}>
        赤ちゃんの誕生日
        <input
          type="date"
          value={data.settings.babyBirthday ?? ''}
          onChange={(e) => setBabyBirthday(e.target.value || undefined)}
        />
      </label>
      <p className={styles.hint}>
        誕生日を設定すると、食材ごとの月齢に応じた推奨/非推奨/禁止の目安が表示されます。
      </p>

      <label className={styles.field}>
        2食目 開始日
        <input
          type="date"
          value={schedule.secondMealStartDate ?? ''}
          onChange={(e) =>
            setMealCountSchedule({ ...schedule, secondMealStartDate: e.target.value || undefined })
          }
        />
      </label>
      <label className={styles.field}>
        3食目 開始日
        <input
          type="date"
          value={schedule.thirdMealStartDate ?? ''}
          onChange={(e) =>
            setMealCountSchedule({ ...schedule, thirdMealStartDate: e.target.value || undefined })
          }
        />
      </label>
      <p className={styles.hint}>
        2食目・3食目の開始日を設定すると、その日以降は自動的に該当する食事数が表示されます。
      </p>
      {scheduleInvalid && (
        <p className={styles.hint}>
          3食目の開始日は2食目の開始日以降の日付にしてください。
        </p>
      )}
    </div>
  );
}
