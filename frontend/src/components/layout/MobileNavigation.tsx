import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  BotMessageSquare,
  BookOpenText,
  Menu,
} from "lucide-react";

interface MobileNavigationProps {
  onOpenMore: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ onOpenMore }) => {
  const location = useLocation();

  const links = [
    { name: "Home", to: "/dashboard", icon: LayoutDashboard },
    { name: "Discover", to: "/discover", icon: Compass },
    { name: "Routines", to: "/routines", icon: CalendarCheck },
    { name: "Journal", to: "/progress", icon: BookOpenText },
    { name: "Care AI", to: "/ai-assistant", icon: BotMessageSquare },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-[#E2E7E2] px-1 sm:px-3 flex items-center justify-around z-40 shadow-lg"
      style={{
        height: "calc(3.75rem + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;

        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
              isActive
                ? "text-[#0F2E24] font-bold"
                : "text-[#6C7A72] hover:text-[#131B17]"
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-all ${
                isActive ? "bg-[#E7F1EB]" : "bg-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform ${
                  isActive ? "text-[#0F2E24] scale-105" : "text-[#6C7A72]"
                }`}
              />
            </div>
            <span
              className={`text-[10px] leading-tight tracking-tight mt-0.5 ${
                isActive ? "font-bold text-[#0F2E24]" : "font-medium text-[#6C7A72]"
              }`}
            >
              {link.name}
            </span>
          </NavLink>
        );
      })}

      <button
        onClick={onOpenMore}
        type="button"
        className="flex flex-col items-center justify-center flex-1 py-1 text-[#6C7A72] hover:text-[#131B17] cursor-pointer"
        aria-label="Open full menu"
      >
        <div className="p-1 rounded-lg">
          <Menu className="w-4 h-4 text-[#6C7A72]" />
        </div>
        <span className="text-[10px] leading-tight tracking-tight mt-0.5 font-medium">
          More
        </span>
      </button>
    </nav>
  );
};
