import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E7EBE7] relative">
        <button
          onClick={onCancel}
          type="button"
          className="absolute right-4 top-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#17211D]">{title}</h3>
            <p className="text-xs text-[#75817A] mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            type="button"
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#17211D] bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-50 shadow-xs ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#183C32] hover:bg-[#122e26]"
            }`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const StatusBadge: React.FC<{
  status: string;
  className?: string;
}> = ({ status, className = "" }) => {
  const norm = status.toLowerCase();

  let styles = "bg-gray-100 text-gray-700 border-gray-200";

  if (norm === "active" || norm === "completed" || norm === "delivered") {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (norm === "paused" || norm === "pending" || norm === "shipped" || norm === "in review") {
    styles = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (norm === "discontinued" || norm === "skipped" || norm === "cancelled") {
    styles = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (norm === "open" || norm === "placed" || norm === "confirmed") {
    styles = "bg-blue-50 text-blue-700 border-blue-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border capitalize ${styles} ${className}`}
    >
      {status}
    </span>
  );
};
