import { addDays } from '../../utils/date';
import { formatWeekRange } from '../../utils/date';
import styles from './WeekSelector.module.css';

interface Props {
  weekStartDate: string;
  onChange: (weekStartDate: string) => void;
}

export function WeekSelector({ weekStartDate, onChange }: Props) {
  return (
    <div className={styles.selector}>
      <button type="button" onClick={() => onChange(addDays(weekStartDate, -7))}>
        ← 前週
      </button>
      <span className={styles.range}>{formatWeekRange(weekStartDate)}</span>
      <button type="button" onClick={() => onChange(addDays(weekStartDate, 7))}>
        翌週 →
      </button>
    </div>
  );
}
