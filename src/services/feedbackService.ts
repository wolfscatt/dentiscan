import AsyncStorage from '@react-native-async-storage/async-storage';

const FEEDBACK_KEY = 'dentiscan_feedback_v1';

export interface FeedbackEntry {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

async function readFeedback(): Promise<FeedbackEntry[]> {
  const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FeedbackEntry[];
  } catch {
    return [];
  }
}

async function writeFeedback(entries: FeedbackEntry[]): Promise<void> {
  await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries));
}

export async function submitFeedback(rating: number, comment: string): Promise<void> {
  const all = await readFeedback();
  const entry: FeedbackEntry = {
    id: `${Date.now()}`,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  await writeFeedback(all);
}

export async function listFeedback(): Promise<FeedbackEntry[]> {
  return readFeedback();
}

