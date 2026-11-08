import React, { useState, useEffect } from "react";
import { X, BookOpenText, AlertCircle } from "lucide-react";
import { ProgressEntry, CreateProgressPayload, ProgressCareType } from "../../types/progress.ts";
import { ImageUploader } from "./ImageUploader.tsx";

interface ProgressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProgressPayload) => Promise<void>;
  initialData?: ProgressEntry | null;
  sessionId: string;
}

export const ProgressFormModal: React.FC<ProgressFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  sessionId,
}) => {
  const [careType, setCareType] = useState<ProgressCareType>("Hair");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [condition, setCondition] = useState("");
  const [observations, setObservations] = useState("");
  const [notes, setNotes] = useState("");
  const [scale, setScale] = useState<number>(7);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoFileIds, setPhotoFileIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCareType(initialData.careType || "Hair");
      setEntryDate(initialData.entryDate || new Date().toISOString().split("T")[0]);
      setCondition(initialData.condition || "");
      setObservations(initialData.observations || "");
      setNotes(initialData.notes || "");
      setScale(initialData.metrics?.scale || 7);
      setPhotoUrls(initialData.photoUrls || []);
      setPhotoFileIds(initialData.photoFileIds || []);
    } else {
      setCareType("Hair");
      setEntryDate(new Date().toISOString().split("T")[0]);
      setCondition("");
      setObservations("");
      setNotes("");
      setScale(7);
      setPhotoUrls([]);
      setPhotoFileIds([]);
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observations.trim()) {
      setError("Please describe your observation or personal progress note.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        sessionId,
        careType,
        entryDate,
        condition: condition.trim() || undefined,
        observations: observations.trim(),
        notes: notes.trim() || undefined,
        scale,
        photoUrls,
        photoFileIds,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save journal entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#E7EBE7] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#E7F1EB] text-[#183C32] flex items-center justify-center">
            <BookOpenText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#17211D]">
              {initialData ? "Edit Progress Journal Entry" : "New Progress Journal Entry"}
            </h2>
            <p className="text-xs text-[#75817A]">
              Record your personal observations, condition, and optional photos
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                Care Category
              </label>
              <select
                value={careType}
                onChange={(e) => setCareType(e.target.value as ProgressCareType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
              >
                <option value="Hair">Hair Care</option>
                <option value="Beard">Beard Care</option>
                <option value="Skin">Skin Care</option>
                <option value="Wellness">General Wellness</option>
                <option value="Other">Other Personal Care</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                Date of Observation
              </label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
              Condition Headline / Summary
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Reduced wash-day shedding, Scalp feels calmer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
              Observations & Details <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Describe what you noticed today (e.g. strand texture, flakiness, irritation, beard softness)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
            />
          </div>

          {/* Self-rated scale slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[#17211D]">
                Self-Rated Condition Score
              </label>
              <span className="text-xs font-extrabold text-[#183C32] bg-[#E7F1EB] px-2 py-0.5 rounded-md">
                {scale}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-[#183C32] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#75817A] mt-1">
              <span>Concerned (1)</span>
              <span>Moderate (5)</span>
              <span>Optimal (10)</span>
            </div>
          </div>

          {/* Image Uploader */}
          <div className="pt-2 border-t border-[#E7EBE7]">
            <ImageUploader
              photoUrls={photoUrls}
              photoFileIds={photoFileIds}
              onChange={(urls, fileIds) => {
                setPhotoUrls(urls);
                setPhotoFileIds(fileIds);
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
              Optional Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Drinking 3L water daily and sleeping 8 hours"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7EBE7]">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#17211D] bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#183C32] text-white text-xs font-semibold hover:bg-[#122e26] transition-colors disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
