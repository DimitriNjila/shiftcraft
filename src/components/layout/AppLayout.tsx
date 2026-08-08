import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageMetaProvider } from "./page-meta";
import { BrandMark, Wordmark } from "@/components/ui/BrandMark";

export default function AppLayout() {
  const location = useLocation();
  const [rail, setRail] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status: restaurantStatus, refetch: refetchRestaurant } =
    useRestaurant();

  if (restaurantStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ErrorMessage
          message="Failed to load workspace"
          onRetry={() => refetchRestaurant()}
        />
      </div>
    );
  }

  return (
    <PageMetaProvider>
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
        data-sidebar={rail ? "rail" : undefined}
        onDoubleClick={(e) => {
          // Double-clicking the sidebar edge toggles rail (subtle affordance)
          const target = e.target as HTMLElement;
          if (target.closest("aside.sidebar") && !target.closest("nav")) {
            setRail((r) => !r);
          }
        }}
      >
        <div className="no-print" style={{ display: "contents" }}>
          <Sidebar
            rail={rail}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>

        <div className="main-area">
          {/* Mobile header bar */}
          <div
            className="flex items-center gap-3 px-4 h-14 shrink-0 md:hidden no-print"
            style={{ boxShadow: "inset 0 -1px var(--hairline)" }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="btn btn-icon btn-ghost"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
            <BrandMark size={22} />
            <Wordmark size={14} />
          </div>

          {/* Desktop topbar */}
          <div className="hidden md:block no-print">
            <Topbar />
          </div>

          {/* Page content — keyed on pathname to re-mount / re-trigger fade-in */}
          <div
            key={location.pathname}
            className="page-content fade-in"
            data-screen-label={location.pathname.replace(/^\//, "")}
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center py-20">
                  <LoadingSpinner size={28} />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </PageMetaProvider>
  );
}
