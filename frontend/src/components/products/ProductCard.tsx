import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check, Scale, Star, ArrowRight } from "lucide-react";
import { Product } from "../../types/product.ts";
import { formatCurrencyINR } from "../../lib/utils.ts";
import { myCareService } from "../../services/myCareService.ts";
import { useSession } from "../../context/SessionContext.tsx";

interface ProductCardProps {
  product: Product;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
  onAddedToCare?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isCompared = false,
  onToggleCompare,
  onAddedToCare,
}) => {
  const { sessionId } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToMyCare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding || isAdded) return;

    setIsAdding(true);
    try {
      await myCareService.addProduct({
        sessionId,
        productId: product.id,
        status: "active",
        personalNotes: "Added from catalogue.",
      });
      setIsAdded(true);
      if (onAddedToCare) onAddedToCare();
      setTimeout(() => setIsAdded(false), 2500);
    } catch {
      // handled
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group rounded-2xl bg-white border border-[#E2E7E2] overflow-hidden hover:border-[#0F2E24]/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Studio Product Image Container */}
        <div className="relative aspect-square w-full bg-[#F6F7F4] overflow-hidden p-6 flex items-center justify-center border-b border-[#EEF2EE]">
          <img
            src={product.imageUrl || "https://i.mscwlns.co/media/misc/pdp_rcl/2025137/Combo-Kit_umbirx.png?tr=w-800"}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Minimalist Editorial Tag */}
          {product.tag && (
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#0F2E24] text-white text-[9px] font-semibold tracking-wider uppercase">
              {product.tag}
            </div>
          )}

          {/* Compare Toggle Button */}
          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare(product);
              }}
              type="button"
              className={`absolute top-3 right-3 p-1.5 rounded-lg border transition-all text-xs cursor-pointer ${
                isCompared
                  ? "bg-[#0F2E24] text-white border-[#0F2E24]"
                  : "bg-white/90 text-[#6C7A72] border-[#E2E7E2] hover:text-[#131B17] hover:bg-white"
              }`}
              title={isCompared ? "Remove from comparison" : "Compare formulation"}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Unboxed Kicker & Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#0F2E24] tracking-wider uppercase mb-1.5">
            <span>{product.category} Care</span>
            {product.rating && (
              <div className="flex items-center gap-1 text-[#131B17] normal-case tabular-nums font-medium">
                <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                <span className="font-semibold">{product.rating}</span>
                {product.ratingCount && (
                  <span className="text-[#6C7A72]">({product.ratingCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link
            to={`/discover/${product.id}`}
            className="block text-sm font-bold text-[#131B17] hover:text-[#0F2E24] transition-colors leading-snug line-clamp-2 mb-2"
          >
            {product.name}
          </Link>

          {/* Product description */}
          <p className="text-xs text-[#6C7A72] line-clamp-2 leading-relaxed mb-3">
            {product.shortDescription || product.description}
          </p>

          {/* Active Ingredients (Unboxed with hairline separators) */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="text-[11px] text-[#6C7A72] truncate pt-1 border-t border-[#EEF2EE]">
              <span className="font-semibold text-[#131B17]">Actives:</span>{" "}
              {product.ingredients.slice(0, 3).join(" · ")}
              {product.ingredients.length > 3 && (
                <span className="text-[#6C7A72]"> +{product.ingredients.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Price & Add to Care */}
      <div className="px-5 py-4 border-t border-[#EEF2EE] bg-[#FCFDFC] flex items-center justify-between gap-3">
        <div className="tabular-nums">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-[#131B17]">
              {formatCurrencyINR(product.price)}
            </span>
            {product.originalPrice && product.price !== undefined && product.originalPrice > product.price && (
              <span className="text-xs text-[#6C7A72] line-through">
                {formatCurrencyINR(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#207D53] font-semibold uppercase tracking-wider block">
            Catalogue Item
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            to={`/discover/${product.id}`}
            className="p-2 rounded-xl text-[#6C7A72] hover:text-[#131B17] hover:bg-gray-100 transition-colors"
            title="Inspect formulation"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleAddToMyCare}
            disabled={isAdding}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isAdded
                ? "bg-[#207D53] text-white"
                : "bg-[#0F2E24] text-white hover:bg-[#0a2119] active:scale-95"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>In Care</span>
              </>
            ) : isAdding ? (
              <span>Adding...</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Care</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
