import React, { useState } from "react";
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ExternalLink,
  Code2,
  Terminal,
  Zap,
} from "lucide-react";
import { useBackendConfig } from "../../context/BackendConfigContext.tsx";

export const BackendConnectModal: React.FC = () => {
  const {
    baseUrl,
    mode,
    status,
    latencyMs,
    errorMessage,
    isModalOpen,
    closeModal,
    updateUrl,
    updateMode,
    pingBackend,
    resetToDefaultUrl,
  } = useBackendConfig();

  const [inputUrl, setInputUrl] = useState<string>(baseUrl);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    latencyMs: number;
    error?: string;
  } | null>(null);

  if (!isModalOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await pingBackend(inputUrl);
    setTestResult({
      tested: true,
      success: res.success,
      latencyMs: res.latencyMs,
      error: res.error,
    });
    setIsTesting(false);
  };

  const handleSaveAndConnect = () => {
    updateUrl(inputUrl);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-[#E7EBE7] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          type="button"
          className="absolute right-5 top-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F1EB] flex items-center justify-center text-[#183C32] shadow-xs">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#17211D]">Backend Connection Hub</h2>
            <p className="text-xs text-[#75817A]">
              Connect CareGuide to your Python FastAPI backend server
            </p>
          </div>
        </div>

        {/* Current Connection Status Banner */}
        <div
          className={`p-4 rounded-2xl border mb-6 flex items-start gap-3 ${
            status === "connected"
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : status === "checking"
              ? "bg-blue-50/70 border-blue-200 text-blue-900"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
        >
          {status === "connected" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : status === "checking" ? (
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}

          <div className="text-xs">
            <div className="font-semibold flex items-center gap-2">
              <span>
                {status === "connected"
                  ? "FastAPI Backend Connected"
                  : status === "checking"
                  ? "Testing Connection..."
                  : "FastAPI Backend Offline (Running in Local Demo Mode)"}
              </span>
              {latencyMs !== null && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                  {latencyMs}ms
                </span>
              )}
            </div>
            <p className="mt-1 opacity-90 leading-relaxed">
              {status === "connected"
                ? `All requests are routing directly to: ${baseUrl}`
                : "The frontend is currently using the built-in CareGuide engine with realistic representative catalog data. As soon as your FastAPI server is running, CareGuide connects seamlessly!"}
            </p>
          </div>
        </div>

        {/* URL Configuration Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
              FastAPI Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="/api"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#183C32]/20 focus:border-[#183C32] bg-[#F8F9F6]"
              />
              <button
                onClick={handleTest}
                disabled={isTesting}
                type="button"
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-[#17211D] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                Test
              </button>
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[11px] text-[#75817A]">
                Default: <code className="font-mono">/api</code>
              </span>
              <button
                type="button"
                onClick={() => {
                  setInputUrl("/api");
                  resetToDefaultUrl();
                }}
                className="text-[11px] text-[#183C32] hover:underline font-medium"
              >
                Reset to default
              </button>
            </div>
          </div>

          {/* Test Result feedback */}
          {testResult?.tested && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Successfully reached backend in <strong>{testResult.latencyMs}ms</strong>!
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Failed to connect: {testResult.error || "Connection refused"}. Ensure FastAPI is running on that port.
                  </span>
                </>
              )}
            </div>
          )}

          {/* Execution Mode */}
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-2">
              Operation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateMode("auto")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === "auto"
                    ? "border-[#183C32] bg-[#E7F1EB]/50 text-[#183C32] font-semibold"
                    : "border-[#E7EBE7] bg-white text-[#75817A] hover:bg-gray-50"
                }`}
              >
                <div className="text-xs flex items-center gap-1.5 mb-1 font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  Auto Hybrid
                </div>
                <div className="text-[10px] leading-tight opacity-80">
                  Connects to FastAPI, auto-falls back to demo if offline
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateMode("force_live")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === "force_live"
                    ? "border-[#183C32] bg-[#E7F1EB]/50 text-[#183C32] font-semibold"
                    : "border-[#E7EBE7] bg-white text-[#75817A] hover:bg-gray-50"
                }`}
              >
                <div className="text-xs flex items-center gap-1.5 mb-1 font-semibold">
                  <Server className="w-3.5 h-3.5" />
                  Strict Live
                </div>
                <div className="text-[10px] leading-tight opacity-80">
                  Strictly requires FastAPI backend responses
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateMode("force_demo")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === "force_demo"
                    ? "border-[#183C32] bg-[#E7F1EB]/50 text-[#183C32] font-semibold"
                    : "border-[#E7EBE7] bg-white text-[#75817A] hover:bg-gray-50"
                }`}
              >
                <div className="text-xs flex items-center gap-1.5 mb-1 font-semibold">
                  <Code2 className="w-3.5 h-3.5" />
                  Demo Mode
                </div>
                <div className="text-[10px] leading-tight opacity-80">
                  Use built-in offline engine with representative data
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Guide for the User's FastAPI Backend */}
        <div className="p-4 rounded-2xl bg-gray-900 text-gray-200 text-xs mb-6">
          <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>FastAPI Server Command:</span>
          </div>
          <pre className="font-mono text-[11px] bg-black/40 p-2.5 rounded-lg text-emerald-300 overflow-x-auto select-all">
            uvicorn main:app --reload --host 0.0.0.0 --port 8000
          </pre>
          <p className="text-[11px] text-gray-400 mt-2">
            Make sure CORS in FastAPI allows requests from this frontend applet origin.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={closeModal}
            type="button"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#17211D] bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndConnect}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-[#183C32] text-white text-xs font-semibold hover:bg-[#122e26] transition-colors shadow-xs cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export const BackendStatusBadge: React.FC = () => {
  const { status, latencyMs, openModal, mode } = useBackendConfig();

  return (
    <button
      onClick={openModal}
      type="button"
      title="Configure Python FastAPI Backend Gateway"
      className="inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium border border-[#E2E7E2] bg-white hover:bg-gray-50 transition-all cursor-pointer shadow-2xs group shrink-0"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {status === "connected" ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </>
        ) : status === "checking" ? (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 animate-pulse"></span>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        )}
      </span>

      <span className="text-[#131B17] font-semibold text-[10px] sm:text-[11px] group-hover:text-[#0F2E24] whitespace-nowrap">
        {status === "connected" ? (
          <>
            <span className="hidden sm:inline">FastAPI </span>Live
          </>
        ) : status === "checking" ? (
          <>
            <span className="hidden sm:inline">Connecting</span>...
          </>
        ) : mode === "force_demo" ? (
          <>
            <span className="hidden sm:inline">Demo </span>Engine
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Backend </span>Offline
          </>
        )}
      </span>

      {status === "connected" && latencyMs !== null && (
        <span className="hidden sm:inline text-[10px] text-emerald-700 font-mono font-medium">
          {latencyMs}ms
        </span>
      )}

      <span className="hidden md:inline text-[10px] text-[#6C7A72] border-l border-[#EEF2EE] pl-1.5 ml-0.5">
        Gateway
      </span>
    </button>
  );
};
