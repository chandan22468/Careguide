import { apiClient, getStoredBackendMode } from "./api.ts";
import {
  Routine,
  RoutineSummary,
  CreateRoutinePayload,
  UpdateRoutinePayload,
} from "../types/routine.ts";
import { mockStorage } from "./backendMockFallback.ts";

export const routineService = {
  async getRoutines(sessionId: string): Promise<Routine[]> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return mockStorage.getRoutines(sessionId);
    }

    try {
      const response = await apiClient.get<Routine[]>("/routines", {
        params: { sessionId },
      });
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      return mockStorage.getRoutines(sessionId);
    }
  },

  async createRoutine(payload: CreateRoutinePayload): Promise<Routine> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const routines = mockStorage.getRoutines(payload.sessionId);
      const newRoutine: Routine = {
        id: `rt-${Date.now()}`,
        sessionId: payload.sessionId,
        activityName: payload.activityName,
        productId: payload.productId,
        productName: payload.productName,
        category: payload.category || "Hair",
        timeOfDay: payload.timeOfDay || "Morning",
        instructions: payload.instructions || "",
        scheduledDate: payload.scheduledDate || new Date().toISOString().split("T")[0],
        status: "pending",
        notes: payload.notes || "",
      };
      routines.push(newRoutine);
      mockStorage.saveRoutines(payload.sessionId, routines);
      return newRoutine;
    }

    try {
      const response = await apiClient.post<Routine>("/routines", payload);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const routines = mockStorage.getRoutines(payload.sessionId);
      const newRoutine: Routine = {
        id: `rt-${Date.now()}`,
        sessionId: payload.sessionId,
        activityName: payload.activityName,
        productId: payload.productId,
        productName: payload.productName,
        category: payload.category || "Hair",
        timeOfDay: payload.timeOfDay || "Morning",
        instructions: payload.instructions || "",
        scheduledDate: payload.scheduledDate || new Date().toISOString().split("T")[0],
        status: "pending",
        notes: payload.notes || "",
      };
      routines.push(newRoutine);
      mockStorage.saveRoutines(payload.sessionId, routines);
      return newRoutine;
    }
  },

  async updateRoutine(
    id: string,
    sessionId: string,
    updates: UpdateRoutinePayload
  ): Promise<Routine> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const routines = mockStorage.getRoutines(sessionId);
      const index = routines.findIndex((r) => r.id === id);
      if (index === -1) throw new Error("Routine not found");
      const updated: Routine = {
        ...routines[index],
        ...updates,
        completedAt:
          updates.status === "completed"
            ? new Date().toISOString()
            : routines[index].completedAt,
      };
      routines[index] = updated;
      mockStorage.saveRoutines(sessionId, routines);
      return updated;
    }

    try {
      const response = await apiClient.patch<Routine>(`/routines/${id}`, updates);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const routines = mockStorage.getRoutines(sessionId);
      const index = routines.findIndex((r) => r.id === id);
      if (index !== -1) {
        const updated: Routine = {
          ...routines[index],
          ...updates,
          completedAt:
            updates.status === "completed"
              ? new Date().toISOString()
              : routines[index].completedAt,
        };
        routines[index] = updated;
        mockStorage.saveRoutines(sessionId, routines);
        return updated;
      }
      throw error;
    }
  },

  async deleteRoutine(id: string, sessionId: string): Promise<void> {
    const mode = getStoredBackendMode();
    if (mode !== "force_demo") {
      try {
        await apiClient.delete(`/routines/${id}`);
      } catch (err) {
        if (mode === "force_live") throw err;
      }
    }
    const routines = mockStorage.getRoutines(sessionId);
    const filtered = routines.filter((r) => r.id !== id);
    mockStorage.saveRoutines(sessionId, filtered);
  },

  async getRoutineSummary(sessionId: string): Promise<RoutineSummary> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return this.computeLocalSummary(sessionId);
    }

    try {
      const response = await apiClient.get<RoutineSummary>("/routines/summary", {
        params: { sessionId },
      });
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      return this.computeLocalSummary(sessionId);
    }
  },

  computeLocalSummary(sessionId: string): RoutineSummary {
    const routines = mockStorage.getRoutines(sessionId);
    const total = routines.length;
    const completed = routines.filter((r) => r.status === "completed").length;
    const skipped = routines.filter((r) => r.status === "skipped").length;
    const pending = routines.filter((r) => r.status === "pending").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      completed,
      pending,
      skipped,
      completionRate,
    };
  },
};
