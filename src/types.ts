export type MoodType = 
  | 'peaceful'
  | 'joyful'
  | 'reflective'
  | 'melancholy'
  | 'anxious'
  | 'energized'
  | 'grateful'
  | 'focused';

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: MoodType;
  tags: string[];
  prompt?: string;
  aiReflection?: string;
  aiThemes?: string[];
  aiActionItems?: string[];
  sentiment?: 'positive' | 'neutral' | 'challenging' | 'mixed';
  wordCount: number;
  isClientEncrypted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  createdAt: string;
  lastLoginAt: string;
  securityPreferences?: {
    allowAiAnalysis: boolean;
    dataRetentionDays?: number;
    showSecurityBadges: boolean;
  };
}

export interface PeriodicInsight {
  id: string;
  userId: string;
  period: string; // e.g. "Past 7 Days", "August 2026"
  summary: string;
  keyThemes: string[];
  growthOpportunities: string[];
  emotionalLandscape: string;
  entryCountAnalyzed: number;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  securityFlag?: 'safe' | 'injection_attempt_neutralized' | 'sanitized';
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAuditResult {
  threat: string;
  attackVector: string;
  securityControl: string;
  verificationMethod: string;
  status: 'passed' | 'warning' | 'info';
  details: string;
}

export interface PromptInjectionTestResult {
  inputPrompt: string;
  sanitizedText: string;
  systemPromptProtected: boolean;
  aiResponse: string;
  verdict: 'neutralized' | 'safe' | 'blocked';
  notes: string;
}
