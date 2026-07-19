import styles from './EntryChip.module.css';

interface Props {
  name: string;
  isFirstThisWeek: boolean;
}

export function IngredientNameLabel({ name, isFirstThisWeek }: Props) {
  return (
    <span className={isFirstThisWeek ? styles.firstName : undefined}>
      {isFirstThisWeek && <span className={styles.srOnly}>はじめて </span>}
      {name}
    </span>
  );
}
