import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  CalendarCheck,
  BookOpenText,
  BotMessageSquare,
  ArrowRight,
  Plus,
  Flame,
  AlertCircle,
  Package,
} from "lucide-react";
import { useSession } from "../context/SessionContext.tsx";
import { dashboardService } from "../services/dashboardService.ts";
import { routineService } from "../services/routineService.ts";
import { DashboardData } from "../types/dashboard.ts";
import { PageLoader } from "../components/common/LoadingSpinner.tsx";
import { RoutineCard } from "../components/routines/RoutineCard.tsx";
import { RoutineFormModal } from "../components/routines/RoutineFormModal.tsx";
import { ProgressFormModal } from "../components/progress/ProgressFormModal.tsx";
import { progressService } from "../services/progressService.ts";
import { StatusBadge } from "../components/common/ConfirmDialog.tsx";
import { formatDateStr } from "../lib/utils.ts";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId, userName } = useSession();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getDashboardData(sessionId);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [sessionId]);

  const handleRoutineStatus = async (
    id: string,
    status: "pending" | "completed" | "skipped"
  ) => {
    try {
      await routineService.updateRoutine(id, sessionId, { status });
      await loadDashboard();
    } catch {
      // handled
    }
  };

  const handleRoutineDelete = async (id: string) => {
    try {
      await routineService.deleteRoutine(id, sessionId);
      await loadDashboard();
    } catch {
      // handled
    }
  };

  // Get dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return <PageLoader message="Loading your personal care space..." />;
  }

  const stats = data?.stats || {
    activeProductsCount: 0,
    todayRoutinesTotal: 0,
    todayRoutinesCompleted: 0,
    progressEntriesCount: 0,
    streakDays: 1,
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 px-3.5 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Welcome Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-[#E2E7E2] shadow-2xs">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-[#0F2E24] tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#0F2E24] shrink-0" />
            <span className="truncate">Man Matters Personal Care Dashboard</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#131B17] tracking-tight">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-xs text-[#6C7A72] mt-0.5 sm:mt-1 leading-relaxed">
            Track daily schedule, application adherence, and active formulations.
          </p>
        </div>

        {/* 3-Button Responsive Quick Actions */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <button
            onClick={() => setIsRoutineModalOpen(true)}
            type="button"
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#0F2E24] text-white text-xs font-semibold hover:bg-[#0a2119] transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">+ Routine</span>
              <span className="hidden sm:inline">Add Routine</span>
            </span>
          </button>

          <button
            onClick={() => setIsProgressModalOpen(true)}
            type="button"
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#E7F1EB] text-[#0F2E24] text-xs font-semibold hover:bg-[#d8e8de] transition-colors cursor-pointer border border-[#D2E3D8]"
          >
            <BookOpenText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Log Entry</span>
              <span className="hidden sm:inline">Log Progress</span>
            </span>
          </button>

          <Link
            to="/discover"
            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#F7F8F5] sm:bg-gray-100 text-[#131B17] text-xs font-semibold hover:bg-gray-200 transition-colors border border-[#E2E7E2] sm:border-transparent"
          >
            <Compass className="w-3.5 h-3.5 text-[#6C7A72] shrink-0" />
            <span className="truncate">Catalogue</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Link
          to="/my-care"
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E7E2] hover:border-[#0F2E24]/30 hover:shadow-md transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[#6C7A72] mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
              Active Products
            </span>
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-[#0F2E24] transition-colors shrink-0 ml-1" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#131B17] tabular-nums my-0.5">
            {stats.activeProductsCount}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#6C7A72] truncate">In daily cabinet</p>
        </Link>

        <Link
          to="/routines"
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E7E2] hover:border-[#0F2E24]/30 hover:shadow-md transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[#6C7A72] mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
              Today's Routine
            </span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-[#0F2E24] transition-colors shrink-0 ml-1" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#131B17] tabular-nums my-0.5">
            {stats.todayRoutinesTotal}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#6C7A72] truncate">Scheduled steps</p>
        </Link>

        <Link
          to="/routines"
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E7E2] hover:border-[#0F2E24]/30 hover:shadow-md transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[#207D53] mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
              Adherence
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#207D53] shrink-0 ml-1" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#207D53] tabular-nums my-0.5">
            {stats.todayRoutinesTotal > 0
              ? `${Math.round((stats.todayRoutinesCompleted / stats.todayRoutinesTotal) * 100)}%`
              : "100%"}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#207D53] font-medium truncate">
            {stats.todayRoutinesCompleted} of {stats.todayRoutinesTotal} steps
          </p>
        </Link>

        <Link
          to="/progress"
          className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E2E7E2] hover:border-[#0F2E24]/30 hover:shadow-md transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between text-[#6C7A72] mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
              Journal Entries
            </span>
            <BookOpenText className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-[#0F2E24] transition-colors shrink-0 ml-1" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#131B17] tabular-nums my-0.5">
            {stats.progressEntriesCount}
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#6C7A72] truncate">Logged records</p>
        </Link>
      </div>

      {/* Main 2-Column Split: Today's Routine + My Active Care */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Today's Routine Activities */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#131B17]">Today's Routine</h2>
              <p className="text-[11px] sm:text-xs text-[#6C7A72]">
                Mark off steps as you complete them throughout the day
              </p>
            </div>
            <Link
              to="/routines"
              className="text-xs font-bold text-[#0F2E24] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.todayRoutines && data.todayRoutines.length > 0 ? (
            <div className="space-y-2.5 sm:space-y-3">
              {data.todayRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onStatusChange={handleRoutineStatus}
                  onDelete={handleRoutineDelete}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-dashed border-[#E2E7E2] text-center">
              <CalendarCheck className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#131B17]">
                No routines scheduled for today
              </p>
              <p className="text-[11px] text-[#6C7A72] mt-1 mb-3 sm:mb-4">
                Build a consistent habit by scheduling your morning or evening personal care steps.
              </p>
              <button
                onClick={() => setIsRoutineModalOpen(true)}
                type="button"
                className="px-4 py-2 rounded-xl bg-[#0F2E24] text-white text-xs font-semibold hover:bg-[#0a2119] cursor-pointer"
              >
                Schedule First Activity
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Active My Care Shelf */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#131B17]">My Active Care</h2>
              <p className="text-[11px] sm:text-xs text-[#6C7A72]">Your active cabinet formulations</p>
            </div>
            <Link
              to="/my-care"
              className="text-xs font-bold text-[#0F2E24] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Manage Shelf</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.myCarePreview && data.myCarePreview.length > 0 ? (
            <div className="space-y-2.5 sm:space-y-3">
              {data.myCarePreview.map((item) => (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#E2E7E2] flex items-center gap-3 shadow-2xs hover:border-[#0F2E24]/30 transition-all"
                >
                  <img
                    src={
                      item.product?.imageUrl ||
                      "https://i.mscwlns.co/media/misc/pdp_rcl/2025137/Combo-Kit_umbirx.png?tr=w-800"
                    }
                    alt={item.product?.name || "Product"}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-contain p-1 bg-[#F7F8F5] shrink-0 border border-[#EEF2EE]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-[#0F2E24] uppercase tracking-wider">
                        {item.product?.category || "Care"}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="text-xs font-bold text-[#131B17] truncate">
                      {item.product?.name || "Care Product"}
                    </h3>
                    <p className="text-[10px] text-[#6C7A72] truncate mt-0.5">
                      {item.dosageSchedule || `Started: ${formatDateStr(item.startDate)}`}
                    </p>
                  </div>
                  <Link
                    to={`/discover/${item.productId}`}
                    className="p-1.5 rounded-lg text-[#6C7A72] hover:text-[#0F2E24] hover:bg-gray-100 transition-colors"
                    title="View details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-dashed border-[#E2E7E2] text-center">
              <Package className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#131B17]">
                Your care shelf is empty
              </p>
              <p className="text-[11px] text-[#6C7A72] mt-1 mb-3 sm:mb-4">
                Explore the Man Matters catalogue to add hair, beard, or skin essentials.
              </p>
              <Link
                to="/discover"
                className="inline-block px-4 py-2 rounded-xl bg-[#0F2E24] text-white text-xs font-semibold hover:bg-[#0a2119]"
              >
                Explore Catalogue
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Banner Preview */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0F2E24] via-[#143B2F] to-[#0A221A] text-white p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#0F2E24]">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <BotMessageSquare className="w-3.5 h-3.5" />
            <span>CAREGUIDE AI CONSULTATION</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Have questions about ingredients or application order?
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed">
            Instant interaction checks between Minoxidil and oils, Ketoconazole wash rhythms, and customized dosage answers.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "What does Redensyl do in the Hair Serum?",
              "How should I use Anti-Dandruff Shampoo?",
              "Can I apply oil over Beardmax serum?",
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(`/ai-assistant?prompt=${encodeURIComponent(prompt)}`)}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-left transition-colors cursor-pointer border border-white/10"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        <Link
          to="/ai-assistant"
          className="px-6 py-3 rounded-xl bg-white text-[#0F2E24] text-xs font-bold hover:bg-gray-100 transition-colors shadow-md shrink-0 flex items-center gap-2"
        >
          <span>Chat with CareGuide AI</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Modals */}
      <RoutineFormModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        sessionId={sessionId}
        onSubmit={async (payload) => {
          await routineService.createRoutine(payload);
          await loadDashboard();
        }}
      />

      <ProgressFormModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        sessionId={sessionId}
        onSubmit={async (payload) => {
          await progressService.createEntry(payload);
          await loadDashboard();
        }}
      />
    </div>
  );
};
