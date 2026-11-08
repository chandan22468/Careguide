import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Search,
  Sparkles,
  User,
  RotateCcw,
  BotMessageSquare,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useSession } from "../../context/SessionContext.tsx";
import { BackendStatusBadge } from "../common/BackendConnectModal.tsx";
import { ConfirmDialog } from "../common/ConfirmDialog.tsx";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userName, resetDemo, sessionId, logout } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetDemo();
      setShowResetConfirm(false);
      setShowProfileMenu(false);
      navigate("/onboarding");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await logout();
      navigate("/auth", { replace: true });
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Could not sign out. Please try again.");
    }
  };

  // Get current page label
  const getPageTitle = (isMobile = false) => {
    const p = location.pathname;
    if (p === "/") return isMobile ? "CareGuide" : "Welcome";
    if (p === "/dashboard") return isMobile ? "Dashboard" : "Personal Care Dashboard";
    if (p.startsWith("/discover")) return isMobile ? "Discover" : "Discover Products";
    if (p === "/compare") return isMobile ? "Compare" : "Product Comparison";
    if (p === "/my-care") return isMobile ? "My Care" : "My Care Products";
    if (p === "/routines") return isMobile ? "Routines" : "Routine Manager";
    if (p === "/progress") return isMobile ? "Journal" : "Progress Journal";
    if (p === "/ai-assistant") return isMobile ? "CareGuide AI" : "CareGuide AI Assistant";
    if (p === "/orders") return isMobile ? "Orders" : "Orders & Deliveries";
    if (p === "/support") return isMobile ? "Support" : "Customer Support";
    if (p === "/settings") return isMobile ? "Settings" : "Settings & Preferences";
    if (p === "/onboarding") return isMobile ? "Onboarding" : "Care Onboarding";
    return "CareGuide";
  };

  return (
    <>
      <header className="h-14 sm:h-16 bg-white border-b border-[#E2E7E2] px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Mobile menu button & Breadcrumb Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            type="button"
            className="md:hidden p-1.5 rounded-lg text-[#6C7A72] hover:text-[#131B17] hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-xs font-semibold text-[#6C7A72] hidden sm:inline tracking-wider uppercase shrink-0">
              CareGuide
            </span>
            <span className="text-[#6C7A72]/40 hidden sm:inline">/</span>
            <h1 className="text-sm md:text-base font-bold text-[#131B17] tracking-tight truncate">
              <span className="sm:hidden">{getPageTitle(true)}</span>
              <span className="hidden sm:inline">{getPageTitle(false)}</span>
            </h1>
          </div>
        </div>

        {/* Center: Search (on medium/large screens) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden lg:flex items-center w-80 max-w-sm relative"
        >
          <Search className="w-3.5 h-3.5 text-[#6C7A72] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulations, Redensyl, Biotin..."
            className="w-full pl-9 pr-12 py-1.5 rounded-xl border border-[#E2E7E2] bg-[#F7F8F5] text-xs text-[#131B17] placeholder:text-[#6C7A72] focus:outline-none focus:bg-white focus:border-[#0F2E24] focus:ring-1 focus:ring-[#0F2E24]/20 transition-all"
          />
          <span className="absolute right-3 text-[10px] text-[#6C7A72] font-mono pointer-events-none">
            ⌘K
          </span>
        </form>

        {/* Right: Actions, Backend status, AI Shortcut, User dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Backend Status indicator & config trigger */}
          <BackendStatusBadge />

          {/* Quick AI Trigger */}
          <Link
            to="/ai-assistant"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E7F1EB] text-[#0F2E24] hover:bg-[#d8e8de] text-xs font-semibold transition-colors border border-[#D2E3D8]"
          >
            <BotMessageSquare className="w-3.5 h-3.5 text-[#0F2E24]" />
            <span>CareGuide AI</span>
          </Link>

          {/* User profile popover */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              type="button"
              className="flex items-center gap-1 sm:gap-2 p-1 sm:pl-2.5 rounded-full border border-[#E2E7E2] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="text-xs font-semibold text-[#131B17] max-w-[80px] truncate hidden sm:inline">
                {userName || "Alex"}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#0F2E24] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                {(userName || "A")[0].toUpperCase()}
              </div>
              <ChevronDown className="w-3 h-3 text-[#6C7A72] mr-0.5 sm:mr-1" />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#E2E7E2] p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-[#EEF2EE] mb-2">
                    <p className="text-xs font-bold text-[#131B17]">{userName || "Care Member"}</p>
                    <p className="text-[10px] text-[#6C7A72] truncate">
                      {user?.email}
                    </p>
                    <div className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-md bg-[#F7F8F5] text-[#0F2E24] font-semibold border border-[#E2E7E2]">
                      Account data synced to MongoDB
                    </div>
                  </div>

                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#131B17] hover:bg-[#F7F8F5] font-medium"
                  >
                    <User className="w-4 h-4 text-[#6C7A72]" />
                    Preferences & Goals
                  </Link>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowResetConfirm(true);
                    }}
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    Reset Account Data
                  </button>
                  {logoutError && <p role="alert" className="px-3 py-1 text-[11px] text-rose-700">{logoutError}</p>}
                  <button
                    onClick={() => void handleLogout()}
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#131B17] hover:bg-[#F7F8F5] font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-[#6C7A72]" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Account Data?"
        description="This permanently clears your routines, progress entries, saved care products, and chat history. Your account remains active with a fresh care plan."
        confirmLabel="Reset Data"
        cancelLabel="Keep My Data"
        isDestructive
        isLoading={isResetting}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
};
