import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Compass, Sparkles, Filter } from "lucide-react";
import { productService } from "../services/productService.ts";
import { Product } from "../types/product.ts";
import { ProductCard } from "../components/products/ProductCard.tsx";
import { CompareTray } from "../components/products/CompareTray.tsx";
import { PageLoader } from "../components/common/LoadingSpinner.tsx";
import { EmptyState } from "../components/common/ErrorState.tsx";

const CATEGORIES = ["All", "Hair", "Beard", "Skin", "Wellness"];

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("featured");
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        const res = await productService.getProducts({
          category: category !== "All" ? category : undefined,
          search: search.trim() || undefined,
          sort: sortBy,
        });
        setProducts(res.products);
        setTotal(res.total);
      } catch {
        setProducts([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCatalog();
    }, 180);

    return () => clearTimeout(timer);
  }, [category, search, sortBy]);

  const handleToggleCompare = (product: Product) => {
    setComparedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
  };

  const handleRemoveCompare = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 px-3.5 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E7E2] p-4 sm:p-6 md:p-8 shadow-2xs">
        <div className="max-w-2xl space-y-1.5 sm:space-y-2">
          <div className="text-[10px] sm:text-[11px] font-bold text-[#0F2E24] uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#0F2E24]" />
            <span>CareGuide Catalogue · Man Matters</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#131B17] tracking-tight">
            Explore Care Solutions
          </h1>
          <p className="text-xs text-[#6C7A72] leading-relaxed">
            Browse the existing demo catalogue by product, ingredient, or care category. Confirm product details with the official source before use.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 sm:mt-6 flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between pt-4 sm:pt-6 border-t border-[#EEF2EE]">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#6C7A72] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ingredient, concern, or name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E2E7E2] bg-[#F7F8F5] text-xs text-[#131B17] placeholder:text-[#6C7A72] focus:outline-none focus:bg-white focus:border-[#0F2E24] focus:ring-1 focus:ring-[#0F2E24]/20"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6C7A72] font-semibold whitespace-nowrap">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-[#E2E7E2] bg-[#F7F8F5] text-xs font-semibold text-[#131B17] focus:outline-none focus:bg-white focus:border-[#0F2E24]"
            >
              <option value="featured">Featured Formulations</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Clinically Rated</option>
            </select>
          </div>
        </div>

        {/* Category Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 sm:pt-4 scrollbar-none pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                category === cat
                  ? "bg-[#0F2E24] text-white shadow-2xs"
                  : "bg-[#F7F8F5] text-[#6C7A72] hover:text-[#131B17] hover:bg-gray-100 border border-[#E2E7E2]"
              }`}
            >
              {cat === "All" ? "All Formulations" : `${cat} Care`}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid Area */}
      {isLoading ? (
        <PageLoader message="Loading product catalogue..." />
      ) : products.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-[#6C7A72] px-1 font-medium">
            <span>
              Showing {products.length} of {total} catalogue products
            </span>
            {comparedProducts.length > 0 && (
              <span className="text-[#0F2E24] font-semibold">
                {comparedProducts.length} selected for comparison
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isCompared={comparedProducts.some((p) => p.id === product.id)}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Compass className="w-12 h-12" />}
          title="No products matched your criteria"
          description="Try broadening your search term or selecting a different category filter."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch("");
            setCategory("All");
          }}
        />
      )}

      {/* Floating Compare Dock */}
      <CompareTray
        products={comparedProducts}
        onRemove={handleRemoveCompare}
        onClear={() => setComparedProducts([])}
      />
    </div>
  );
};
