import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Server,
  User,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Shield,
  Zap,
} from "lucide-react";
import { useSession } from "../context/SessionContext.tsx";
import { useBackendConfig } from "../context/BackendConfigContext.tsx";
import { ConfirmDialog } from "../components/common/ConfirmDialog.tsx";

const ALL_CATEGORIES = ["Hair", "Beard", "Skin", "Wellness", "Other"];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, sessionId, userName, updateSession, resetDemo } = useSession();
  const {
    baseUrl,
    mode,
    status,
    latencyMs,
    updateUrl,
    updateMode,
    pingBackend,
    resetToDefaultUrl,
    openModal,
  } = useBackendConfig();

  // Local preferences state
  const [name, setName] = useState(userName || "");
  const [categories, setCategories] = useState<string[]>(
    session?.selectedCategories || ["Hair", "Skin"]
  );
  const [concerns, setConcerns] = useState<string[]>(
    session?.concerns || ["Hair fall concerns", "Dandruff & flakes"]
  );
  const [goals, setGoals] = useState<string[]>(
    session?.goals || ["Organise my products", "Build a consistent routine"]
  );
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [prefSavedSuccess, setPrefSavedSuccess] = useState(false);

  // Backend url local state
  const [testUrl, setTestUrl] = useState(baseUrl);
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    latencyMs: number;
    error?: string;
  } | null>(null);

  // Reset dialog state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPref(true);
    setPrefSavedSuccess(false);
    try {
      await updateSession({
        name: name.trim() || "Care Member",
        selectedCategories: categories,
        concerns,
        goals,
      });
      setPrefSavedSuccess(true);
      setTimeout(() => setPrefSavedSuccess(false), 2500);
    } catch {
      // handled
    } finally {
      setIsSavingPref(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingUrl(true);
    setTestResult(null);
    const res = await pingBackend(testUrl);
    setTestResult({
      tested: true,
      success: res.success,
      latencyMs: res.latencyMs,
      error: res.error,
    });
    setIsTestingUrl(false);
    if (res.success) {
      updateUrl(testUrl);
    }
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await resetDemo();
    setIsResetting(false);
    setShowResetConfirm(false);
    navigate("/onboarding");
  };

  return (
    <div className="space-y-8 py-6 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F1EB] text-[#183C32] text-xs font-bold uppercase tracking-wider">
            <SettingsIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preferences</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#17211D] tracking-tight">
            Settings & Backend Integration
          </h1>
          <p className="text-xs text-[#75817A] leading-relaxed">
            Manage your personal care vertical interests, configure backend FastAPI connections, and manage your demo session.
          </p>
        </div>
      </div>

      {/* Section 1: Backend Connection Hub */}
      <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E7F1EB] text-[#183C32] flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17211D]">
                Backend FastAPI Connection
              </h2>
              <p className="text-xs text-[#75817A]">
                Link to your Python FastAPI backend or run in standalone demo mode
              </p>
            </div>
          </div>

          <button
            onClick={openModal}
            type="button"
            className="text-xs font-semibold text-[#183C32] bg-[#E7F1EB] px-3.5 py-1.5 rounded-xl hover:bg-[#d8e8de] transition-colors"
          >
            Open Connection Hub
          </button>
        </div>

        {/* Live Status Indicator Box */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            status === "connected"
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : "bg-amber-50/70 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-3 text-xs">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${
                status === "connected"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            <div>
              <span className="font-bold">
                {status === "connected"
                  ? "FastAPI Backend is Live & Connected"
                  : "FastAPI Backend Offline (Running in Local Demo Engine)"}
              </span>
              <p className="text-[11px] opacity-80 mt-0.5">
                Target: <code className="font-mono">{baseUrl}</code>
                {latencyMs !== null && ` · Latency: ${latencyMs}ms`}
              </p>
            </div>
          </div>

          <button
            onClick={() => pingBackend()}
            type="button"
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-xs font-semibold transition-colors shrink-0 shadow-2xs"
            title="Recheck connection"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL editor */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#17211D]">
            Configured API Base URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] bg-[#F8F9F6] text-xs font-mono"
            />
            <button
              onClick={handleTestConnection}
              disabled={isTestingUrl}
              type="button"
              className="px-4 py-2 rounded-xl bg-[#183C32] text-white text-xs font-semibold hover:bg-[#122e26] transition-colors disabled:opacity-50"
            >
              {isTestingUrl ? "Testing..." : "Test & Save"}
            </button>
          </div>

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
                    Successfully reached backend in {testResult.latencyMs}ms! URL updated.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Could not connect: {testResult.error}. Verify your FastAPI port and CORS settings.
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#17211D] mb-2">
            API Routing Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "auto", label: "Auto Hybrid", desc: "Prefers FastAPI, falls back to demo data if offline" },
              { id: "force_live", label: "Strict Live", desc: "Only allows real FastAPI network responses" },
              { id: "force_demo", label: "Demo Mode", desc: "Operates exclusively in offline demo engine" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => updateMode(m.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  mode === m.id
                    ? "border-[#183C32] bg-[#E7F1EB]/50 font-bold text-[#183C32]"
                    : "border-[#E7EBE7] bg-[#F8F9F6] text-[#75817A]"
                }`}
              >
                <div className="text-xs mb-1">{m.label}</div>
                <div className="text-[10px] opacity-80 leading-tight">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Personal Care Preferences */}
      <form
        onSubmit={handleSavePreferences}
        className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E7F1EB] text-[#183C32] flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#17211D]">
              Care Profile & Target Categories
            </h2>
            <p className="text-xs text-[#75817A]">
              Customize your wellness profile and selected care categories
            </p>
          </div>
        </div>

        {prefSavedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences saved successfully to backend session!</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7EBE7] bg-[#F8F9F6] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-2">
              Focus Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#183C32] text-white shadow-2xs"
                        : "bg-[#F8F9F6] text-[#75817A] border border-[#E7EBE7]"
                    }`}
                  >
                    {cat} Care
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingPref}
              className="px-5 py-2.5 rounded-xl bg-[#183C32] text-white text-xs font-semibold hover:bg-[#122e26] transition-colors shadow-xs"
            >
              {isSavingPref ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Demo Session Management */}
      <div className="bg-white rounded-3xl border border-[#E7EBE7] p-6 md:p-8 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#17211D]">
            Demo Session Control
          </h2>
          <p className="text-xs text-[#75817A] mt-0.5">
            CareGuide runs without mandatory login for evaluator demonstration.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F8F9F6] border border-[#E7EBE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-[#17211D] block">
              Session Identifier:
            </span>
            <span className="font-mono text-[#75817A]">{sessionId}</span>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            type="button"
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Demo Session?"
        description="This will clear your routines, progress logs, and generated messages. A fresh session will be initialized."
        confirmLabel="Reset Session"
        cancelLabel="Cancel"
        isDestructive
        isLoading={isResetting}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
