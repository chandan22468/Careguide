import React from "react";
import { AlertCircle, RefreshCw, ServerCrash } from "lucide-react";
import { cn } from "../../lib/utils.ts";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
  className?: string;
  isBackendError?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We couldn't retrieve this information right now. Please try again or check backend connection.",
  onRetry,
  actionLabel,
  className,
  isBackendError = false,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3 shadow-xs">
        {isBackendError ? <ServerCrash className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-[#17211D] mb-1">{title}</h3>
      <p className="text-xs text-[#75817A] max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#183C32] text-white text-xs font-semibold hover:bg-[#122e26] transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {actionLabel || "Retry Request"}
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[#E7EBE7] bg-white p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6",
        className
      )}
    >
      {icon && <div className="mb-4 text-[#75817A]">{icon}</div>}
      <h3 className="text-base font-semibold text-[#17211D] mb-1.5">{title}</h3>
      <p className="text-xs text-[#75817A] max-w-xs mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#183C32] text-white text-xs font-semibold hover:bg-[#122e26] transition-all shadow-xs cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
