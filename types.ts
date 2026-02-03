
export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  MODULE_TOPICS = 'MODULE_TOPICS',
  TOPIC_SUBTOPICS = 'TOPIC_SUBTOPICS',
  QUIZ = 'QUIZ',
  PERFORMANCE = 'PERFORMANCE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  // Admin Views
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_QUESTIONS = 'ADMIN_QUESTIONS',
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_COMMENTS = 'ADMIN_COMMENTS',
  ADMIN_PLANS = 'ADMIN_PLANS',
  ADMIN_PAYMENTS = 'ADMIN_PAYMENTS',
  ADMIN_NEWS = 'ADMIN_NEWS',
  ADMIN_FINANCES = 'ADMIN_FINANCES' // New View
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  affiliation?: string; // University/Faculty
  createdAt?: string;
  isActive?: boolean; 
  planId?: number;    
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

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  questionCount?: number; // Optional count for UI
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

// Helper type for the JSON stored in Plan description
export interface PlanFeature {
  name: string;    // e.g. "Simulados Pre Parcial"
  included: boolean; // true = Green Check, false = Red Cross
}

// Matches database table "Plans"
export interface Plan {
  id: string;      // mapped from id_Plan
  name: string;    // mapped from nombre
  price: number;   // mapped from precio
  description: string; // mapped from descripcion (Now stores JSON string of PlanFeature[])
  type: string;    // mapped from tipo_plan
  createdAt?: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  planId: string;
  planName?: string;
  planPrice?: number; // The default price of the plan
  finalPrice?: number; // The ACTUAL amount paid (can be 0 for scholarships)
  notes?: string; // e.g. "Aval Cursillo"
  proofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // 'Admin 1' | 'Admin 2' or specific names
  date: string;
  category?: string;
  type?: 'income' | 'expense' | 'withdrawal'; // Added 'withdrawal'
}

export interface BankDetails {
  bankName: string;    // Método / Banco (ej. "PIX", "Transferencia")
  accountName: string; // Titular (ej. "Juan Perez")
  alias: string;       // El dato clave (ej. Email, Teléfono, CVU)
  pixKey?: string;     // Clave PIX Opcional
}

export interface UserStats {
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  streakDays: number;
}

export interface NewsPost {
  id: string;
  title: string; // e.g., "Ingresó en UNA 2024"
  studentName: string;
  message: string;
  imageUrl: string;
  date: string;
}