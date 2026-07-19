import { GRAM_STEP, MAX_GRAMS, MIN_GRAMS } from '../../types';
import styles from './GramsStepper.module.css';

interface Props {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
}

export function GramsStepper({ value, onChange, placeholder = 'グラム数' }: Props) {
  const handleDecrement = () => {
    if (value === undefined) return;
    onChange(Math.max(MIN_GRAMS, value - GRAM_STEP));
  };

  const handleIncrement = () => {
    onChange(value === undefined ? GRAM_STEP : Math.min(MAX_GRAMS, value + GRAM_STEP));
  };

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value === undefined || value <= MIN_GRAMS}
        aria-label="減らす"
      >
        −
      </button>
      <span className={value === undefined ? styles.placeholder : styles.value}>
        {value !== undefined ? `${value}g` : placeholder}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value !== undefined && value >= MAX_GRAMS}
        aria-label="増やす"
      >
        ＋
      </button>
      {value !== undefined && (
        <button type="button" className={styles.clear} onClick={() => onChange(undefined)} aria-label="クリア">
          ×
        </button>
      )}
    </div>
  );
}
