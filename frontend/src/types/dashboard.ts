import { Product, MyCareProduct } from "./product.ts";
import { Routine } from "./routine.ts";
import { ProgressEntry } from "./progress.ts";

export interface DashboardData {
  stats: {
    activeProductsCount: number;
    todayRoutinesTotal: number;
    todayRoutinesCompleted: number;
    progressEntriesCount: number;
    streakDays: number;
  };
  todayRoutines: Routine[];
  myCarePreview: Array<MyCareProduct & { product?: Product }>;
  recentProgress: ProgressEntry[];
}

export interface DashboardAnalytics {
  completionRateTrend: Array<{
    date: string;
    completed: number;
    total: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  progressObservationsTrend: Array<{
    date: string;
    score: number;
    label: string;
  }>;
}
