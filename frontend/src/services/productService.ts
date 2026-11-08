import { apiClient, getStoredBackendMode } from "./api.ts";
import { Product } from "../types/product.ts";
import { mockStorage } from "./backendMockFallback.ts";

export interface GetProductsParams {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  async getProducts(params?: GetProductsParams): Promise<{ products: Product[]; total: number }> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      return this.getLocalProducts(params);
    }

    try {
      const response = await apiClient.get<any>("/products", { params });
      // Handle both { products: [], total: 10 } and raw []
      const data = response.data;
      if (Array.isArray(data)) {
        return { products: data, total: data.length };
      }
      return {
        products: data.products || data.items || [],
        total: data.total || (data.products ? data.products.length : 0),
      };
    } catch (error) {
      if (mode === "force_live") throw error;
      return this.getLocalProducts(params);
    }
  },

  async getProductById(id: string): Promise<Product> {
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const p = mockStorage.getProducts().find((item) => item.id === id);
      if (!p) throw new Error("Product not found");
      return p;
    }

    try {
      const response = await apiClient.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const p = mockStorage.getProducts().find((item) => item.id === id);
      if (p) return p;
      throw error;
    }
  },

  async compareProducts(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];
    const mode = getStoredBackendMode();
    if (mode === "force_demo") {
      const all = mockStorage.getProducts();
      return all.filter((p) => ids.includes(p.id));
    }

    try {
      const response = await apiClient.get<Product[]>("/products/compare", {
        params: { ids: ids.join(",") },
      });
      return response.data;
    } catch (error) {
      if (mode === "force_live") throw error;
      const all = mockStorage.getProducts();
      return all.filter((p) => ids.includes(p.id));
    }
  },

  getLocalProducts(params?: GetProductsParams): { products: Product[]; total: number } {
    let items = mockStorage.getProducts();

    if (params?.category && params.category !== "All") {
      items = items.filter(
        (p) => p.category.toLowerCase() === params.category!.toLowerCase()
      );
    }

    if (params?.search) {
      const query = params.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.ingredients.some((ing) => ing.toLowerCase().includes(query))
      );
    }

    if (params?.sort) {
      if (params.sort === "name_asc") {
        items.sort((a, b) => a.name.localeCompare(b.name));
      } else if (params.sort === "price_asc") {
        items.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (params.sort === "price_desc") {
        items.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else if (params.sort === "rating") {
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
    }

    return {
      products: items,
      total: items.length,
    };
  },
};
