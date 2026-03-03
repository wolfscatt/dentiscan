import * as SQLite from 'expo-sqlite';

export type Db = SQLite.SQLiteDatabase;

let dbInstance: Db | null = null;

export function getDb(): Db {
  if (!dbInstance) {
    // SDK 52+ ile birlikte openDatabase yerine openDatabaseSync kullanılmalı
    dbInstance = SQLite.openDatabaseSync('dentiscan.db');
  }
  return dbInstance;
}

export function runMigrations(): Promise<void> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL
          );`,
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY NOT NULL,
            patient_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            image_uri TEXT NOT NULL,
            ai_result_json TEXT NOT NULL,
            anamnesis_json TEXT NOT NULL,
            shared_with_expert INTEGER DEFAULT 0,
            expert_note TEXT
          );`,
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            created_at TEXT NOT NULL
          );`,
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS analytics (
            key TEXT PRIMARY KEY NOT NULL,
            total_analyses INTEGER NOT NULL,
            last_analysis_at TEXT
          );`,
        );
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve();
      },
    );
  });
}

