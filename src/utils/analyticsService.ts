import { getDb } from '@services/db';

interface AnalyticsState {
  totalAnalyses: number;
  lastAnalysisAt: string | null;
}

async function readAnalytics(): Promise<AnalyticsState> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.readTransaction((tx) => {
      tx.executeSql(
        `SELECT * FROM analytics WHERE key = ? LIMIT 1`,
        ['global'],
        (_, result) => {
          if (result.rows.length === 0) {
            resolve({
              totalAnalyses: 0,
              lastAnalysisAt: null,
            });
          } else {
            const row = result.rows.item(0);
            resolve({
              totalAnalyses: row.total_analyses,
              lastAnalysisAt: row.last_analysis_at,
            });
          }
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

export async function incrementAnalysisCount(): Promise<void> {
  const current = await readAnalytics();
  const next: AnalyticsState = {
    totalAnalyses: current.totalAnalyses + 1,
    lastAnalysisAt: new Date().toISOString(),
  };

  const db = getDb();

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO analytics (key, total_analyses, last_analysis_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET 
           total_analyses = excluded.total_analyses,
           last_analysis_at = excluded.last_analysis_at;`,
        ['global', next.totalAnalyses, next.lastAnalysisAt],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

export async function getAnalytics(): Promise<AnalyticsState> {
  return readAnalytics();
}

