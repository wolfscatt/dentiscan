import AsyncStorage from '@react-native-async-storage/async-storage';

interface AnalyticsState {
  totalAnalyses: number;
  lastAnalysisAt: string | null;
}

const ANALYTICS_KEY = 'dentiscan_analytics_v1';

async function readAnalytics(): Promise<AnalyticsState> {
  const raw = await AsyncStorage.getItem(ANALYTICS_KEY);
  if (!raw) {
    return {
      totalAnalyses: 0,
      lastAnalysisAt: null,
    };
  }
  try {
    return JSON.parse(raw) as AnalyticsState;
  } catch {
    return {
      totalAnalyses: 0,
      lastAnalysisAt: null,
    };
  }
}

export async function incrementAnalysisCount(): Promise<void> {
  const current = await readAnalytics();
  const next: AnalyticsState = {
    totalAnalyses: current.totalAnalyses + 1,
    lastAnalysisAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(next));
}

export async function getAnalytics(): Promise<AnalyticsState> {
  return readAnalytics();
}


