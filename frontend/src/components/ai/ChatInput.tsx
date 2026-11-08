import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Bot } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  contextProduct?: { id: string; name: string } | null;
  onClearContext?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  contextProduct,
  onClearContext,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-[#E7EBE7] bg-white p-3 md:p-4">
      {/* Active Context Chip */}
      {contextProduct && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-[#E7F1EB] rounded-xl text-xs font-semibold text-[#183C32] w-fit border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Product Context: {contextProduct.name}</span>
          {onClearContext && (
            <button
              onClick={onClearContext}
              type="button"
              className="text-[#183C32]/70 hover:text-[#183C32] ml-1 p-0.5 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask CareGuide AI about products, ingredients, routines... (Shift+Enter for newline)"
          className="flex-1 max-h-32 min-h-[44px] py-2.5 px-4 rounded-2xl border border-[#E7EBE7] bg-[#F8F9F6] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] resize-none"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-11 px-4 rounded-2xl bg-[#183C32] text-white hover:bg-[#122e26] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="text-[10px] text-[#75817A] text-center mt-2">
        CareGuide AI provides general wellness and product guidance. It is not medical advice.
      </div>
    </div>
  );
};

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 mb-4 mr-auto">
      <div className="w-8 h-8 rounded-2xl bg-[#183C32] text-white flex items-center justify-center shadow-2xs">
        <Bot className="w-4 h-4 text-emerald-300" />
      </div>
      <div className="bg-white border border-[#E7EBE7] px-4 py-3 rounded-3xl flex items-center gap-1.5 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#183C32] animate-bounce" />
        <span className="w-2 h-2 rounded-full bg-[#183C32] animate-bounce [animation-delay:0.2s]" />
        <span className="w-2 h-2 rounded-full bg-[#183C32] animate-bounce [animation-delay:0.4s]" />
        <span className="text-[11px] font-medium text-[#75817A] ml-2">
          CareGuide AI is thinking...
        </span>
      </div>
    </div>
  );
};

export const SuggestedPrompts: React.FC<{
  prompts: string[];
  onSelect: (prompt: string) => void;
}> = ({ prompts, onSelect }) => {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="p-3 bg-[#F8F9F6] border-t border-[#E7EBE7]">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#75817A] block mb-2">
        Suggested Questions:
      </span>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p)}
            type="button"
            className="text-[11px] px-3 py-1.5 rounded-xl bg-white border border-[#E7EBE7] text-[#17211D] hover:border-[#183C32] hover:text-[#183C32] hover:bg-[#E7F1EB]/30 transition-all font-medium text-left"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
