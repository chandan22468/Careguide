import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { orderService } from "../services/orderService.ts";
import { Order, OrderStatus } from "../types/order.ts";
import { StatusBadge } from "../components/common/ConfirmDialog.tsx";
import { formatCurrencyINR, formatDateStr } from "../lib/utils.ts";

const TIMELINE_STEPS: OrderStatus[] = [
  "Placed",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export const OrdersPage: React.FC = () => {
  const [searchId, setSearchId] = useState("MM-84920");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sampleOrders = orderService.getSampleOrders();

  const handleLookup = async (idToSearch?: string) => {
    const target = idToSearch || searchId;
    if (!target.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await orderService.getOrderById(target.trim());
      setOrder(data);
    } catch (err: unknown) {
      setOrder(null);
      setError(
        err instanceof Error
          ? err.message
          : `Order #${target} was not found. Try sample orders MM-84920 or MM-91042.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch of default sample order
    handleLookup("MM-84920");
  }, []);

  const getStepStatus = (step: OrderStatus, currentStatus: OrderStatus) => {
    const orderIndex = TIMELINE_STEPS.indexOf(currentStatus);
    const stepIndex = TIMELINE_STEPS.indexOf(step);
    if (stepIndex < orderIndex) return "completed";
    if (stepIndex === orderIndex) return "active";
    return "upcoming";
  };

  return (
    <div className="space-y-8 py-6 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F1EB] text-[#183C32] text-xs font-bold uppercase tracking-wider">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Orders & Deliveries</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17211D] tracking-tight">
            Order Status Lookup
          </h1>
          <p className="text-xs text-[#75817A] leading-relaxed">
            View order status, tracking timelines, and package contents associated with your demo session.
          </p>
        </div>

        {/* Search input form */}
        <div className="mt-6 pt-6 border-t border-[#E7EBE7] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#75817A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter order ID (e.g. MM-84920)"
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-[#E7EBE7] bg-[#F8F9F6] text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleLookup()}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-2xl bg-[#183C32] text-white text-xs font-bold hover:bg-[#122e26] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Looking up..." : "Track Order"}
          </button>
        </div>

        {/* Quick sample chips */}
        <div className="flex items-center gap-2 mt-3 text-xs text-[#75817A]">
          <span>Try sample orders:</span>
          {sampleOrders.map((so) => (
            <button
              key={so.orderNumber}
              type="button"
              onClick={() => {
                setSearchId(so.orderNumber);
                handleLookup(so.orderNumber);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#F8F9F6] border border-[#E7EBE7] text-[11px] font-mono text-[#183C32] hover:bg-[#E7F1EB] font-bold"
            >
              {so.orderNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Error state if order not found */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Details View */}
      {order && (
        <div className="space-y-6 animate-in fade-in">
          {/* Order Meta Card */}
          <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7EBE7] pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-[#17211D]">
                    Order #{order.orderNumber}
                  </h2>
                  {order.isDemo && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                      Demo Order Data
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#75817A] mt-1">
                  Placed on {formatDateStr(order.orderDate)} · Total:{" "}
                  <strong className="text-[#17211D]">
                    {formatCurrencyINR(order.totalAmount)}
                  </strong>
                </p>
              </div>

              <StatusBadge status={order.status} className="text-xs px-3 py-1" />
            </div>

            {/* Status Timeline */}
            <div className="py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#75817A] block mb-4">
                Delivery Timeline
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {TIMELINE_STEPS.map((step, idx) => {
                  const stepState = getStepStatus(step, order.status);
                  return (
                    <div
                      key={step}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        stepState === "completed"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                          : stepState === "active"
                          ? "bg-[#183C32] border-[#183C32] text-white shadow-xs font-bold"
                          : "bg-[#F8F9F6] border-[#E7EBE7] text-gray-400"
                      }`}
                    >
                      <div className="text-sm mb-1">
                        {stepState === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-600" />
                        ) : stepState === "active" ? (
                          <Truck className="w-4 h-4 mx-auto text-emerald-300" />
                        ) : (
                          <Clock className="w-4 h-4 mx-auto" />
                        )}
                      </div>
                      <span className="text-xs block leading-tight">{step}</span>
                    </div>
                  );
                })}
              </div>

              {order.estimatedDelivery && (
                <div className="mt-4 flex items-center gap-2 text-xs text-[#183C32] font-semibold bg-[#E7F1EB] p-3 rounded-2xl border border-emerald-200">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>
                    Estimated Delivery by:{" "}
                    <strong>{formatDateStr(order.estimatedDelivery)}</strong>
                  </span>
                  {order.trackingNumber && (
                    <span className="ml-auto text-[11px] font-mono text-[#75817A]">
                      Track: {order.trackingNumber}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="flex items-start gap-2.5 text-xs text-[#75817A] bg-[#F8F9F6] p-4 rounded-2xl border border-[#E7EBE7]">
                <MapPin className="w-4 h-4 text-[#183C32] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#17211D] block">
                    Shipping Address:
                  </span>
                  <span>{order.shippingAddress}</span>
                </div>
              </div>
            )}
          </div>

          {/* Items in Order */}
          <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#17211D]">
              Items in This Shipment ({order.items.length})
            </h3>

            <div className="divide-y divide-[#E7EBE7]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1608248597359-0a5639149021?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={item.productName}
                      className="w-12 h-12 rounded-xl object-contain bg-[#F8F9F6] border border-[#E7EBE7]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#17211D]">
                        {item.productName}
                      </h4>
                      <span className="text-[11px] text-[#75817A]">
                        Qty: {item.quantity} · {formatCurrencyINR(item.price)} each
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-[#17211D]">
                    {formatCurrencyINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
