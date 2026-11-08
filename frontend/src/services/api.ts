import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { BackendConfig, ConnectionStatus } from "../types/backend.ts";

export const DEFAULT_BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.BACKEND_URL ||
  "/api";

const STORAGE_KEY_BASE_URL = "careguide_backend_url";
const STORAGE_KEY_MODE = "careguide_backend_mode"; // 'auto' | 'force_live' | 'force_demo'

export function getStoredBackendUrl(): string {
  const stored = localStorage.getItem(STORAGE_KEY_BASE_URL);
  if (stored && (stored.includes("localhost:8000") || stored.includes("127.0.0.1:8000") || stored === "/api/v1")) {
    localStorage.removeItem(STORAGE_KEY_BASE_URL);
    return DEFAULT_BACKEND_URL;
  }
  return stored || DEFAULT_BACKEND_URL;
}

export function setStoredBackendUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_BASE_URL, url.trim().replace(/\/$/, ""));
  apiClient.defaults.baseURL = url.trim().replace(/\/$/, "");
}

export function getStoredBackendMode(): "auto" | "force_live" | "force_demo" {
  return "force_live";
}

export function setStoredBackendMode(_mode: "auto" | "force_live" | "force_demo"): void {
  localStorage.setItem(STORAGE_KEY_MODE, "force_live");
}

// Create configured Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: getStoredBackendUrl(),
  timeout: 8000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: attach session ID if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }
    const sessionId = localStorage.getItem("careguide_session_id");
    if (sessionId && config.headers) {
      config.headers["X-Session-ID"] = sessionId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standardized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Return structured message
    const message =
      (error.response?.data as { detail?: string; message?: string })?.detail ||
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "An unexpected error occurred with the backend.";

    return Promise.reject(new Error(message));
  }
);

// Quick ping / health checker for testing connectivity to FastAPI backend
export async function testBackendConnection(
  testUrl?: string
): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  const target = (testUrl || getStoredBackendUrl()).replace(/\/$/, "");
  const startTime = performance.now();
  try {
    // Try pinging the base endpoint or products
    await axios.get(`${target}/products`, {
      timeout: 3500,
      headers: { Accept: "application/json" },
    });
    const latencyMs = Math.round(performance.now() - startTime);
    return { success: true, latencyMs };
  } catch (err: unknown) {
    const axiosErr = err as AxiosError;
    // Even if it returns 404 or 401 or 422, the server IS responding!
    if (axiosErr.response) {
      const latencyMs = Math.round(performance.now() - startTime);
      return { success: true, latencyMs };
    }
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs,
      error: axiosErr.message || "Failed to reach backend server.",
    };
  }
}
