
export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  MODULE_TOPICS = 'MODULE_TOPICS',
  QUIZ = 'QUIZ',
  PERFORMANCE = 'PERFORMANCE',
  // Admin Views
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_QUESTIONS = 'ADMIN_QUESTIONS',
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_COMMENTS = 'ADMIN_COMMENTS',
  ADMIN_PLANS = 'ADMIN_PLANS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  affiliation?: string; // University/Faculty
  createdAt?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  progress: number; // 0-100
  topicCount: number;
}

export interface Topic {
  id: string;
  moduleId: string;
  code: string; // e.g., T7, T8
  name: string;
  isLocked: boolean;
}

export interface Question {
  id: string;
  topicId: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanationCorrect: string;   // Explanation when user gets it right
  explanationIncorrect: string; // Explanation when user gets it wrong
  imageUrl?: string; 
}

export interface QuizSession {
  topicId: string;
  currentQuestionIndex: number;
  score: number;
  answers: { [questionId: string]: number }; // map questionId to selected option index
}

// Matches database table "Plans"
export interface Plan {
  id: string;      // mapped from id_Plan
  name: string;    // mapped from nombre
  price: number;   // mapped from precio
  description: string; // mapped from descripcion
  type: string;    // mapped from tipo_plan
  createdAt?: string;
}

export interface UserStats {
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  streakDays: number;
}
