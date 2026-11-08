import React from "react";
import { CheckCircle2, Clock, SkipForward, BarChart2 } from "lucide-react";
import { RoutineSummary } from "../../types/routine.ts";

export const RoutineSummaryCard: React.FC<{ summary: RoutineSummary }> = ({
  summary,
}) => {
  return (
    <div className="rounded-3xl bg-white border border-[#E7EBE7] p-6 shadow-2xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-[#17211D]">Routine Adherence</h3>
          <p className="text-xs text-[#75817A]">
            Consistency overview for your active care schedule
          </p>
        </div>

        {/* Completion rate badge */}
        <div className="flex items-center gap-2 bg-[#E7F1EB] px-3.5 py-1.5 rounded-2xl border border-emerald-200">
          <BarChart2 className="w-4 h-4 text-[#183C32]" />
          <span className="text-sm font-extrabold text-[#183C32]">
            {summary.completionRate}%
          </span>
          <span className="text-[11px] font-semibold text-[#183C32]">Done</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#F8F9F6] h-3 rounded-full overflow-hidden border border-[#E7EBE7] mb-6">
        <div
          className="bg-[#183C32] h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${summary.completionRate}%` }}
        />
      </div>

      {/* Breakdown stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-[#F8F9F6] border border-[#E7EBE7]">
          <span className="text-xs text-[#75817A] block mb-0.5">Total</span>
          <span className="text-base font-extrabold text-[#17211D]">
            {summary.total}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center justify-center gap-1 text-emerald-800 text-xs mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
          <span className="text-base font-extrabold text-emerald-800">
            {summary.completed}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
          <div className="flex items-center justify-center gap-1 text-amber-800 text-xs mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
          <span className="text-base font-extrabold text-amber-800">
            {summary.pending}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-center gap-1 text-gray-700 text-xs mb-0.5">
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skipped</span>
          </div>
          <span className="text-base font-extrabold text-gray-700">
            {summary.skipped}
          </span>
        </div>
      </div>
    </div>
  );
};
