export type RoutineStatus = "pending" | "completed" | "skipped";

export interface Routine {
  id: string;
  sessionId: string;
  productId?: string;
  productName?: string;
  activityName: string;
  category?: string;
  timeOfDay?: "Morning" | "Afternoon" | "Evening" | "Night" | string;
  instructions?: string;
  scheduledDate: string; // YYYY-MM-DD
  status: RoutineStatus;
  completedAt?: string;
  notes?: string;
}

export interface RoutineSummary {
  total: number;
  completed: number;
  pending: number;
  skipped: number;
  completionRate: number;
}

export interface CreateRoutinePayload {
  sessionId: string;
  activityName: string;
  productId?: string;
  productName?: string;
  category?: string;
  timeOfDay?: string;
  instructions?: string;
  scheduledDate: string;
  notes?: string;
}

export interface UpdateRoutinePayload {
  activityName?: string;
  productId?: string;
  productName?: string;
  timeOfDay?: string;
  instructions?: string;
  scheduledDate?: string;
  status?: RoutineStatus;
  notes?: string;
}
