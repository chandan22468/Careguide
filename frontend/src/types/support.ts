export interface FAQItem {
  id: string;
  category: "General" | "Products" | "Routines" | "Orders" | "Ingredients";
  question: string;
  answer: string;
}

export type TicketStatus = "Open" | "In Review" | "Resolved";

export interface SupportTicket {
  id: string;
  ticketId: string;
  sessionId: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
}

export interface CreateTicketPayload {
  sessionId: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}
