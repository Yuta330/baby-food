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
      <button type="button" className={styles.button} onClick={handleDownload}>
        ダウンロード
      </button>
      <button type="button" className={styles.button} onClick={() => fileInputRef.current?.click()}>
        アップロード
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
