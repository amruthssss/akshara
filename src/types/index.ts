export interface UserProfile {
  uid: string;
  name: string;
  school: string;
  district: string;
  medium: 'Kannada' | 'English';
  examDate: string;
  language: 'Kannada' | 'English';
  avatar?: string;
  createdAt: string;
}

export interface ChapterProgress {
  subject: string;
  chapter: string;
  completionPercent: number;
  lastAttempted: string;
  totalQuizzesTaken: number;
  avgScore: number;
  masteryLevel: 'Beginner' | 'Developing' | 'Proficient' | 'Master';
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'MCQ' | 'SHORT' | 'LONG' | 'FILL';
  options?: string[];
  correctAnswer?: number;
  fillAnswer?: string;
  explanation: string;
  marks: number;
  subject: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  conceptTag: string;
  hint?: string;
  modelAnswer?: string;
  keyPoints?: string[];
}

export interface QuizSession {
  id: string;
  subject: string;
  chapter: string;
  date: string;
  score: number;
  totalQ: number;
  timeTaken: number;
  wrongQuestions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Badge {
  id: string;
  name: string;
  earnedAt: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalDaysActive: number;
}
