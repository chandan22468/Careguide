import React, { useState } from "react";
import { Calendar, Trash2, Edit3, Image as ImageIcon, Sparkles } from "lucide-react";
import { ProgressEntry } from "../../types/progress.ts";
import { formatDateStr } from "../../lib/utils.ts";

interface ProgressCardProps {
  entry: ProgressEntry;
  onDelete: (id: string) => void;
  onEdit?: (entry: ProgressEntry) => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  entry,
  onDelete,
  onEdit,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const getCategoryTheme = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "hair":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "beard":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "skin":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "wellness":
        return "bg-purple-50 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <div className="rounded-3xl bg-white border border-[#E7EBE7] p-6 shadow-2xs hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryTheme(
                entry.careType
              )}`}
            >
              {entry.careType} Care
            </span>

            <div className="flex items-center gap-1.5 text-xs text-[#75817A]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateStr(entry.entryDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                type="button"
                className="p-1.5 text-gray-400 hover:text-[#183C32] hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit entry"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(entry.id)}
              type="button"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Condition Title */}
        {entry.condition && (
          <h3 className="text-base font-bold text-[#17211D] mb-2 leading-snug">
            {entry.condition}
          </h3>
        )}

        {/* Observation text */}
        <p className="text-xs text-[#17211D] leading-relaxed mb-4 whitespace-pre-line bg-[#F8F9F6] p-3.5 rounded-2xl border border-[#E7EBE7]/60">
          {entry.observations}
        </p>

        {/* Self-rated scale if present */}
        {entry.metrics?.scale && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 bg-[#E7F1EB] px-2.5 py-1 rounded-xl text-xs font-bold text-[#183C32]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Condition Rating: {entry.metrics.scale}/10</span>
            </div>
            {entry.metrics.ratingLabel && (
              <span className="text-[11px] text-[#75817A] italic">
                ({entry.metrics.ratingLabel})
              </span>
            )}
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <p className="text-[11px] text-[#75817A] mb-4">
            <strong>Notes:</strong> {entry.notes}
          </p>
        )}

        {/* Photo Gallery */}
        {entry.photoUrls && entry.photoUrls.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-[#75817A] mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Attached Photos ({entry.photoUrls.length})</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {entry.photoUrls.map((url, idx) => (
                <button
                  key={url + idx}
                  type="button"
                  onClick={() => setSelectedPhoto(url)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#E7EBE7] hover:scale-105 transition-transform cursor-pointer"
                >
                  <img
                    src={url}
                    alt={`Progress photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="Enlarged progress photo"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <p className="text-center text-xs text-white/80 mt-2 font-medium">
              Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </>
  );
};
