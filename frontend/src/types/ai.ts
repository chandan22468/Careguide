export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  message: string;
  sources?: Array<{
    title: string;
    url?: string;
    snippet?: string;
  }>;
  suggestions?: string[];
  context?: {
    productId?: string;
    productName?: string;
  };
  createdAt?: string;
  isError?: boolean;
}

export interface ChatRequestPayload {
  sessionId: string;
  message: string;
  context?: {
    productId?: string;
    productName?: string;
    category?: string;
  };
}

export interface ChatResponsePayload {
  response: string;
  sources?: Array<{
    title: string;
    url?: string;
    snippet?: string;
  }>;
  suggestions?: string[];
}
