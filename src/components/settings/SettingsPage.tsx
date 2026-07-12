import { useAppData } from '../../context/AppDataContext';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { data, setBabyBirthday } = useAppData();

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
    </div>
  );
}
