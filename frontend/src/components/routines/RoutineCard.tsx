import React from "react";
import { CheckCircle2, Clock, SkipForward, Trash2, Edit3, Tag, Sparkles } from "lucide-react";
import { Routine } from "../../types/routine.ts";
import { StatusBadge } from "../common/ConfirmDialog.tsx";

interface RoutineCardProps {
  routine: Routine;
  onStatusChange: (id: string, newStatus: "pending" | "completed" | "skipped") => void;
  onDelete: (id: string) => void;
  onEdit?: (routine: Routine) => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  onStatusChange,
  onDelete,
  onEdit,
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all bg-white shadow-2xs hover:shadow-md ${
        routine.status === "completed"
          ? "border-emerald-200 bg-emerald-50/20"
          : routine.status === "skipped"
          ? "border-gray-200 opacity-70 bg-gray-50/50"
          : "border-[#E2E7E2]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={routine.status} />
          {routine.timeOfDay && (
            <span className="text-[11px] font-semibold text-[#6C7A72] bg-[#F7F8F5] border border-[#E2E7E2] px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {routine.timeOfDay}
            </span>
          )}
          {routine.category && (
            <span className="text-[11px] font-bold text-[#0F2E24] uppercase tracking-wider">
              · {routine.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[#6C7A72]">
          {onEdit && (
            <button
              onClick={() => onEdit(routine)}
              type="button"
              className="p-1.5 hover:text-[#0F2E24] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Edit routine"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDelete(routine.id)}
            type="button"
            className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete routine"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Routine Title & Product Link */}
      <h3
        className={`text-sm font-bold text-[#17211D] mb-1 ${
          routine.status === "completed" ? "line-through text-gray-500" : ""
        }`}
      >
        {routine.activityName}
      </h3>

      {routine.productName && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F2E24] mb-2">
          <Tag className="w-3.5 h-3.5 text-[#207D53]" />
          <span>Formulation: {routine.productName}</span>
        </div>
      )}

      {routine.instructions && (
        <p className="text-xs text-[#6C7A72] mb-3 leading-relaxed bg-[#F7F8F5] p-3 rounded-xl border border-[#EEF2EE]">
          {routine.instructions}
        </p>
      )}

      {routine.notes && (
        <p className="text-[11px] text-[#6C7A72] italic mb-3">
          Note: "{routine.notes}"
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-[#EEF2EE] gap-2">
        <span className="text-[11px] text-[#6C7A72]">
          Scheduled: <strong className="text-[#131B17] font-mono">{routine.scheduledDate}</strong>
        </span>

        <div className="flex items-center gap-2">
          {routine.status !== "completed" && (
            <button
              onClick={() => onStatusChange(routine.id, "completed")}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#207D53] hover:bg-[#186341] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </button>
          )}

          {routine.status !== "skipped" && routine.status !== "completed" && (
            <button
              onClick={() => onStatusChange(routine.id, "skipped")}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#6C7A72] text-xs font-semibold transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip
            </button>
          )}

          {(routine.status === "completed" || routine.status === "skipped") && (
            <button
              onClick={() => onStatusChange(routine.id, "pending")}
              type="button"
              className="text-xs text-[#6C7A72] hover:text-[#0F2E24] hover:underline font-medium cursor-pointer"
            >
              Reset to Pending
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
