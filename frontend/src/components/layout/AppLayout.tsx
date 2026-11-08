import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.tsx";
import { Header } from "./Header.tsx";
import { MobileNavigation } from "./MobileNavigation.tsx";
import { Footer } from "./Footer.tsx";
import { BackendConnectModal } from "../common/BackendConnectModal.tsx";
import { X } from "lucide-react";

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9F6] text-[#17211D] flex flex-col font-sans">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
          <Sidebar />
        </div>

        {/* Mobile Slide-over Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 flex flex-col">
              <button
                onClick={() => setMobileMenuOpen(false)}
                type="button"
                className="absolute right-3 top-4 p-2 text-gray-500 hover:text-black rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 md:pl-64 flex flex-col min-w-0">
          <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 pb-24 md:pb-8">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileNavigation onOpenMore={() => setMobileMenuOpen(true)} />

      {/* Global Backend Connection & Status Modal */}
      <BackendConnectModal />
    </div>
  );
};
