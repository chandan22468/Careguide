import { apiClient, getStoredBackendMode } from "./api.ts";
import { DashboardData, DashboardAnalytics } from "../types/dashboard.ts";
import { mockStorage } from "./backendMockFallback.ts";

export const dashboardService = {
  async getDashboardData(sessionId: string): Promise<DashboardData> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return this.computeLocalDashboard(sessionId);
    }

    try {
      const response = await apiClient.get<DashboardData>("/dashboard", {
        params: { sessionId },
      });
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      return this.computeLocalDashboard(sessionId);
    }
  },

  async getAnalytics(sessionId: string): Promise<DashboardAnalytics> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return this.computeLocalAnalytics(sessionId);
    }

    try {
      const response = await apiClient.get<DashboardAnalytics>("/dashboard/analytics", {
        params: { sessionId },
      });
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      return this.computeLocalAnalytics(sessionId);
    }
  },

  computeLocalDashboard(sessionId: string): DashboardData {
    const myProducts = mockStorage.getMyCare(sessionId);
    const activeProducts = myProducts.filter((p) => p.status === "active");
    const routines = mockStorage.getRoutines(sessionId);
    const completedRoutines = routines.filter((r) => r.status === "completed");
    const progressList = mockStorage.getProgress(sessionId);

    return {
      stats: {
        activeProductsCount: activeProducts.length,
        todayRoutinesTotal: routines.length,
        todayRoutinesCompleted: completedRoutines.length,
        progressEntriesCount: progressList.length,
        streakDays: completedRoutines.length > 0 ? 5 : 1,
      },
      todayRoutines: routines,
      myCarePreview: myProducts.slice(0, 4),
      recentProgress: progressList.slice(0, 3),
    };
  },

  computeLocalAnalytics(sessionId: string): DashboardAnalytics {
    const progressList = mockStorage.getProgress(sessionId);

    // Distribution by category
    const catMap: Record<string, number> = { Hair: 0, Beard: 0, Skin: 0, Wellness: 0, Other: 0 };
    progressList.forEach((item) => {
      catMap[item.careType] = (catMap[item.careType] || 0) + 1;
    });

    const categoryDistribution = Object.entries(catMap).map(([category, count]) => ({
      category,
      count,
    }));

    return {
      completionRateTrend: [
        { date: "Mon", completed: 3, total: 3 },
        { date: "Tue", completed: 2, total: 3 },
        { date: "Wed", completed: 3, total: 3 },
        { date: "Thu", completed: 1, total: 3 },
        { date: "Fri", completed: 3, total: 3 },
        { date: "Sat", completed: 2, total: 3 },
        { date: "Sun", completed: 3, total: 3 },
      ],
      categoryDistribution,
      progressObservationsTrend: progressList.map((p, idx) => ({
        date: p.entryDate,
        score: p.metrics?.scale || 5 + idx,
        label: p.condition || `Entry #${idx + 1}`,
      })),
    };
  },
};
