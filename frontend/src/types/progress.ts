export type ProgressCareType = "Hair" | "Beard" | "Skin" | "Wellness" | "Other";

export interface ProgressEntry {
  id: string;
  sessionId: string;
  careType: ProgressCareType;
  entryDate: string; // YYYY-MM-DD
  condition?: string; // e.g. "Less hair shed", "Beard softer", "Mild dryness"
  observations: string;
  notes?: string;
  photoUrls: string[];
  photoFileIds?: string[];
  metrics?: {
    scale?: number; // 1-10 self-rated score
    ratingLabel?: string;
  };
  createdAt?: string;
}

export interface CreateProgressPayload {
  sessionId: string;
  careType: ProgressCareType;
  entryDate: string;
  condition?: string;
  observations: string;
  notes?: string;
  photoUrls?: string[];
  photoFileIds?: string[];
  scale?: number;
}
