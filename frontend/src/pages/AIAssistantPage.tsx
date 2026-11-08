import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bot,
  Sparkles,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Shield,
  Layers,
  MessageSquare,
  Send,
  Zap,
} from "lucide-react";
import { useSession } from "../context/SessionContext.tsx";
import { aiService } from "../services/aiService.ts";
import { ChatMessage } from "../types/ai.ts";
import { ChatMessageItem } from "../components/ai/ChatMessageItem.tsx";
import { ChatInput, TypingIndicator, SuggestedPrompts } from "../components/ai/ChatInput.tsx";
import { ConfirmDialog } from "../components/common/ConfirmDialog.tsx";
import { PageLoader } from "../components/common/LoadingSpinner.tsx";
import { useBackendConfig } from "../context/BackendConfigContext.tsx";

export const AIAssistantPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sessionId } = useSession();
  const { status, baseUrl } = useBackendConfig();

  const queryPrompt = searchParams.get("prompt");
  const queryProductId = searchParams.get("productId");
  const queryProductName = searchParams.get("productName");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [contextProduct, setContextProduct] = useState<{ id: string; name: string } | null>(
    queryProductId && queryProductName
      ? { id: queryProductId, name: queryProductName }
      : null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const [history, sug] = await Promise.all([
        aiService.getChatHistory(sessionId),
        aiService.getSuggestions(),
      ]);
      setMessages(history);
      setSuggestions(sug);
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Handle incoming query prompt from product details or dashboard shortcuts
  useEffect(() => {
    if (queryPrompt && !isLoading) {
      handleSendMessage(queryPrompt);
      // Clean query params so refresh doesn't resend
      setSearchParams({});
    }
  }, [queryPrompt, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const boundContext = contextProduct
      ? { productId: contextProduct.id, productName: contextProduct.name }
      : undefined;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      message: text,
      context: boundContext,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await aiService.sendMessage({
        sessionId,
        message: text,
        context: boundContext,
      });

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        message: res.response,
        sources: res.sources,
        suggestions: res.suggestions,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestions(res.suggestions);
      }
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        message: err instanceof Error
          ? `CareGuide AI request failed: ${err.message}`
          : "CareGuide AI request failed. Check the backend connection and try again.",
        isError: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await aiService.clearChatHistory(sessionId);
      setShowClearConfirm(false);
      await loadHistory();
    } catch {
      // handled
    }
  };

  if (isLoading) {
    return <PageLoader message="Connecting to CareGuide AI..." />;
  }

  return (
    <div className="py-2 sm:py-6 px-3 sm:px-6 md:px-8 max-w-5xl mx-auto h-[calc(100vh-9rem)] md:h-[calc(100vh-5rem)] flex flex-col">
      {/* Header Bar */}
      <div className="bg-white rounded-t-2xl border border-[#E2E7E2] p-3 sm:p-4 md:p-6 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0F2E24] text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#131B17] truncate">CareGuide AI</h1>
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-[#E7F1EB] text-[#0F2E24] shrink-0">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#207D53]" />
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-[#6C7A72]">
              Personal clinical formulation assistant · Gateway: {status === "connected" ? "FastAPI Live" : "Demo Engine"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6C7A72] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Clear chat history"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear History</span>
        </button>
      </div>

      {/* Main Chat Scroll Area */}
      <div className="flex-1 bg-[#F7F8F5] border-x border-[#E2E7E2] overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessageItem key={msg.id || i} message={msg} />
        ))}

        {isSending && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-up Prompts */}
      <SuggestedPrompts
        prompts={suggestions}
        onSelect={(p) => handleSendMessage(p)}
      />

      {/* Chat Composer Input */}
      <div className="rounded-b-2xl overflow-hidden border-x border-b border-[#E2E7E2] shadow-xl">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isSending}
          contextProduct={contextProduct}
          onClearContext={() => setContextProduct(null)}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Conversation History?"
        description="This will clear your previous questions and AI answers from your session history."
        confirmLabel="Clear History"
        isDestructive
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
