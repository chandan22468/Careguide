export interface CareSession {
  sessionId: string;
  selectedCategories: string[];
  concerns: string[];
  goals: string[];
  name?: string;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionUpdatePayload {
  selectedCategories?: string[];
  concerns?: string[];
  goals?: string[];
  name?: string;
  onboardingCompleted?: boolean;
}
