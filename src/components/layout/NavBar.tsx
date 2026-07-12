import styles from './NavBar.module.css';
import type { Tab } from '../../App';
import { BackupControls } from './BackupControls';

const TABS: { key: Tab; label: string }[] = [
  { key: 'planner', label: '週間プランナー' },
  { key: 'ingredients', label: '食材マスタ' },
  { key: 'summary', label: '週間サマリー' },
  { key: 'settings', label: '設定' },
];

interface Props {
  current: Tab;
  onChange: (tab: Tab) => void;
}

export function NavBar({ current, onChange }: Props) {
  return (
    <nav className={styles.nav}>
      <span className={styles.title}>離乳食 週間プランナー</span>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={tab.key === current ? styles.tabActive : styles.tab}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
        <BackupControls />
      </div>
    </nav>
  );
}
