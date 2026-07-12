import { useRef } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { buildBackupFilename, createBackupFile, parseBackupFile } from '../../utils/backup';
import styles from './BackupControls.module.css';

export function BackupControls() {
  const { data, replaceAllData } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    const file = createBackupFile(data);
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildBackupFilename(new Date());
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const imported = parseBackupFile(await file.text());
      if (window.confirm('現在のデータを上書きします。よろしいですか?')) {
        replaceAllData(imported);
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'ファイルの読み込みに失敗しました。');
    }
  };

  return (
    <div className={styles.controls}>
      <button type="button" className={styles.button} aria-label="ダウンロード" title="ダウンロード" onClick={handleDownload}>
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.button}
        aria-label="アップロード"
        title="アップロード"
        onClick={() => fileInputRef.current?.click()}
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className={styles.hiddenInput}
        onChange={handleFileSelected}
      />
    </div>
  );
}
