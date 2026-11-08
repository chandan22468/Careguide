import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  DEFAULT_BACKEND_URL,
  getStoredBackendUrl,
  setStoredBackendUrl,
  getStoredBackendMode,
  setStoredBackendMode,
  testBackendConnection,
} from "../services/api.ts";
import { ConnectionStatus } from "../types/backend.ts";

interface BackendConfigContextValue {
  baseUrl: string;
  mode: "auto" | "force_live" | "force_demo";
  status: ConnectionStatus;
  latencyMs: number | null;
  errorMessage: string | null;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  updateUrl: (url: string) => void;
  updateMode: (mode: "auto" | "force_live" | "force_demo") => void;
  pingBackend: (targetUrl?: string) => Promise<{ success: boolean; latencyMs: number; error?: string }>;
  resetToDefaultUrl: () => void;
}

const BackendConfigContext = createContext<BackendConfigContextValue | undefined>(undefined);

export const BackendConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseUrl, setBaseUrlState] = useState<string>(getStoredBackendUrl());
  const [mode, setModeState] = useState<"auto" | "force_live" | "force_demo">(getStoredBackendMode());
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const pingBackend = useCallback(async (targetUrl?: string) => {
    setStatus("checking");
    const testUrl = targetUrl || baseUrl;
    const result = await testBackendConnection(testUrl);
    if (result.success) {
      setStatus("connected");
      setLatencyMs(result.latencyMs);
      setErrorMessage(null);
    } else {
      setStatus("offline");
      setLatencyMs(null);
      setErrorMessage(result.error || "Could not reach FastAPI backend");
    }
    return result;
  }, [baseUrl]);

  useEffect(() => {
    // Initial ping on load
    pingBackend();
  }, [pingBackend]);

  const updateUrl = (newUrl: string) => {
    setStoredBackendUrl(newUrl);
    setBaseUrlState(newUrl);
    pingBackend(newUrl);
  };

  const updateMode = (newMode: "auto" | "force_live" | "force_demo") => {
    setStoredBackendMode(newMode);
    setModeState(newMode);
  };

  const resetToDefaultUrl = () => {
    updateUrl(DEFAULT_BACKEND_URL);
  };

  return (
    <BackendConfigContext.Provider
      value={{
        baseUrl,
        mode,
        status,
        latencyMs,
        errorMessage,
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        updateUrl,
        updateMode,
        pingBackend,
        resetToDefaultUrl,
      }}
    >
      {children}
    </BackendConfigContext.Provider>
  );
};

export function useBackendConfig(): BackendConfigContextValue {
  const context = useContext(BackendConfigContext);
  if (!context) {
    throw new Error("useBackendConfig must be used within a BackendConfigProvider");
  }
  return context;
}
