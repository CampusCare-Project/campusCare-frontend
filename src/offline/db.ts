import * as SQLite from 'expo-sqlite';
import type { CreateReportPayload } from '@/api/reports/types';

export type LocalReportRow = {
  id: string;
  payload: string;
  mediaUri?: string | null;
  createdAt: string;
  syncedAt?: string | null;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  errorMessage?: string | null;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('campuscare.db');
  return dbPromise;
}

export async function initDb() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS local_reports (
      id TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      mediaUri TEXT,
      createdAt TEXT NOT NULL,
      syncedAt TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      errorMessage TEXT
    );
  `);
}

export async function saveLocalReport(payload: CreateReportPayload, mediaUri?: string | null) {
  const db = await getDb();
  const id = payload.clientLocalId || `local-${Date.now()}`;
  await db.runAsync(
    `INSERT OR REPLACE INTO local_reports (id, payload, mediaUri, createdAt, status) VALUES (?, ?, ?, ?, ?)`,
    [id, JSON.stringify({ ...payload, clientLocalId: id }), mediaUri ?? null, new Date().toISOString(), 'PENDING']
  );
  return id;
}

export async function listLocalReports() {
  const db = await getDb();
  return db.getAllAsync<LocalReportRow>(`SELECT * FROM local_reports WHERE status != 'SYNCED' ORDER BY createdAt DESC`);
}

export async function markLocalReportSynced(id: string) {
  const db = await getDb();
  await db.runAsync(`UPDATE local_reports SET status = 'SYNCED', syncedAt = ? WHERE id = ?`, [new Date().toISOString(), id]);
}

export async function markLocalReportFailed(id: string, message: string) {
  const db = await getDb();
  await db.runAsync(`UPDATE local_reports SET status = 'FAILED', errorMessage = ? WHERE id = ?`, [message, id]);
}
