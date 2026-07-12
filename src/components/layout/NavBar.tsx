import styles from './NavBar.module.css';
import type { Tab } from '../../App';
import { BackupControls } from './BackupControls';

const TABS: { key: Tab; label: string }[] = [
  { key: 'planner', label: '週間プランナー' },
  { key: 'ingredients', label: '食材マスタ' },
  { key: 'summary', label: '週間サマリー' },
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
        <button
          type="button"
          aria-label="設定"
          title="設定"
          className={current === 'settings' ? styles.tabActive : styles.tab}
          onClick={() => onChange('settings')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <BackupControls />
      </div>
    </nav>
  );
}
