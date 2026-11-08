import React, { useState } from "react";
import { Copy, Check, Bot, User, ExternalLink, Sparkles } from "lucide-react";
import { ChatMessage } from "../../types/ai.ts";

export const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic safe markdown parser for bold, headers, and lists
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-bold text-sm text-[#183C32] mt-3 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      // Header 2
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="font-bold text-base text-[#183C32] mt-3 mb-1">
            {line.replace("## ", "")}
          </h3>
        );
      }
      // Bullet list item
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed my-0.5">
            {parseInlineStyles(line.substring(2))}
          </li>
        );
      }
      // Numbered list item
      const numMatch = line.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal text-xs leading-relaxed my-0.5">
            {parseInlineStyles(numMatch[2])}
          </li>
        );
      }
      // Empty line spacer
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="text-xs leading-relaxed my-1">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  const parseInlineStyles = (raw: string) => {
    // Bold **text**
    const parts = raw.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-[#17211D]">{part.slice(2, -2)}</strong>;
      }
      // Italic *text*
      const italicParts = part.split(/(\*.*?\*)/g);
      return italicParts.map((subPart, j) => {
        if (subPart.startsWith("*") && subPart.endsWith("*") && !subPart.startsWith("**")) {
          return <em key={j} className="italic text-gray-600">{subPart.slice(1, -1)}</em>;
        }
        return subPart;
      });
    });
  };

  return (
    <div
      className={`flex gap-3 mb-4 max-w-3xl ${
        isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
          isAssistant
            ? "bg-[#183C32] text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {isAssistant ? <Bot className="w-4 h-4 text-emerald-300" /> : <User className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div
        className={`rounded-3xl p-4 shadow-2xs relative group transition-all text-xs ${
          isAssistant
            ? "bg-white border border-[#E7EBE7] text-[#17211D]"
            : "bg-[#183C32] text-white"
        }`}
      >
        {/* Context Chip if product context was bound */}
        {message.context?.productName && (
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${
              isAssistant
                ? "bg-[#E7F1EB] text-[#183C32]"
                : "bg-white/20 text-white"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Product Context: {message.context.productName}</span>
          </div>
        )}

        {/* Message body */}
        <div className="prose-xs max-w-none">
          {renderFormattedText(message.message)}
        </div>

        {/* Sources / Verified Citations */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#E7EBE7]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#75817A] block mb-1">
              Sources & context:
            </span>
            <div className="space-y-1">
              {message.sources.map((src, i) => (
                <div
                  key={i}
                  className="text-[11px] text-[#183C32] bg-[#F8F9F6] p-2 rounded-xl border border-[#E7EBE7] flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold block">{src.title}</span>
                    {src.snippet && (
                      <span className="text-[10px] text-gray-500 block">
                        {src.snippet}
                      </span>
                    )}
                  </div>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-black mt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Copy action button */}
        {isAssistant && (
          <button
            onClick={handleCopy}
            type="button"
            className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            title="Copy response"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};
