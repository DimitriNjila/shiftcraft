import { Navigate, Outlet } from "react-router-dom";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * Sits between ProtectedRoute and AppLayout.
 * Ensures the restaurant query resolves before any inner page mounts,
 * and redirects to /setup if onboarding hasn't been completed yet.
 */
export function OnboardedRoute() {
  const { data: restaurant, status } = useRestaurant();

  if (status === "pending") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (status === "error" || !restaurant) {
    return <Navigate to="/setup" replace />;
  }

  if (!restaurant.setup_started) {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
}
