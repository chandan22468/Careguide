import { apiClient } from "./api.ts";
import { CareSession, SessionUpdatePayload } from "../types/session.ts";

const SESSION_KEY = "careguide_session_id";
const SESSION_DATA_KEY = "careguide_session_data";

export function getOrCreateSessionId(): string {
  return localStorage.getItem(SESSION_KEY) || "";
}

export const sessionService = {
  async getSession(sessionId: string): Promise<CareSession> {
    const response = await apiClient.get<CareSession>(`/session/${sessionId}`);
    const data = response.data;
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(data));
    return data;
  },

  async createSession(sessionId: string, initialData?: SessionUpdatePayload): Promise<CareSession> {
    const payload: CareSession = {
      sessionId,
      selectedCategories: initialData?.selectedCategories || [],
      concerns: initialData?.concerns || [],
      goals: initialData?.goals || [],
      name: initialData?.name || "Care Member",
      onboardingCompleted: initialData?.onboardingCompleted || false,
      createdAt: new Date().toISOString(),
    };

    const response = await apiClient.post<CareSession>("/session", payload);
    const data = response.data;
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(data));
    return data;
  },

  async updateSession(sessionId: string, updates: SessionUpdatePayload): Promise<CareSession> {
    const response = await apiClient.put<CareSession>(`/session/${sessionId}`, updates);
    const data = response.data;
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(data));
    return data;
  },

  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/session/${sessionId}`);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_DATA_KEY);
    localStorage.removeItem(`careguide_mock_mycare_${sessionId}`);
    localStorage.removeItem(`careguide_mock_routines_${sessionId}`);
    localStorage.removeItem(`careguide_mock_progress_${sessionId}`);
    localStorage.removeItem(`careguide_mock_chat_${sessionId}`);
  },

  getLocalSession(sessionId: string): CareSession {
    const raw = localStorage.getItem(SESSION_DATA_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.sessionId === sessionId) return parsed;
      } catch {
        // ignore
      }
    }
    const fresh: CareSession = {
      sessionId,
      selectedCategories: ["Hair", "Skin"],
      concerns: ["Hair fall concerns", "Dandruff concerns"],
      goals: ["Organise my products", "Build a consistent routine"],
      name: "Alex",
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(fresh));
    return fresh;
  },
};
