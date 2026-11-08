import React, { useState, useEffect } from "react";
import { X, CalendarCheck, Sparkles, AlertCircle } from "lucide-react";
import { Routine, CreateRoutinePayload } from "../../types/routine.ts";
import { Product } from "../../types/product.ts";
import { mockStorage } from "../../services/backendMockFallback.ts";

interface RoutineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoutinePayload) => Promise<void>;
  initialData?: Routine | null;
  sessionId: string;
}

export const RoutineFormModal: React.FC<RoutineFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  sessionId,
}) => {
  const [activityName, setActivityName] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Hair");
  const [timeOfDay, setTimeOfDay] = useState("Morning");
  const [instructions, setInstructions] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load available products for selection
    const all = mockStorage.getProducts();
    setProducts(all);
  }, []);

  useEffect(() => {
    if (initialData) {
      setActivityName(initialData.activityName || "");
      setProductId(initialData.productId || "");
      setProductName(initialData.productName || "");
      setCategory(initialData.category || "Hair");
      setTimeOfDay(initialData.timeOfDay || "Morning");
      setInstructions(initialData.instructions || "");
      setScheduledDate(initialData.scheduledDate || new Date().toISOString().split("T")[0]);
      setNotes(initialData.notes || "");
    } else {
      setActivityName("");
      setProductId("");
      setProductName("");
      setCategory("Hair");
      setTimeOfDay("Morning");
      setInstructions("");
      setScheduledDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const selected = products.find((p) => p.id === id);
    if (selected) {
      setProductName(selected.name);
      setCategory(selected.category);
      if (selected.usageInstructions && !instructions) {
        setInstructions(selected.usageInstructions);
      }
    } else {
      setProductName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) {
      setError("Please provide an activity name (e.g. Apply 1ml Follicle Tonic)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        sessionId,
        activityName: activityName.trim(),
        productId: productId || undefined,
        productName: productName || undefined,
        category,
        timeOfDay,
        instructions: instructions.trim() || undefined,
        scheduledDate,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save routine");
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
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#17211D]">
              {initialData ? "Edit Routine Activity" : "Add Care Routine Activity"}
            </h2>
            <p className="text-xs text-[#75817A]">
              Schedule and organize your daily personal care step
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
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="e.g. Apply 1ml Scalp Hair Tonic"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                Related Product (Optional)
              </label>
              <select
                value={productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
              >
                <option value="">None / Custom Routine</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                Care Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
              >
                <option value="Hair">Hair Care</option>
                <option value="Beard">Beard Care</option>
                <option value="Skin">Skin Care</option>
                <option value="Wellness">General Wellness</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                Time of Day
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night (Bedtime)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                Scheduled Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
              Usage Instructions / Directions
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Apply directly with dropper to dry scalp. Gently massage."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
            />
            <p className="text-[10px] text-[#75817A] mt-1">
              Note: Clearly distinguishes user reminders from manufacturer instructions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
              Personal Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Keep next to toothbrush on bathroom counter"
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
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Routine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
