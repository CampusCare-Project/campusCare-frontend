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

export type OfflineReportPayload = CreateReportPayload & {
  categoryName?: string;
  buildingName?: string;
  roomName?: string;
  roomCode?: string;
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

  CREATE TABLE IF NOT EXISTS local_categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    rawJson TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS local_buildings (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    rawJson TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS local_rooms (
    id TEXT PRIMARY KEY NOT NULL,
    buildingId TEXT,
    name TEXT NOT NULL,
    rawJson TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
  `);
}

export async function cacheCategories(items: any[]) {
  const db = await getDb();

  for (const item of items) {
    await db.runAsync(
      `INSERT OR REPLACE INTO local_categories 
       (id, name, rawJson, updatedAt) 
       VALUES (?, ?, ?, ?)`,
      [
        item.id,
        item.name || item.code || item.id,
        JSON.stringify(item),
        new Date().toISOString(),
      ]
    );
  }
}

export async function cacheBuildings(items: any[]) {
  const db = await getDb();

  for (const item of items) {
    await db.runAsync(
      `INSERT OR REPLACE INTO local_buildings 
       (id, name, rawJson, updatedAt) 
       VALUES (?, ?, ?, ?)`,
      [
        item.id,
        item.name || item.code || item.id,
        JSON.stringify(item),
        new Date().toISOString(),
      ]
    );
  }
}

export async function cacheRooms(items: any[]) {
  const db = await getDb();

  for (const item of items) {
    await db.runAsync(
      `INSERT OR REPLACE INTO local_rooms 
       (id, buildingId, name, rawJson, updatedAt) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        item.id,
        item.buildingId || item.building?.id || null,
        item.name || item.code || item.id,
        JSON.stringify(item),
        new Date().toISOString(),
      ]
    );
  }
}

export async function listCachedCategories() {
  const db = await getDb();

  const rows = await db.getAllAsync<{ rawJson: string }>(
    `SELECT rawJson FROM local_categories ORDER BY name ASC`
  );

  return rows.map((row) => JSON.parse(row.rawJson));
}

export async function listCachedBuildings() {
  const db = await getDb();

  const rows = await db.getAllAsync<{ rawJson: string }>(
    `SELECT rawJson FROM local_buildings ORDER BY name ASC`
  );

  return rows.map((row) => JSON.parse(row.rawJson));
}

export async function listCachedRooms() {
  const db = await getDb();

  const rows = await db.getAllAsync<{ rawJson: string }>(
    `SELECT rawJson FROM local_rooms ORDER BY name ASC`
  );

  return rows.map((row) => JSON.parse(row.rawJson));
}

export async function saveLocalReport(
   payload: OfflineReportPayload,
  mediaUri?: string | null
) {
  const db = await getDb();
  const id = payload.clientLocalId || `local-${Date.now()}`;

  await db.runAsync(
    `INSERT OR REPLACE INTO local_reports 
     (id, payload, mediaUri, createdAt, status) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      id,
      JSON.stringify({
        ...payload,
        clientLocalId: id,
      }),
      mediaUri ?? null,
      new Date().toISOString(),
      "PENDING",
    ]
  );

  return id;
}

export async function listLocalReports() {
  const db = await getDb();
  return db.getAllAsync<LocalReportRow>(`SELECT * FROM local_reports WHERE status != 'SYNCED' ORDER BY createdAt DESC`);
}

export async function markLocalReportSynced(id: string) {
  const db = await getDb();

  await db.runAsync(
    `UPDATE local_reports SET status = 'SYNCED', syncedAt = ? WHERE id = ?`,
    [new Date().toISOString(), id]
  );
}

export async function markLocalReportFailed(id: string, message: string) {
  const db = await getDb();

  await db.runAsync(
    `UPDATE local_reports SET status = 'FAILED', errorMessage = ? WHERE id = ?`,
    [message, id]
  );
}

export async function markLocalReportPending(id: string) {
  const db = await getDb();

  await db.runAsync(
    `UPDATE local_reports 
     SET status = 'PENDING', errorMessage = NULL 
     WHERE id = ?`,
    [id]
  );
}

export async function deleteLocalReport(id: string) {
  const db = await getDb();

  await db.runAsync(
    `DELETE FROM local_reports WHERE id = ?`,
    [id]
  );
}