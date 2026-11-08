import { apiClient, getStoredBackendMode } from "./api.ts";
import { ProgressEntry, CreateProgressPayload } from "../types/progress.ts";
import { mockStorage } from "./backendMockFallback.ts";

export const progressService = {
  async getEntries(sessionId: string): Promise<ProgressEntry[]> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return mockStorage.getProgress(sessionId);
    }

    try {
      const response = await apiClient.get<ProgressEntry[]>("/progress", {
        params: { sessionId },
      });
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      return mockStorage.getProgress(sessionId);
    }
  },

  async getEntryById(id: string, sessionId: string): Promise<ProgressEntry> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const found = mockStorage.getProgress(sessionId).find((e) => e.id === id);
      if (!found) throw new Error("Progress entry not found");
      return found;
    }

    try {
      const response = await apiClient.get<ProgressEntry>(`/progress/${id}`);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const found = mockStorage.getProgress(sessionId).find((e) => e.id === id);
      if (found) return found;
      throw error;
    }
  },

  async createEntry(payload: CreateProgressPayload): Promise<ProgressEntry> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const list = mockStorage.getProgress(payload.sessionId);
      const newEntry: ProgressEntry = {
        id: `prog-${Date.now()}`,
        sessionId: payload.sessionId,
        careType: payload.careType,
        entryDate: payload.entryDate,
        condition: payload.condition,
        observations: payload.observations,
        notes: payload.notes,
        photoUrls: payload.photoUrls || [],
        metrics: {
          scale: payload.scale || 7,
          ratingLabel:
            (payload.scale || 7) >= 8
              ? "Significant improvement"
              : (payload.scale || 7) >= 5
              ? "Gradual progress"
              : "Early phase",
        },
        createdAt: new Date().toISOString(),
      };
      list.unshift(newEntry);
      mockStorage.saveProgress(payload.sessionId, list);
      return newEntry;
    }

    try {
      const response = await apiClient.post<ProgressEntry>("/progress", payload);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const list = mockStorage.getProgress(payload.sessionId);
      const newEntry: ProgressEntry = {
        id: `prog-${Date.now()}`,
        sessionId: payload.sessionId,
        careType: payload.careType,
        entryDate: payload.entryDate,
        condition: payload.condition,
        observations: payload.observations,
        notes: payload.notes,
        photoUrls: payload.photoUrls || [],
        metrics: {
          scale: payload.scale || 7,
          ratingLabel: (payload.scale || 7) >= 8 ? "Significant improvement" : "Gradual progress",
        },
        createdAt: new Date().toISOString(),
      };
      list.unshift(newEntry);
      mockStorage.saveProgress(payload.sessionId, list);
      return newEntry;
    }
  },

  async updateEntry(
    id: string,
    sessionId: string,
    updates: Partial<CreateProgressPayload>
  ): Promise<ProgressEntry> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const list = mockStorage.getProgress(sessionId);
      const index = list.findIndex((e) => e.id === id);
      if (index === -1) throw new Error("Entry not found");
      const updated: ProgressEntry = {
        ...list[index],
        ...updates,
      };
      list[index] = updated;
      mockStorage.saveProgress(sessionId, list);
      return updated;
    }

    try {
      const response = await apiClient.put<ProgressEntry>(`/progress/${id}`, updates);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const list = mockStorage.getProgress(sessionId);
      const index = list.findIndex((e) => e.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updates };
        mockStorage.saveProgress(sessionId, list);
        return list[index];
      }
      throw error;
    }
  },

  async deleteEntry(id: string, sessionId: string): Promise<void> {
    const mode = getStoredBackendMode();
    if (mode !== "force_demo") {
      try {
        await apiClient.delete(`/progress/${id}`);
      } catch (err) {
        if (mode === "force_live") throw err;
      }
    }
    const list = mockStorage.getProgress(sessionId);
    const filtered = list.filter((e) => e.id !== id);
    mockStorage.saveProgress(sessionId, filtered);
  },
};
