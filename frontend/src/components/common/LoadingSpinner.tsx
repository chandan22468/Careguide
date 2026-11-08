import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils.ts";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  label,
}) => {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  }[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-[#183C32]", sizeClass)} />
      {label && <p className="text-xs text-[#75817A] font-medium tracking-wide">{label}</p>}
    </div>
  );
};

export const PageLoader: React.FC<{ message?: string }> = ({
  message = "Loading your care journey...",
}) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 rounded-full border-4 border-[#E7F1EB] border-t-[#183C32] animate-spin mb-4" />
      <p className="text-sm font-medium text-[#17211D]">{message}</p>
      <p className="text-xs text-[#75817A] mt-1">Checking records and syncing with CareGuide...</p>
    </div>
  );
};
