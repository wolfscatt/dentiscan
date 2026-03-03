import * as SQLite from 'expo-sqlite';

export type Db = SQLite.SQLiteDatabase;

let dbInstance: Db | null = null;

export function getDb(): Db {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('dentiscan.db');
  }
  return dbInstance;
}

/**
 * Uygulama ilk açıldığında çalışır.
 * Tüm tablolar yoksa oluşturulur (idempotent).
 */
export async function runMigrations(): Promise<void> {
  const db = getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY NOT NULL,
      role       TEXT NOT NULL,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id                 TEXT PRIMARY KEY NOT NULL,
      patient_id         TEXT NOT NULL,
      created_at         TEXT NOT NULL,
      image_uri          TEXT NOT NULL,
      ai_result_json     TEXT NOT NULL,
      anamnesis_json     TEXT NOT NULL,
      interpretation     TEXT,
      shared_with_expert INTEGER NOT NULL DEFAULT 0,
      expert_note        TEXT,
      FOREIGN KEY (patient_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS analytics (
      key               TEXT PRIMARY KEY NOT NULL,
      total_analyses    INTEGER NOT NULL DEFAULT 0,
      last_analysis_at  TEXT
    );
  `);
}

