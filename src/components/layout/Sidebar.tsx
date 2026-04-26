import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Layers,
  Settings2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ──────────────────────────────────────────────────────────────
   Nav items
   ────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/employees", icon: Users, label: "Employees" },
  { to: "/schedules", icon: CalendarDays, label: "Schedules" },
  { to: "/templates", icon: Layers, label: "Templates" },
  { to: "/settings", icon: Settings2, label: "Settings" },
] as const;

/* ──────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────── */
function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : "?";
}

/* ──────────────────────────────────────────────────────────────
   Sidebar
   ────────────────────────────────────────────────────────────── */
export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const email = user?.email;
  const initials = getInitials(fullName, email);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside className={`sidebar${mobileOpen ? " sidebar-open" : ""}`}>
      {/* ── Header ── */}
      <div
        className={`flex items-center ${collapsed ? "justify-center px-4" : "justify-between px-5"} py-5`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="brand-logo-mark shrink-0">S</div>
          {!collapsed && (
            <span className="font-display font-bold text-sm tracking-[-0.01em] truncate">
              Shiftcraft
            </span>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="btn-icon btn-ghost shrink-0 hidden md:inline-flex"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand button (rail mode, desktop only) */}
      {collapsed && (
        <div className="flex justify-center mb-1">
          <button
            onClick={onToggleCollapse}
            className="btn-icon btn-ghost hidden md:inline-flex"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Close button (mobile only) */}
      <button
        onClick={onMobileClose}
        className="btn-icon btn-ghost absolute top-4 right-4 md:hidden"
        aria-label="Close navigation"
      >
        <X size={18} />
      </button>

      <div className="divider mx-4 mb-3" />

      {/* ── Nav ── */}
      <nav
        className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `nav-item${collapsed ? " nav-item-rail" : ""}${isActive ? " nav-item-active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${isActive ? "text-primary" : ""}`}
                />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User area ── */}
      <div className="mt-auto pt-3 pb-4 px-2">
        <div className="divider mb-3" />

        {collapsed ? (
          <button
            onClick={handleSignOut}
            className="nav-item nav-item-rail w-full"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={17} className="shrink-0" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
            <div className="avatar w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container text-[11px] shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {fullName && (
                <p className="text-[12.5px] font-semibold font-body leading-none truncate mb-0.5">
                  {fullName}
                </p>
              )}
              {email && (
                <p className="text-[10.5px] text-on-surface-faint font-label truncate">
                  {email}
                </p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="btn-icon btn-ghost shrink-0 cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
