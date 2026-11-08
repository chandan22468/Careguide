import { apiClient, getStoredBackendMode } from "./api.ts";
import { Order } from "../types/order.ts";
import { DEMO_ORDERS } from "./backendMockFallback.ts";

export const orderService = {
  async getOrderById(orderId: string): Promise<Order> {
    const cleanId = orderId.trim().toUpperCase();
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const match = DEMO_ORDERS.find(
        (o) =>
          o.orderNumber.toUpperCase() === cleanId ||
          o.id.toUpperCase() === cleanId
      );
      if (!match) {
        throw new Error(`Order #${orderId} was not found. Please verify the order number (e.g. MM-84920 or MM-91042).`);
      }
      return match;
    }

    try {
      const response = await apiClient.get<Order>(`/orders/${encodeURIComponent(orderId)}`);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const match = DEMO_ORDERS.find(
        (o) =>
          o.orderNumber.toUpperCase() === cleanId ||
          o.id.toUpperCase() === cleanId
      );
      if (match) return match;
      throw error;
    }
  },

  getSampleOrders(): Order[] {
    return DEMO_ORDERS;
  },
};
