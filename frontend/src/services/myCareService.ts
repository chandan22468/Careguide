import { apiClient, getStoredBackendMode } from "./api.ts";
import { MyCareProduct, AddMyCarePayload, UpdateMyCarePayload } from "../types/product.ts";
import { mockStorage } from "./backendMockFallback.ts";

export const myCareService = {
  async getMyProducts(sessionId: string): Promise<MyCareProduct[]> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return mockStorage.getMyCare(sessionId);
    }

    try {
      const response = await apiClient.get<MyCareProduct[]>("/my-products", {
        params: { sessionId },
      });
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      return mockStorage.getMyCare(sessionId);
    }
  },

  async addProduct(payload: AddMyCarePayload): Promise<MyCareProduct> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const existing = mockStorage.getMyCare(payload.sessionId);
      const allProducts = mockStorage.getProducts();
      const product = allProducts.find((p) => p.id === payload.productId);

      const newItem: MyCareProduct = {
        id: `mycare-${Date.now()}`,
        sessionId: payload.sessionId,
        productId: payload.productId,
        product,
        status: payload.status || "active",
        startDate: new Date().toISOString().split("T")[0],
        personalNotes: payload.personalNotes || "",
        dosageSchedule: payload.dosageSchedule || "Daily as per instructions",
        createdAt: new Date().toISOString(),
      };
      existing.unshift(newItem);
      mockStorage.saveMyCare(payload.sessionId, existing);
      return newItem;
    }

    try {
      const response = await apiClient.post<MyCareProduct>("/my-products", payload);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const existing = mockStorage.getMyCare(payload.sessionId);
      const allProducts = mockStorage.getProducts();
      const product = allProducts.find((p) => p.id === payload.productId);

      const newItem: MyCareProduct = {
        id: `mycare-${Date.now()}`,
        sessionId: payload.sessionId,
        productId: payload.productId,
        product,
        status: payload.status || "active",
        startDate: new Date().toISOString().split("T")[0],
        personalNotes: payload.personalNotes || "",
        dosageSchedule: payload.dosageSchedule || "Daily as per instructions",
        createdAt: new Date().toISOString(),
      };
      existing.unshift(newItem);
      mockStorage.saveMyCare(payload.sessionId, existing);
      return newItem;
    }
  },

  async updateProduct(id: string, sessionId: string, updates: UpdateMyCarePayload): Promise<MyCareProduct> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const existing = mockStorage.getMyCare(sessionId);
      const index = existing.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Item not found in My Care");
      const updated = {
        ...existing[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      existing[index] = updated;
      mockStorage.saveMyCare(sessionId, existing);
      return updated;
    }

    try {
      const response = await apiClient.patch<MyCareProduct>(`/my-products/${id}`, updates);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const existing = mockStorage.getMyCare(sessionId);
      const index = existing.findIndex((item) => item.id === id);
      if (index !== -1) {
        existing[index] = { ...existing[index], ...updates, updatedAt: new Date().toISOString() };
        mockStorage.saveMyCare(sessionId, existing);
        return existing[index];
      }
      throw error;
    }
  },

  async removeProduct(id: string, sessionId: string): Promise<void> {
    const mode = getStoredBackendMode();
    if (mode !== "force_demo") {
      try {
        await apiClient.delete(`/my-products/${id}`);
      } catch (err) {
        if (mode === "force_live") throw err;
      }
    }
    const existing = mockStorage.getMyCare(sessionId);
    const filtered = existing.filter((item) => item.id !== id);
    mockStorage.saveMyCare(sessionId, filtered);
  },
};
