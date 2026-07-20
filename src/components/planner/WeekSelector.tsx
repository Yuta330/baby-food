import { addDays } from '../../utils/date';
import { formatWeekRange } from '../../utils/date';
import styles from './WeekSelector.module.css';

interface Props {
  weekStartDate: string;
  onChange: (weekStartDate: string) => void;
  todayWeekStart: string;
  onCopyPreviousWeek?: () => void;
  canCopyPreviousWeek?: boolean;
}

export function WeekSelector({
  weekStartDate,
  onChange,
  todayWeekStart,
  onCopyPreviousWeek,
  canCopyPreviousWeek,
}: Props) {
  const isCurrentWeek = weekStartDate === todayWeekStart;

  return (
    <div className={styles.selector}>
      <button type="button" onClick={() => onChange(addDays(weekStartDate, -7))}>
        ← 前週
      </button>
      <span className={styles.range}>{formatWeekRange(weekStartDate)}</span>
      <button type="button" onClick={() => onChange(addDays(weekStartDate, 7))}>
        翌週 →
      </button>
      <button type="button" disabled={isCurrentWeek} onClick={() => onChange(todayWeekStart)}>
        今日に戻る
      </button>
      {onCopyPreviousWeek && (
        <button
          type="button"
          className={styles.copyButton}
          disabled={!canCopyPreviousWeek}
          onClick={onCopyPreviousWeek}
        >
          先週の内容をコピー
        </button>
      )}
    </div>
  );
}
