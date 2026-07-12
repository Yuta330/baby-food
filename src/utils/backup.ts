import type { AppData } from '../types';
import { toDateKey } from './date';

export interface AppDataFile {
  schemaVersion: number;
  exportedAt: string;
  data: AppData;
}

const CURRENT_SCHEMA_VERSION = 2;

export function createBackupFile(data: AppData): AppDataFile {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function parseBackupFile(raw: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('JSONとして読み込めませんでした。');
  }

  const data = (parsed as Partial<AppDataFile> | undefined)?.data;
  if (!data || !Array.isArray(data.ingredients) || !Array.isArray(data.weekPlans)) {
    throw new Error('バックアップファイルの形式が正しくありません。');
  }

  return data;
}

export function buildBackupFilename(date: Date): string {
  return `baby-food-backup-${toDateKey(date)}.json`;
}
