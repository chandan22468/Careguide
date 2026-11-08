import { apiClient, getStoredBackendMode } from "./api.ts";
import { FAQItem, SupportTicket, CreateTicketPayload } from "../types/support.ts";
import { INITIAL_FAQS, mockStorage } from "./backendMockFallback.ts";

export const supportService = {
  async getFAQs(): Promise<FAQItem[]> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return INITIAL_FAQS;
    }

    try {
      const response = await apiClient.get<FAQItem[]>("/faqs");
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      return INITIAL_FAQS;
    }
  },

  async getTickets(sessionId: string): Promise<SupportTicket[]> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return mockStorage.getTickets(sessionId);
    }

    try {
      const response = await apiClient.get<SupportTicket[]>("/support/tickets", {
        params: { sessionId },
      });
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      return mockStorage.getTickets(sessionId);
    }
  },

  async createTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const tickets = mockStorage.getTickets(payload.sessionId);
      const newTicket: SupportTicket = {
        id: `tkt-${Date.now()}`,
        ticketId: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
        sessionId: payload.sessionId,
        name: payload.name,
        email: payload.email,
        category: payload.category,
        subject: payload.subject,
        message: payload.message,
        status: "Open",
        createdAt: new Date().toISOString(),
      };
      tickets.unshift(newTicket);
      mockStorage.saveTickets(payload.sessionId, tickets);
      return newTicket;
    }

    try {
      const response = await apiClient.post<SupportTicket>("/support/tickets", payload);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const tickets = mockStorage.getTickets(payload.sessionId);
      const newTicket: SupportTicket = {
        id: `tkt-${Date.now()}`,
        ticketId: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
        sessionId: payload.sessionId,
        name: payload.name,
        email: payload.email,
        category: payload.category,
        subject: payload.subject,
        message: payload.message,
        status: "Open",
        createdAt: new Date().toISOString(),
      };
      tickets.unshift(newTicket);
      mockStorage.saveTickets(payload.sessionId, tickets);
      return newTicket;
    }
  },
};
