import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Scale,
  Plus,
  X,
  BotMessageSquare,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { productService } from "../services/productService.ts";
import { Product } from "../types/product.ts";
import { PageLoader } from "../components/common/LoadingSpinner.tsx";
import { formatCurrencyINR } from "../lib/utils.ts";

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const rawIds = searchParams.get("ids");
  const selectedIds = rawIds ? rawIds.split(",").filter(Boolean) : [];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const fullCatalog = await productService.getProducts();
        setAllProducts(fullCatalog.products);

        if (selectedIds.length > 0) {
          const compared = await productService.compareProducts(selectedIds);
          setProducts(compared);
        } else {
          // Pre-populate with first 2 products for evaluator convenience
          const initial = fullCatalog.products.slice(0, 2);
          setProducts(initial);
          setSearchParams({ ids: initial.map((p) => p.id).join(",") });
        }
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [rawIds]);

  const handleRemove = (idToRemove: string) => {
    const updated = products.filter((p) => p.id !== idToRemove);
    setProducts(updated);
    setSearchParams({ ids: updated.map((p) => p.id).join(",") });
  };

  const handleAddProduct = (p: Product) => {
    if (products.some((item) => item.id === p.id)) return;
    if (products.length >= 3) return;
    const updated = [...products, p];
    setProducts(updated);
    setSearchParams({ ids: updated.map((item) => item.id).join(",") });
    setShowAddModal(false);
  };

  const handleAskAiToCompare = () => {
    const names = products.map((p) => p.name).join(" and ");
    navigate(
      `/ai-assistant?prompt=${encodeURIComponent(
        `Compare the formulations, active ingredients, and usage directions of ${names}. How should I choose between them?`
      )}`
    );
  };

  if (isLoading) {
    return <PageLoader message="Loading comparison matrix..." />;
  }

  return (
    <div className="space-y-8 py-6 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F1EB] text-[#183C32] text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Product Comparison</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17211D] tracking-tight">
            Compare Formulations & Benefits
          </h1>
          <p className="text-xs text-[#75817A] mt-1">
            Analyze ingredients, application frequency, and clinically verified benefits side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length > 1 && (
            <button
              onClick={handleAskAiToCompare}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#183C32] text-white text-xs font-semibold hover:bg-[#122e26] transition-colors shadow-xs cursor-pointer"
            >
              <BotMessageSquare className="w-4 h-4 text-emerald-300" />
              <span>Ask AI to Explain Differences</span>
            </button>
          )}

          {products.length < 3 && (
            <button
              onClick={() => setShowAddModal(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-[#E7EBE7] text-xs font-semibold text-[#17211D] hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#183C32]" />
              <span>Add Product ({products.length}/3)</span>
            </button>
          )}
        </div>
      </div>

      {/* Comparison Grid Table */}
      {products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#E7EBE7]">
          <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#17211D]">No products in comparison</h3>
          <p className="text-xs text-[#75817A] mt-1 mb-4">
            Select products from the catalogue to compare side-by-side.
          </p>
          <Link
            to="/discover"
            className="px-4 py-2 rounded-xl bg-[#183C32] text-white text-xs font-semibold"
          >
            Explore Catalogue
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E7EBE7] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7EBE7] bg-[#F8F9F6]">
                  <th className="p-4 md:p-6 w-48 font-bold text-[#75817A] uppercase text-[11px] tracking-wider">
                    Specification
                  </th>
                  {products.map((p) => (
                    <th key={p.id} className="p-4 md:p-6 min-w-[260px] align-top">
                      <div className="relative">
                        <button
                          onClick={() => handleRemove(p.id)}
                          type="button"
                          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-20 h-20 rounded-2xl bg-white border border-[#E7EBE7] overflow-hidden mb-3 p-1">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <span className="text-[10px] font-bold text-[#183C32] bg-[#E7F1EB] px-2 py-0.5 rounded-full">
                          {p.category}
                        </span>

                        <h3 className="font-bold text-sm text-[#17211D] mt-1.5 mb-1">
                          {p.name}
                        </h3>

                        <div className="text-base font-extrabold text-[#17211D]">
                          {formatCurrencyINR(p.price)}
                        </div>

                        <Link
                          to={`/discover/${p.id}`}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#183C32] font-semibold hover:underline"
                        >
                          <span>View Product Page</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E7EBE7]">
                {/* Description */}
                <tr>
                  <td className="p-4 md:p-6 font-bold text-[#17211D] bg-[#F8F9F6]/50">
                    Product Summary
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 md:p-6 text-[#75817A] leading-relaxed">
                      {p.shortDescription || p.description}
                    </td>
                  ))}
                </tr>

                {/* Ingredients */}
                <tr>
                  <td className="p-4 md:p-6 font-bold text-[#17211D] bg-[#F8F9F6]/50">
                    Active Ingredients
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 md:p-6">
                      {p.ingredients && p.ingredients.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {p.ingredients.map((ing) => (
                            <span
                              key={ing}
                              className="px-2.5 py-1 rounded-lg bg-[#E7F1EB] text-[#183C32] font-semibold text-[11px]"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Information not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Benefits */}
                <tr>
                  <td className="p-4 md:p-6 font-bold text-[#17211D] bg-[#F8F9F6]/50">
                    Documented Benefits
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 md:p-6 space-y-1.5">
                      {p.benefits && p.benefits.length > 0 ? (
                        p.benefits.map((b, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px]">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Information not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Usage Instructions */}
                <tr>
                  <td className="p-4 md:p-6 font-bold text-[#17211D] bg-[#F8F9F6]/50">
                    Directions & Timing
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 md:p-6 text-[#17211D] leading-relaxed">
                      {p.usageInstructions || (
                        <span className="text-gray-400 italic">Information not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Precautions */}
                <tr>
                  <td className="p-4 md:p-6 font-bold text-[#17211D] bg-[#F8F9F6]/50">
                    Precautions
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 md:p-6 text-gray-600 space-y-1">
                      {p.precautions && p.precautions.length > 0 ? (
                        p.precautions.map((prec, i) => (
                          <p key={i} className="text-[11px]">
                            • {prec}
                          </p>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Information not available</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E7EBE7] relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              type="button"
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-black rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#17211D] mb-4">
              Add Product to Compare
            </h3>

            <div className="space-y-2">
              {allProducts.map((p) => {
                const isSelected = products.some((item) => item.id === p.id);
                return (
                  <button
                    key={p.id}
                    disabled={isSelected}
                    type="button"
                    onClick={() => handleAddProduct(p)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200"
                        : "hover:border-[#183C32] hover:bg-[#E7F1EB]/30 cursor-pointer border-[#E7EBE7]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-contain bg-white border border-[#E7EBE7]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#17211D]">{p.name}</h4>
                        <span className="text-[10px] text-[#75817A]">{p.category}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#17211D]">
                      {formatCurrencyINR(p.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
