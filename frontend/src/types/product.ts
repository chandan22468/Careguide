export type CareCategory = "hair" | "beard" | "skin" | "wellness" | "other";

export interface Product {
  id: string;
  name: string;
  slug?: string;
  category: "Hair" | "Beard" | "Skin" | "Wellness" | "Other" | string;
  description: string;
  shortDescription?: string;
  imageUrl?: string;
  additionalImages?: string[];
  price?: number;
  originalPrice?: number;
  rating?: number;
  ratingCount?: number;
  ingredients: string[];
  benefits: string[];
  usageInstructions?: string;
  precautions?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  isActive: boolean;
  inStock?: boolean;
  tag?: string;
}

export interface MyCareProduct {
  id: string;
  sessionId: string;
  productId: string;
  product?: Product;
  status: "active" | "paused" | "discontinued";
  startDate: string;
  personalNotes?: string;
  dosageSchedule?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddMyCarePayload {
  sessionId: string;
  productId: string;
  status?: "active" | "paused" | "discontinued";
  personalNotes?: string;
  dosageSchedule?: string;
}

export interface UpdateMyCarePayload {
  status?: "active" | "paused" | "discontinued";
  personalNotes?: string;
  dosageSchedule?: string;
}
