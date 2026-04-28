import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/routes/auth/Login";
import SignupPage from "@/routes/auth/Signup";
import ResetPasswordPage from "@/routes/auth/ResetPassword";
import ResetPasswordConfirmPage from "@/routes/auth/ResetPasswordConfirm";
import DashboardPage from "@/routes/dashboard/index";
import EmployeesPage from "@/routes/employees/index";
import SchedulesPage from "@/routes/schedules/index";
import ScheduleDetailPage from "@/routes/schedules/detail";
import TemplatesPage from "@/routes/templates/index";
import SettingsPage from "@/routes/settings/index";
import SetupPage from "@/routes/setup/index";

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
        <BrowserRouter>
          <Routes>
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
              <Route path="/setup" element={<SetupPage />} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/schedules" element={<SchedulesPage />} />
                <Route path="/schedules/:id" element={<ScheduleDetailPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>

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
