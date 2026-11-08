import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  HeartHandshake,
  CalendarCheck,
  BookOpenText,
  Package,
  HelpCircle,
  Settings,
  Scale,
  Leaf,
  BotMessageSquare,
} from "lucide-react";
import { useSession } from "../../context/SessionContext.tsx";
import { useBackendConfig } from "../../context/BackendConfigContext.tsx";

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { name: "Discover Products", to: "/discover", icon: Compass },
  { name: "Product Compare", to: "/compare", icon: Scale },
  { name: "My Care", to: "/my-care", icon: HeartHandshake },
  { name: "Routine Manager", to: "/routines", icon: CalendarCheck },
  { name: "Progress Journal", to: "/progress", icon: BookOpenText },
  { name: "CareGuide AI", to: "/ai-assistant", icon: BotMessageSquare, badge: "Gemini" },
  { name: "Orders", to: "/orders", icon: Package },
  { name: "Support & FAQs", to: "/support", icon: HelpCircle },
  { name: "Settings", to: "/settings", icon: Settings },
];

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { session } = useSession();
  const { status, openModal } = useBackendConfig();

  return (
    <aside className="w-64 h-full bg-white border-r border-[#E2E7E2] flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#EEF2EE]">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0F2E24] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="font-extrabold text-base text-[#0F2E24] tracking-tight flex items-center gap-1.5">
                CareGuide
              </div>
              <p className="text-[10px] text-[#6C7A72] font-semibold tracking-wider uppercase">
                by Man Matters
              </p>
            </div>
          </NavLink>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="px-3 py-2 text-[10px] font-bold text-[#6C7A72] tracking-wider uppercase">
            Care Ecosystem
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-[#0F2E24] text-white shadow-xs"
                    : "text-[#6C7A72] hover:text-[#131B17] hover:bg-[#F7F8F5]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-emerald-300" : "text-[#6C7A72] group-hover:text-[#0F2E24]"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-emerald-800 text-emerald-200"
                        : "bg-[#E7F1EB] text-[#0F2E24]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Session & Backend Card */}
      <div className="p-4 border-t border-[#EEF2EE] bg-[#F7F8F5]/80">
        <button
          onClick={openModal}
          type="button"
          className="w-full p-3.5 rounded-2xl bg-white border border-[#E2E7E2] text-left hover:border-[#0F2E24]/30 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C7A72]">
              FastAPI Gateway
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0F2E24]">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "connected"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              {status === "connected" ? "Live API" : "Demo Engine"}
            </span>
          </div>
          <p className="text-[11px] text-[#6C7A72] truncate">
            Session: <span className="font-mono text-[#131B17]">{session?.sessionId.slice(0, 10)}...</span>
          </p>
          <div className="mt-2 text-[10px] text-[#0F2E24] font-semibold flex items-center gap-1 group-hover:underline">
            Manage Gateway Settings →
          </div>
        </button>
      </div>
    </aside>
  );
};
