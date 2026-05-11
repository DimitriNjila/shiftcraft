import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { OnboardedRoute } from "@/routes/OnboardedRoute";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import AppLayout from "@/components/layout/AppLayout";

// Landing + auth load eagerly (small, public-facing, first thing users see)
import LandingPage from "@/routes/landing/index";
import LoginPage from "@/routes/auth/Login";
import SignupPage from "@/routes/auth/Signup";
import ResetPasswordPage from "@/routes/auth/ResetPassword";
import ResetPasswordConfirmPage from "@/routes/auth/ResetPasswordConfirm";

// App routes are lazy-loaded — they share heavy deps (dnd-kit, schedule logic)
// that should not block the landing / auth bundle
const DashboardPage = lazy(() => import("@/routes/dashboard/index"));
const EmployeesPage = lazy(() => import("@/routes/employees/index"));
const SchedulesPage = lazy(() => import("@/routes/schedules/index"));
const TemplatesPage = lazy(() => import("@/routes/templates/index"));
const SettingsPage = lazy(() => import("@/routes/settings/index"));
const SetupPage = lazy(() => import("@/routes/setup/index"));
const NotFoundPage = lazy(() => import("@/routes/not-found/index"));

function PageFallback() {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <LoadingSpinner size={28} />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Landing page */}
              <Route path="/" element={<LandingPage />} />

              {/* Public auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/reset-password/confirm"
                element={<ResetPasswordConfirmPage />}
              />

              {/* Protected app routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/setup"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <SetupPage />
                    </Suspense>
                  }
                />
                <Route element={<OnboardedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/schedules" element={<SchedulesPage />} />
                    <Route path="/templates" element={<TemplatesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Route>

              {/* 404 catch-all — show the page directly, no redirect */}
              <Route
                path="*"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <NotFoundPage />
                  </Suspense>
                }
              />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-body)",
              background: "var(--color-surface-lowest)",
              color: "var(--color-on-surface)",
              border: "none",
              boxShadow: "var(--shadow-lift)",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
