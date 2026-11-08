/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "./context/SessionContext.tsx";
import { BackendConfigProvider } from "./context/BackendConfigContext.tsx";
import { AppLayout } from "./components/layout/AppLayout.tsx";

// Pages
import { LandingPage } from "./pages/LandingPage.tsx";
import { OnboardingPage } from "./pages/OnboardingPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { DiscoverPage } from "./pages/DiscoverPage.tsx";
import { ProductDetailsPage } from "./pages/ProductDetailsPage.tsx";
import { ComparePage } from "./pages/ComparePage.tsx";
import { MyCarePage } from "./pages/MyCarePage.tsx";
import { RoutinesPage } from "./pages/RoutinesPage.tsx";
import { ProgressPage } from "./pages/ProgressPage.tsx";
import { AIAssistantPage } from "./pages/AIAssistantPage.tsx";
import { OrdersPage } from "./pages/OrdersPage.tsx";
import { SupportPage } from "./pages/SupportPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { AuthPage } from "./pages/AuthPage.tsx";
import { useSession } from "./context/SessionContext.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useSession();
  const location = useLocation();

  if (isAuthLoading) {
    return <div className="min-h-screen grid place-items-center text-sm text-[#6C7A72]">Loading your account...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/auth" replace state={{ from: location }} />;
  return <>{children}</>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BackendConfigProvider>
        <SessionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />

              <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/discover/:productId" element={<ProductDetailsPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/my-care" element={<MyCarePage />} />
                <Route path="/routines" element={<RoutinesPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SessionProvider>
      </BackendConfigProvider>
    </QueryClientProvider>
  );
}
