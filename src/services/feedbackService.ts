import { getDb } from '@services/db';

export interface FeedbackEntry {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function submitFeedback(rating: number, comment: string): Promise<void> {
  const db = getDb();
  const entry: FeedbackEntry = {
    id: `${Date.now()}`,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO feedback (id, rating, comment, created_at) VALUES (?, ?, ?, ?);`,
        [entry.id, entry.rating, entry.comment, entry.createdAt],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

export async function listFeedback(): Promise<FeedbackEntry[]> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.readTransaction((tx) => {
      tx.executeSql(
        `SELECT * FROM feedback ORDER BY created_at DESC`,
        [],
        (_, result) => {
          const items: FeedbackEntry[] = [];
          for (let i = 0; i < result.rows.length; i += 1) {
            const row = result.rows.item(i);
            items.push({
              id: row.id,
              rating: row.rating,
              comment: row.comment,
              createdAt: row.created_at,
            });
          }
          resolve(items);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

