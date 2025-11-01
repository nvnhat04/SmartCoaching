// Common types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  weight?: number;
  height?: number;
  bmi?: number;
  goals?: string[];
  fitnessLevel?: "beginner" | "intermediate" | "advanced";
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  duration: number; // in seconds
  caloriesPerMinute: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions: string[];
  targetMuscles: string[];
  equipment: string[];
}

export type ExerciseCategory = "squat" | "pushup" | "plank" | "yoga" | "stretching" | "other";

export interface WorkoutSession {
  id: string;
  userId: string;
  exerciseId: string;
  exercise: Exercise;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  reps: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  caloriesBurned: number;
  videoRecordingUrl?: string;
  poseData: PoseAnalysisResult[];
  createdAt: Date;
}

export interface PoseAnalysisResult {
  timestamp: number;
  score: number;
  feedback: string;
  status: "correct" | "warning" | "error";
  keypoints: Keypoint[];
  angles?: Record<string, number>;
}

export interface Keypoint {
  name: string;
  x: number;
  y: number;
  score: number;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: number; // in days
  difficulty: "beginner" | "intermediate" | "advanced";
  goal: string;
  exercises: PlannedExercise[];
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface PlannedExercise {
  day: number;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  restTime: number; // in seconds
  notes?: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  type: "exercise" | "plan" | "tip";
  title: string;
  description: string;
  data: any;
  confidence: number;
  createdAt: Date;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalSessions: number;
  totalDuration: number;
  totalCalories: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: WeeklyProgress[];
}

export interface WeeklyProgress {
  date: string;
  sessions: number;
  duration: number;
  calories: number;
  averageScore: number;
}
