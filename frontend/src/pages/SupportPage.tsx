import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Search,
  MessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  LifeBuoy,
  ShieldAlert,
} from "lucide-react";
import { useSession } from "../context/SessionContext.tsx";
import { supportService } from "../services/supportService.ts";
import { FAQItem, SupportTicket } from "../types/support.ts";
import { StatusBadge } from "../components/common/ConfirmDialog.tsx";
import { PageLoader } from "../components/common/LoadingSpinner.tsx";
import { formatDateStr } from "../lib/utils.ts";

export const SupportPage: React.FC = () => {
  const { sessionId, userName } = useSession();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategory, setFaqCategory] = useState<string>("All");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  // Form state
  const [name, setName] = useState(userName || "Care Member");
  const [email, setEmail] = useState("member@example.com");
  const [category, setCategory] = useState("Product Usage");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [faqList, ticketList] = await Promise.all([
        supportService.getFAQs(),
        supportService.getTickets(sessionId),
      ]);
      setFaqs(faqList);
      setTickets(ticketList);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await supportService.createTicket({
        sessionId,
        name: name.trim(),
        email: email.trim(),
        category,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitSuccess(true);
      setSubject("");
      setMessage("");
      const updated = await supportService.getTickets(sessionId);
      setTickets(updated);
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = faqs.filter((item) => {
    if (faqCategory !== "All" && item.category !== faqCategory) return false;
    if (faqSearch.trim()) {
      const q = faqSearch.toLowerCase();
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (isLoading) {
    return <PageLoader message="Loading customer support center..." />;
  }

  return (
    <div className="space-y-10 py-6 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-10 shadow-2xs text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F1EB] text-[#183C32] text-xs font-bold uppercase tracking-wider mb-3">
          <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" />
          <span>Care Support</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#17211D] tracking-tight">
          How can we help you today?
        </h1>
        <p className="text-xs text-[#75817A] mt-2 max-w-md mx-auto leading-relaxed">
          Find answers regarding product formulations, routine schedules, orders, or submit a support ticket.
        </p>

        {/* FAQ Search Bar */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="w-4 h-4 text-[#75817A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder="Search FAQs (e.g. Redensyl, morning routine, derma roller)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-[#E7EBE7] bg-[#F8F9F6] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20"
          />
        </div>
      </div>

      {/* 2-Column Section: FAQs on Left, Raise Ticket on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: FAQs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#17211D]">
              Frequently Asked Questions
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              {["All", "Products", "Routines", "Ingredients"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqCategory(cat)}
                  type="button"
                  className={`px-2.5 py-1 rounded-xl font-medium transition-colors ${
                    faqCategory === cat
                      ? "bg-[#183C32] text-white"
                      : "text-[#75817A] hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-[#E7EBE7] shadow-2xs overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    type="button"
                    className="w-full p-4 text-left font-semibold text-xs text-[#17211D] flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#75817A] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#75817A] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-[#75817A] leading-relaxed border-t border-[#E7EBE7]/50 bg-[#F8F9F6]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Submit Support Ticket */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#17211D]">
              Raise a Support Request
            </h2>
            <p className="text-xs text-[#75817A] mt-0.5">
              Have a specific question about your routine or products?
            </p>
          </div>

          {submitSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Your ticket has been logged and assigned to the care team!
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#17211D] mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E7EBE7] bg-[#F8F9F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17211D] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E7EBE7] bg-[#F8F9F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17211D] mb-1">
                Concern Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E7EBE7] bg-[#F8F9F6]"
              >
                <option value="Product Usage">Product Usage & Dosage</option>
                <option value="Ingredient Inquiry">Ingredient Inquiry</option>
                <option value="Routine Scheduling">Routine Scheduling</option>
                <option value="Orders & Shipping">Orders & Shipping</option>
                <option value="General Query">General Query</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#17211D] mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question"
                className="w-full p-2.5 rounded-xl border border-[#E7EBE7] bg-[#F8F9F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#17211D] mb-1">
                Message / Details
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain what assistance you need..."
                className="w-full p-2.5 rounded-xl border border-[#E7EBE7] bg-[#F8F9F6]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-[#183C32] text-white font-bold hover:bg-[#122e26] transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit Ticket"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* My Support Requests Table */}
      <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-[#17211D]">
          My Support Requests ({tickets.length})
        </h2>

        {tickets.length > 0 ? (
          <div className="divide-y divide-[#E7EBE7]">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#183C32]">
                      {t.ticketId}
                    </span>
                    <span className="text-[10px] text-[#75817A] bg-gray-100 px-2 py-0.5 rounded-md font-semibold">
                      {t.category}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h4 className="text-xs font-bold text-[#17211D] mt-1">
                    {t.subject}
                  </h4>
                  <p className="text-[11px] text-[#75817A]">{t.message}</p>
                </div>
                <span className="text-[10px] text-[#75817A] font-mono shrink-0">
                  {formatDateStr(t.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#75817A]">
            No support requests logged for this session yet.
          </p>
        )}
      </div>
    </div>
  );
};
