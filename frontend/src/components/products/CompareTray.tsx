import React from "react";
import { Link } from "react-router-dom";
import { Scale, X, ArrowRight } from "lucide-react";
import { Product } from "../../types/product.ts";

interface CompareTrayProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export const CompareTray: React.FC<CompareTrayProps> = ({
  products,
  onRemove,
  onClear,
}) => {
  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-[4.5rem] md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-2xl border border-[#E2E7E2] animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Info & items preview */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#0F2E24] shrink-0 pr-2 border-r border-[#EEF2EE]">
            <Scale className="w-4 h-4 text-[#0F2E24]" />
            <span>Compare ({products.length}/3)</span>
          </div>

          <div className="flex items-center gap-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-[#F7F8F5] border border-[#E2E7E2] text-xs font-medium shrink-0"
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-6 h-6 rounded-md object-contain bg-white p-0.5"
                />
                <span className="max-w-[110px] truncate text-[11px] font-semibold text-[#131B17]">
                  {p.name}
                </span>
                <button
                  onClick={() => onRemove(p.id)}
                  type="button"
                  className="text-[#6C7A72] hover:text-rose-600 p-0.5 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            type="button"
            className="text-[11px] text-[#6C7A72] hover:text-[#131B17] px-2 py-1 font-semibold hidden sm:inline cursor-pointer"
          >
            Clear
          </button>
          <Link
            to={`/compare?ids=${products.map((p) => p.id).join(",")}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F2E24] text-white text-xs font-semibold hover:bg-[#0a2119] transition-all shadow-xs"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
