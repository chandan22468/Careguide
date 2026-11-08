import { apiClient, getStoredBackendMode } from "./api.ts";
import {
  ChatMessage,
  ChatRequestPayload,
  ChatResponsePayload,
} from "../types/ai.ts";
import { mockStorage } from "./backendMockFallback.ts";

export const aiService = {
  async sendMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return this.simulateAIResponse(payload);
    }

    try {
      const response = await apiClient.post<ChatResponsePayload>("/ai/chat", payload, {
        timeout: 60000,
      });
      // Save to local message history for resilience
      const history = mockStorage.getChatHistory(payload.sessionId);
      history.push(
        {
          id: `msg-u-${Date.now()}`,
          role: "user",
          message: payload.message,
          context: payload.context,
          createdAt: new Date().toISOString(),
        },
        {
          id: `msg-a-${Date.now()}`,
          role: "assistant",
          message: response.data.response,
          sources: response.data.sources,
          suggestions: response.data.suggestions,
          createdAt: new Date().toISOString(),
        }
      );
      mockStorage.saveChatHistory(payload.sessionId, history);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      return this.simulateAIResponse(payload);
    }
  },

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return mockStorage.getChatHistory(sessionId);
    }

    try {
      const response = await apiClient.get<ChatMessage[]>("/ai/history", {
        params: { sessionId },
      });
      if (Array.isArray(response.data)) {
        mockStorage.saveChatHistory(sessionId, response.data);
        return response.data;
      }
      return mockStorage.getChatHistory(sessionId);
    } catch (error) {
      if (mode === "force_live") throw error;
      return mockStorage.getChatHistory(sessionId);
    }
  },

  async clearChatHistory(sessionId: string): Promise<void> {
    const mode = getStoredBackendMode();
    if (mode !== "force_demo") {
      try {
        await apiClient.delete("/ai/history", { params: { sessionId } });
      } catch (err) {
        if (mode === "force_live") throw err;
      }
    }
    const welcome: ChatMessage[] = [
      {
        id: "msg-fresh",
        role: "assistant",
        message:
          "Conversation cleared. How can I assist with your personal care routine today?",
        suggestions: [
          "Explain the ingredients in my product",
          "How do I structure my daily routine?",
          "Compare Anti-Dandruff Shampoo vs Normal Shampoo",
          "What precautions are listed for Beardmax?",
        ],
        createdAt: new Date().toISOString(),
      },
    ];
    mockStorage.saveChatHistory(sessionId, welcome);
  },

  async getSuggestions(): Promise<string[]> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return [
        "What are the key ingredients in the Stage 1 Kit?",
        "When is the best time to apply Hair Serum?",
        "How do I avoid flaky scalp and dandruff?",
        "Can I use Biotin gummies along with topical hair serum?",
      ];
    }
    try {
      const response = await apiClient.get<string[]>("/ai/suggestions");
      return response.data;
    } catch {
      return [
        "What are the key ingredients in the Stage 1 Kit?",
        "When is the best time to apply Hair Serum?",
        "How do I avoid flaky scalp and dandruff?",
        "Can I use Biotin gummies along with topical hair serum?",
      ];
    }
  },

  simulateAIResponse(payload: ChatRequestPayload): ChatResponsePayload {
    const q = payload.message.toLowerCase();
    const history = mockStorage.getChatHistory(payload.sessionId);
    let reply = "";
    let sources: Array<{ title: string; snippet?: string }> = [];
    let suggestions: string[] = [];

    if (q.includes("redensyl") || q.includes("hair serum")) {
      reply =
        "### Redensyl Follicle Activation\n\n**Redensyl (3%)** is a patented synergistic active composed of DHQG and EGCG2 that specifically targets hair follicle stem cells (Outer Root Sheath):\n\n- **Reactivates dormant stem cells** to transition them from the telogen (resting) into the anagen (growth) phase.\n- **Increases nutrient microcirculation** around dermal papilla cells.\n- **Clinically documented**: Shown to stimulate up to 214% more hair follicle growth compared to untreated fibers.\n\n**Usage note:** Best applied to a clean, dry scalp at bedtime without immediate rinsing.";
      sources = [
        {
          title: "Man Matters Clinical Formulation Data: Redensyl 3%",
          snippet: "Concentration guidelines & dermal tolerance profile.",
        },
      ];
      suggestions = [
        "What precautions should I take with this serum?",
        "Can I apply oil after using Redensyl?",
      ];
    } else if (q.includes("stage 1") || q.includes("kit")) {
      reply =
        "### Stage 1 Anti-Hairfall Kit Instructions\n\nHere is how to optimize your application for early hair thinning:\n\n1. **Scalp Cleansing**: Wash your scalp 2-3 times weekly with a sulfate-free shampoo to eliminate sebum buildup.\n2. **Tonic Application**: Measure exactly 1ml of the tonic using the dropper.\n3. **Targeted Dispersion**: Apply drop-by-drop over visible thinning areas (temples and crown).\n4. **Gentle Absorption**: Massage in circular motions for 2 minutes. Do not vigorously rub.\n\n*Consistency is key: Daily application for 60 to 90 days produces optimal strand fortification.*";
      sources = [
        {
          title: "Product Guidelines: Stage 1 Anti-Hairfall Kit",
          snippet: "Dermatologist-approved routine flow and dosage.",
        },
      ];
      suggestions = [
        "What are the DHT blocker ingredients in this kit?",
        "How does it compare to Advance Hair Serum?",
      ];
    } else if (q.includes("compare") || q.includes("difference")) {
      reply =
        "### Product Comparison Overview\n\n- **Anti-Dandruff Shampoo**: Formulated with 1% Ketoconazole specifically to eliminate Malassezia yeast and stubborn flakes while calming scalp inflammation.\n- **Daily Hair Tonic / Serum**: Focuses on follicle activation, DHT inhibition, and hair shaft density.\n\n**Best practice:** Use the Anti-Dandruff Shampoo to keep your scalp clean and flake-free so active serums can penetrate deeply into hair roots.";
      suggestions = [
        "Add Anti-Dandruff Shampoo to My Care",
        "How frequently should I use the shampoo?",
      ];
    } else if (q.includes("routine") || q.includes("morning") || q.includes("night")) {
      reply =
        "### Recommended Routine Structure\n\n**Morning (Protection & Hydration):**\n- Gentle face and hair rinse.\n- Apply Hydra-Boost Oil-Free Skin Gel onto clean skin.\n- Chew 1 Biotin Hair Gummy with your breakfast.\n\n**Night (Follicle Nourishment & Repair):**\n- Apply 1ml of Hair Tonic or Beardmax Growth Serum onto clean target areas.\n- Take 1 capsule of Ashwagandha with water to lower evening stress and aid restorative sleep.";
      suggestions = [
        "Add this to my Routine Manager",
        "What are the benefits of Ashwagandha?",
      ];
    } else {
      reply =
        `Thank you for asking about **${payload.context?.productName || "your personal care"}**.\n\nCareGuide helps you keep track of ingredients, correct dosage, and consistent schedules across Hair, Beard, Skin, and Wellness categories.\n\n- **Ingredients:** We only present dermatologist-tested ingredients like Saw Palmetto, Redensyl, Procapil, and Ketoconazole.\n- **Safety:** Always conduct a 24-hour patch test before new topical products.\n\nFeel free to ask about any specific product, instructions, or ingredients in your routine!`;
      suggestions = [
        "Explain the ingredients in my active products",
        "How do I structure my daily routine?",
        "When can I expect visible results?",
      ];
    }

    const res: ChatResponsePayload = {
      response: reply,
      sources,
      suggestions,
    };

    // Save to chat history
    history.push(
      {
        id: `msg-u-${Date.now()}`,
        role: "user",
        message: payload.message,
        context: payload.context,
        createdAt: new Date().toISOString(),
      },
      {
        id: `msg-a-${Date.now()}`,
        role: "assistant",
        message: reply,
        sources,
        suggestions,
        createdAt: new Date().toISOString(),
      }
    );
    mockStorage.saveChatHistory(payload.sessionId, history);

    return res;
  },
};
