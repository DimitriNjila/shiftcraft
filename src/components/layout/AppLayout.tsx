import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useRestaurant } from "@/lib/hooks/use-restaurant";

export default function AppLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: restaurant, status: restaurantStatus, refetch } = useRestaurant();

  if (restaurantStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={28} />
      </div>
    );
  }

  if (restaurantStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ErrorMessage message="Failed to load workspace" onRetry={() => refetch()} />
      </div>
    );
  }

  if (!restaurant.onboarding_completed) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          data-testid="mobile-overlay"
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className="app-shell"
        data-sidebar={collapsed ? "rail" : undefined}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="main-area">
          {/* Mobile top bar */}
          <div className="flex items-center gap-3 px-5 h-14 shrink-0 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="btn-icon btn-ghost"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
            <div className="brand-logo-mark">S</div>
            <span className="font-display font-bold text-sm tracking-[-0.01em]">
              Shiftcraft
            </span>
          </div>

          {/* Page content — keyed on pathname to re-mount on route change,
              triggering the fade-in animation each time. */}
          <div key={location.pathname} className="page-content fade-in">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
