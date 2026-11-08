import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  Filter,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { useSession } from "../context/SessionContext.tsx";
import { routineService } from "../services/routineService.ts";
import { Routine, RoutineSummary, RoutineStatus } from "../types/routine.ts";
import { RoutineCard } from "../components/routines/RoutineCard.tsx";
import { RoutineFormModal } from "../components/routines/RoutineFormModal.tsx";
import { RoutineSummaryCard } from "../components/routines/RoutineSummaryCard.tsx";
import { PageLoader } from "../components/common/LoadingSpinner.tsx";
import { EmptyState } from "../components/common/ErrorState.tsx";

export const RoutinesPage: React.FC = () => {
  const { sessionId } = useSession();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [summary, setSummary] = useState<RoutineSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"today" | "weekly" | "all">("today");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, sum] = await Promise.all([
        routineService.getRoutines(sessionId),
        routineService.getRoutineSummary(sessionId),
      ]);
      setRoutines(list);
      setSummary(sum);
    } catch {
      setRoutines([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const handleStatusChange = async (id: string, newStatus: RoutineStatus) => {
    try {
      await routineService.updateRoutine(id, sessionId, { status: newStatus });
      await loadData();
    } catch {
      // handled
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await routineService.deleteRoutine(id, sessionId);
      await loadData();
    } catch {
      // handled
    }
  };

  const handleSaveRoutine = async (payload: any) => {
    if (editingRoutine) {
      await routineService.updateRoutine(editingRoutine.id, sessionId, payload);
    } else {
      await routineService.createRoutine(payload);
    }
    setEditingRoutine(null);
    await loadData();
  };

  // Filter routines based on active view and status filter
  const filteredRoutines = routines.filter((r) => {
    // View filtering
    if (activeView === "today") {
      if (r.scheduledDate !== todayStr) return false;
    } else if (activeView === "weekly") {
      const diffTime = Math.abs(
        new Date(r.scheduledDate).getTime() - new Date(todayStr).getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 7) return false;
    }

    // Status filtering
    if (statusFilter !== "all" && r.status !== statusFilter) {
      return false;
    }

    return true;
  });

  if (isLoading) {
    return <PageLoader message="Loading routine manager..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 px-3.5 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E7E2] p-4 sm:p-6 md:p-8 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#0F2E24] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-[#207D53]" />
            <span>Habit Formation Protocol</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#131B17] tracking-tight">
            Your Care Routine
          </h1>
          <p className="text-xs text-[#6C7A72] mt-1">
            Organise personal care activities, track completion, and stay consistent.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRoutine(null);
            setIsModalOpen(true);
          }}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2E24] text-white text-xs font-semibold hover:bg-[#0a2119] transition-colors shadow-2xs cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Routine Summary Card */}
      {summary && <RoutineSummaryCard summary={summary} />}

      {/* View Switcher and Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E7E2] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        {/* Today / Weekly / All Switcher */}
        <div className="flex items-center gap-1 bg-[#F8F9F6] p-1 rounded-2xl border border-[#E7EBE7]">
          {(["today", "weekly", "all"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeView === view
                  ? "bg-white text-[#183C32] shadow-xs"
                  : "text-[#75817A] hover:text-[#17211D]"
              }`}
            >
              {view === "today" ? "Today's Steps" : view === "weekly" ? "This Week" : "All Scheduled"}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#75817A]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E7EBE7] text-xs font-semibold text-[#17211D] bg-[#F8F9F6] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      {/* Routine Cards List */}
      {filteredRoutines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={(r) => {
                setEditingRoutine(r);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarCheck className="w-12 h-12" />}
          title={`No ${activeView} activities found`}
          description={
            statusFilter !== "all"
              ? `No activities with status "${statusFilter}". Try changing the filter.`
              : "Keep your care organized by adding morning or bedtime reminders."
          }
          actionLabel="Add Routine Activity"
          onAction={() => {
            setEditingRoutine(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Form Modal */}
      <RoutineFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoutine(null);
        }}
        sessionId={sessionId}
        initialData={editingRoutine}
        onSubmit={handleSaveRoutine}
      />
    </div>
  );
};
