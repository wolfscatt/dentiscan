import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report } from '@types/models';

const REPORTS_KEY = 'dentiscan_reports_v1';

async function readReports(): Promise<Report[]> {
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Report[];
  } catch {
    return [];
  }
}

async function writeReports(reports: Report[]): Promise<void> {
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export async function listReportsByPatient(patientId: string): Promise<Report[]> {
  const all = await readReports();
  return all
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createReport(report: Report): Promise<void> {
  const all = await readReports();
  all.push(report);
  await writeReports(all);
}

export async function getReport(id: string): Promise<Report | undefined> {
  const all = await readReports();
  return all.find((r) => r.id === id);
}

export async function updateReport(id: string, patch: Partial<Report>): Promise<Report | undefined> {
  const all = await readReports();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  const updated: Report = { ...all[index], ...patch };
  all[index] = updated;
  await writeReports(all);
  return updated;
}

export async function listSharedReports(): Promise<Report[]> {
  const all = await readReports();
  return all
    .filter((r) => r.sharedWithExpert)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

