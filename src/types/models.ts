export type UserRole = 'patient' | 'expert';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AiFinding {
  title: string;
  confidence: number;
  note: string;
}

export interface AiAnamnesisField {
  value: string | null;
  questions: string[];
}

export interface AiAnamnesis {
  pain: AiAnamnesisField;
  bleeding: AiAnamnesisField;
  duration: AiAnamnesisField;
  medical: AiAnamnesisField;
}

export interface AiResult {
  summary: string;
  riskLevel: RiskLevel;
  findings: AiFinding[];
  recommendations: string[];
  anamnesis: AiAnamnesis;
  disclaimer: string;
}

export interface Report {
  id: string;
  patientId: string;
  createdAt: string;
  imageUri: string;
  aiResult: AiResult;
  anamnesisAnswers: Record<string, string>;
  interpretation?: string;
  sharedWithExpert?: boolean;
  expertNote?: string;
}

export interface Patient {
  id: string;
  name: string;
  age?: number;
  lastReportAt?: string;
}

