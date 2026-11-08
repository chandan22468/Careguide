import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HeartHandshake,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  ExternalLink,
  Search,
} from "lucide-react";
import { useSession } from "../context/SessionContext.tsx";
import { myCareService } from "../services/myCareService.ts";
import { productService } from "../services/productService.ts";
import { MyCareProduct, Product } from "../types/product.ts";
import { PageLoader } from "../components/common/LoadingSpinner.tsx";
import { StatusBadge, ConfirmDialog } from "../components/common/ConfirmDialog.tsx";
import { EmptyState } from "../components/common/ErrorState.tsx";
import { formatDateStr } from "../lib/utils.ts";

export const MyCarePage: React.FC = () => {
  const { sessionId } = useSession();

  const [items, setItems] = useState<MyCareProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "paused" | "discontinued">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [editingItem, setEditingItem] = useState<MyCareProduct | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "paused" | "discontinued">("active");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [careList, catalog] = await Promise.all([
        myCareService.getMyProducts(sessionId),
        productService.getProducts(),
      ]);
      setItems(careList);
      setAllProducts(catalog.products);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  const handleStatusChange = async (
    id: string,
    newStatus: "active" | "paused" | "discontinued"
  ) => {
    try {
      await myCareService.updateProduct(id, sessionId, { status: newStatus });
      await loadData();
    } catch {
      // handled
    }
  };

  const handleSaveNotes = async () => {
    if (!editingItem) return;
    try {
      await myCareService.updateProduct(editingItem.id, sessionId, {
        personalNotes: editNotes,
        status: editStatus,
      });
      setEditingItem(null);
      await loadData();
    } catch {
      // handled
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await myCareService.removeProduct(itemToDelete, sessionId);
      setItemToDelete(null);
      await loadData();
    } catch {
      // handled
    }
  };

  const handleAddProduct = async (product: Product) => {
    try {
      await myCareService.addProduct({
        sessionId,
        productId: product.id,
        status: "active",
        personalNotes: `Started ${product.name}`,
        dosageSchedule: product.usageInstructions?.slice(0, 50) || "Daily application",
      });
      setIsAddModalOpen(false);
      await loadData();
    } catch {
      // handled
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading your personal care shelf..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 px-3.5 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E7E2] p-4 sm:p-6 md:p-8 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#0F2E24] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-[#207D53]" />
            <span>My Daily Cabinet</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#131B17] tracking-tight">
            My Care Formulations
          </h1>
          <p className="text-xs text-[#6C7A72] mt-1">
            Keep active personal care items organised, track start dates, and log notes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2E24] text-white text-xs font-semibold hover:bg-[#0a2119] transition-colors shadow-2xs cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Shelf</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#EEF2EE] pb-2 overflow-x-auto">
        {(["all", "active", "paused", "discontinued"] as const).map((tab) => {
          const count =
            tab === "all" ? items.length : items.filter((i) => i.status === tab).length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#0F2E24] text-white shadow-2xs"
                  : "text-[#75817A] hover:text-[#17211D] hover:bg-gray-100"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Product List */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const product =
              item.product ||
              allProducts.find((p) => p.id === item.productId) || {
                name: "Care Product",
                category: "Care",
                imageUrl:
                  "https://i.mscwlns.co/media/misc/pdp_rcl/2025137/Combo-Kit_umbirx.png?tr=w-800",
                description: "",
              };

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#E7EBE7] p-6 shadow-2xs flex flex-col justify-between hover:border-[#183C32]/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 rounded-2xl object-contain p-1 bg-[#F8F9F6] border border-[#E7EBE7] shrink-0"
                    />
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={item.status} />
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setEditNotes(item.personalNotes || "");
                          setEditStatus(item.status);
                        }}
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-[#183C32] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit notes and status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item.id)}
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from shelf"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#183C32] bg-[#E7F1EB] px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>

                  <h3 className="font-bold text-sm text-[#17211D] mt-2 mb-1 leading-snug">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#75817A] mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Started: {formatDateStr(item.startDate)}</span>
                  </div>

                  {item.personalNotes && (
                    <p className="text-xs text-gray-600 bg-[#F8F9F6] p-3 rounded-2xl border border-[#E7EBE7]/80 leading-relaxed mb-4">
                      "{item.personalNotes}"
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E7EBE7] flex items-center justify-between gap-2">
                  {/* Status toggle shortcuts */}
                  <div className="flex items-center gap-1">
                    {item.status !== "active" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "active")}
                        type="button"
                        className="text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        Activate
                      </button>
                    )}
                    {item.status !== "paused" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "paused")}
                        type="button"
                        className="text-[11px] font-semibold text-amber-700 hover:underline ml-2"
                      >
                        Pause
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/discover/${item.productId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#183C32] hover:underline"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<HeartHandshake className="w-12 h-12" />}
          title="You haven't added any products yet"
          description="Explore our dermatologist-formulated solutions for hair, beard, skin, and wellness."
          actionLabel="Explore Products"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E7EBE7] relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setIsAddModalOpen(false)}
              type="button"
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-black rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#17211D] mb-1">
              Add Product to My Care
            </h3>
            <p className="text-xs text-[#75817A] mb-4">
              Select any product from the Man Matters catalogue to add to your routine.
            </p>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#75817A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E7EBE7] text-xs bg-[#F8F9F6] focus:outline-none focus:ring-2 focus:ring-[#183C32]/20"
              />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {allProducts
                .filter(
                  (p) =>
                    !searchProductQuery.trim() ||
                    p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchProductQuery.toLowerCase())
                )
                .map((p) => {
                  const isAlreadyAdded = items.some((item) => item.productId === p.id);
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl border border-[#E7EBE7] flex items-center justify-between gap-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-contain bg-white border border-[#E7EBE7]"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#17211D]">{p.name}</h4>
                          <span className="text-[10px] text-[#75817A]">{p.category} Care</span>
                        </div>
                      </div>

                      {isAlreadyAdded ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                          On Shelf
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddProduct(p)}
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl bg-[#183C32] text-white text-xs font-semibold hover:bg-[#122e26] transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Edit Notes & Status Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E7EBE7] relative">
            <button
              onClick={() => setEditingItem(null)}
              type="button"
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-black rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#17211D] mb-4">
              Edit Product Notes & Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                  Current Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as "active" | "paused" | "discontinued")
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E7EBE7] text-xs bg-[#F8F9F6]"
                >
                  <option value="active">Active (Currently using)</option>
                  <option value="paused">Paused (Temporarily on hold)</option>
                  <option value="discontinued">Discontinued (Finished or stopped)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                  Personal Usage Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Apply 1ml nightly on temples. Mix with 2 drops carrier oil."
                  className="w-full p-2.5 rounded-xl border border-[#E7EBE7] text-xs bg-[#F8F9F6] focus:outline-none focus:ring-2 focus:ring-[#183C32]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#183C32]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Remove Product from Shelf?"
        description="This will remove this product from your active shelf. You can add it back anytime from the catalogue."
        confirmLabel="Remove Product"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
