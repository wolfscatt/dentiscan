import { Report } from '@types/models';
import { getDb } from '@services/db';

function mapRowToReport(row: any): Report {
  return {
    id: row.id,
    patientId: row.patient_id,
    createdAt: row.created_at,
    imageUri: row.image_uri,
    aiResult: JSON.parse(row.ai_result_json),
    anamnesisAnswers: JSON.parse(row.anamnesis_json),
    sharedWithExpert: row.shared_with_expert === 1,
    expertNote: row.expert_note ?? undefined,
  };
}

export async function listReportsByPatient(patientId: string): Promise<Report[]> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.readTransaction((tx) => {
      tx.executeSql(
        `SELECT * FROM reports WHERE patient_id = ? ORDER BY created_at DESC`,
        [patientId],
        (_, result) => {
          const items = [];
          for (let i = 0; i < result.rows.length; i += 1) {
            items.push(mapRowToReport(result.rows.item(i)));
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

export async function createReport(report: Report): Promise<void> {
  const db = getDb();

  const aiResultJson = JSON.stringify(report.aiResult);
  const anamnesisJson = JSON.stringify(report.anamnesisAnswers);

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO reports 
          (id, patient_id, created_at, image_uri, ai_result_json, anamnesis_json, shared_with_expert, expert_note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          report.id,
          report.patientId,
          report.createdAt,
          report.imageUri,
          aiResultJson,
          anamnesisJson,
          report.sharedWithExpert ? 1 : 0,
          report.expertNote ?? null,
        ],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

export async function getReport(id: string): Promise<Report | undefined> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.readTransaction((tx) => {
      tx.executeSql(
        `SELECT * FROM reports WHERE id = ? LIMIT 1`,
        [id],
        (_, result) => {
          if (result.rows.length === 0) {
            resolve(undefined);
          } else {
            resolve(mapRowToReport(result.rows.item(0)));
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

export async function updateReport(id: string, patch: Partial<Report>): Promise<Report | undefined> {
  const current = await getReport(id);
  if (!current) return undefined;

  const next: Report = { ...current, ...patch };

  const db = getDb();
  const aiResultJson = JSON.stringify(next.aiResult);
  const anamnesisJson = JSON.stringify(next.anamnesisAnswers);

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE reports
         SET patient_id = ?, created_at = ?, image_uri = ?, ai_result_json = ?, anamnesis_json = ?, 
             shared_with_expert = ?, expert_note = ?
         WHERE id = ?;`,
        [
          next.patientId,
          next.createdAt,
          next.imageUri,
          aiResultJson,
          anamnesisJson,
          next.sharedWithExpert ? 1 : 0,
          next.expertNote ?? null,
          next.id,
        ],
        () => resolve(next),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

export async function listSharedReports(): Promise<Report[]> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.readTransaction((tx) => {
      tx.executeSql(
        `SELECT * FROM reports WHERE shared_with_expert = 1 ORDER BY created_at DESC`,
        [],
        (_, result) => {
          const items = [];
          for (let i = 0; i < result.rows.length; i += 1) {
            items.push(mapRowToReport(result.rows.item(i)));
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

