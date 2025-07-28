export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  resume?: string;
  createdAt: Date;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'basic' | 'plus' | 'advanced';
  credits: number;
  expiresAt?: Date;
  isActive: boolean;
}

export interface InterviewSession {
  id: string;
  userId: string;
  title: string;
  status: 'waiting' | 'active' | 'completed' | 'paused';
  startTime?: Date;
  endTime?: Date;
  duration: number;
  platform: Platform;
  language: string;
  transcript: TranscriptEntry[];
  responses: AIResponse[];
  summary?: SessionSummary;
  creditsUsed: number;
}

export interface TranscriptEntry {
  id: string;
  timestamp: Date;
  speaker: 'interviewer' | 'candidate' | 'system';
  text: string;
  confidence?: number;
}

export interface AIResponse {
  id: string;
  timestamp: Date;
  question: string;
  answer: string;
  model: 'gpt-4' | 'claude-3.5' | 'gpt-3.5-turbo';
  confidence: number;
  categories: string[];
  isUsed: boolean;
}

export interface SessionSummary {
  totalQuestions: number;
  responseTime: number;
  confidence: number;
  strengths: string[];
  improvements: string[];
  overallScore: number;
  recommendations: string[];
}

export interface Platform {
  name: 'zoom' | 'teams' | 'meet' | 'webex' | 'phone' | 'hackerrank' | 'leetcode';
  displayName: string;
  icon: string;
  requiresScreenShare?: boolean;
  supportsCoding?: boolean;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  solution: string;
  explanation: string;
  hints: string[];
}

export interface AudioSettings {
  inputDevice?: string;
  outputDevice?: string;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

export interface AppSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  aiModel: 'gpt-4' | 'claude-3.5';
  audioSettings: AudioSettings;
  privacyMode: boolean;
  autoResponse: boolean;
  responseDelay: number;
}
