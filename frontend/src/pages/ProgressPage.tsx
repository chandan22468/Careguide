import React, { useState, useEffect } from "react";
import {
  BookOpenText,
  Plus,
  Filter,
  Sparkles,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { useSession } from "../context/SessionContext.tsx";
import { progressService } from "../services/progressService.ts";
import { ProgressEntry, ProgressCareType } from "../types/progress.ts";
import { ProgressCard } from "../components/progress/ProgressCard.tsx";
import { ProgressFormModal } from "../components/progress/ProgressFormModal.tsx";
import { ProgressVisualizer } from "../components/progress/ProgressVisualizer.tsx";
import { PageLoader } from "../components/common/LoadingSpinner.tsx";
import { EmptyState } from "../components/common/ErrorState.tsx";

const CATEGORIES = ["All", "Hair", "Beard", "Skin", "Wellness", "Other"];

export const ProgressPage: React.FC = () => {
  const { sessionId } = useSession();

  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProgressEntry | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await progressService.getEntries(sessionId);
      setEntries(list);
    } catch {
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const handleDelete = async (id: string) => {
    try {
      await progressService.deleteEntry(id, sessionId);
      await loadData();
    } catch {
      // handled
    }
  };

  const handleSaveEntry = async (payload: any) => {
    if (editingEntry) {
      await progressService.updateEntry(editingEntry.id, sessionId, payload);
    } else {
      await progressService.createEntry(payload);
    }
    setEditingEntry(null);
    await loadData();
  };

  const filteredEntries = entries.filter((e) => {
    if (selectedCategory === "All") return true;
    return e.careType.toLowerCase() === selectedCategory.toLowerCase();
  });

  if (isLoading) {
    return <PageLoader message="Loading progress journal..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 px-3.5 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E7E2] p-4 sm:p-6 md:p-8 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#0F2E24] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <BookOpenText className="w-3.5 h-3.5 text-[#207D53]" />
            <span>Journal & Milestones</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#131B17] tracking-tight">
            Progress Journal
          </h1>
          <p className="text-xs text-[#6C7A72] mt-1">
            Document visible improvements, wash observations, and track timeline photos.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEntry(null);
            setIsModalOpen(true);
          }}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2E24] text-white text-xs font-semibold hover:bg-[#0a2119] transition-colors shadow-2xs cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Visual Analytics / Trend curve if entries exist */}
      {entries.length > 0 && <ProgressVisualizer entries={entries} />}

      {/* Filter by Category */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E2E7E2] p-2.5 sm:p-3 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#0F2E24] text-white shadow-2xs"
                  : "text-[#6C7A72] hover:text-[#131B17] hover:bg-gray-100"
              }`}
            >
              {cat === "All" ? "All Categories" : `${cat} Care`}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#6C7A72] font-medium pr-3 hidden sm:inline">
          {filteredEntries.length} entries
        </span>
      </div>

      {/* Entries Timeline */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <ProgressCard
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
              onEdit={(e) => {
                setEditingEntry(e);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpenText className="w-12 h-12" />}
          title="Your personal care journey starts here."
          description="Record your baseline observations today—scalp condition, beard texture, or skin hydration—to monitor change over the coming weeks."
          actionLabel="Add Your First Entry"
          onAction={() => {
            setEditingEntry(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Form Modal */}
      <ProgressFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        sessionId={sessionId}
        initialData={editingEntry}
        onSubmit={handleSaveEntry}
      />
    </div>
  );
};
