import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Copy,
  Users,
  Settings as SettingsIcon,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { BrandMark, Wordmark } from "@/components/ui/BrandMark";

interface NavDef {
  to: string;
  icon: React.ElementType;
  label: string;
  isNew?: boolean;
  badge?: number;
}

const NAV_ITEMS: NavDef[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/schedules", icon: CalendarDays, label: "Schedule" },
  { to: "/templates", icon: Copy, label: "Templates", isNew: true },
  { to: "/employees", icon: Users, label: "Staff" },
  { to: "/settings", icon: SettingsIcon, label: "Settings" },
];

export interface SidebarProps {
  rail: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ rail, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "User";
  const role =
    (user?.user_metadata?.role as string | undefined) ?? "General Manager";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside
      className={`sidebar${mobileOpen ? " sidebar-open" : ""}`}
      style={{
        padding: rail ? "16px 10px" : "18px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* Close button (mobile only) */}
      <button
        onClick={onMobileClose}
        className="btn btn-icon btn-ghost md:hidden"
        aria-label="Close navigation"
        style={{ position: "absolute", top: 12, right: 12, zIndex: 5 }}
      >
        <X size={18} />
      </button>

      {/* Brand row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: rail ? "4px" : "4px 8px",
        }}
      >
        <BrandMark size={26} />
        {!rail && <Wordmark size={15.5} showVersion />}
      </div>

      {/* Nav */}
      <nav
        style={{ display: "flex", flexDirection: "column", gap: 2 }}
        aria-label="Main navigation"
      >
        {!rail && (
          <div
            className="label-sm"
            style={{ padding: "6px 12px 4px", fontSize: 9 }}
          >
            Workspace
          </div>
        )}
        {NAV_ITEMS.map(({ to, icon: Icon, label, isNew, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
            title={rail ? label : undefined}
            className={({ isActive }) =>
              `nav-item${rail ? " nav-item-rail" : ""}${
                isActive ? " nav-item-active" : ""
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2 : 1.7}
                  style={{
                    flexShrink: 0,
                    color: isActive
                      ? "var(--on-surface)"
                      : "var(--on-surface-muted)",
                  }}
                />
                {!rail && (
                  <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
                )}
                {!rail && isNew && (
                  <span
                    style={{
                      background:
                        "color-mix(in oklab, var(--accent-fixed) 55%, var(--surface-high))",
                      color: "var(--on-surface)",
                      borderRadius: 999,
                      fontSize: 8.5,
                      fontWeight: 700,
                      fontFamily: "var(--font-label)",
                      padding: "2px 7px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    New
                  </span>
                )}
                {!rail && badge != null && (
                  <span
                    style={{
                      background: "var(--tertiary-fixed-dim)",
                      color: "var(--on-surface)",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: "var(--font-label)",
                      padding: "2px 7px",
                      minWidth: 18,
                      textAlign: "center",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* User card */}
      {!rail ? (
        <div
          style={{
            padding: 9,
            background: "var(--surface-lowest)",
            borderRadius: 10,
            boxShadow:
              "inset 0 0 0 1px var(--hairline), 0 1px 2px rgba(28,27,27,0.04)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Avatar name={fullName} size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="title-sm"
              style={{
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {fullName}
            </div>
            <div className="label-sm">{role}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="btn btn-icon btn-ghost"
            style={{ width: 28, height: 28 }}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignOut}
          title="Sign out"
          aria-label="Sign out"
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Avatar name={fullName} size={34} />
        </button>
      )}
    </aside>
  );
}
