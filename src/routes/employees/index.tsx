import { useMemo, useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useDeactivateEmployee,
} from "@/lib/hooks/use-employees";
import {
  EmployeeCard,
  EmployeeCardSkeleton,
} from "@/components/employees/EmployeeCard";
import { StaffTable } from "@/components/employees/StaffTable";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { AvailabilityModal } from "@/components/employees/AvailabilityModal";
import {
  DisableEmployeeModal,
  type DisableModalMode,
} from "@/components/employees/DisableEmployeeModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { usePageMeta } from "@/components/layout/page-meta";
import type { Employee } from "@/lib/types/employee";

const ROLE_OPTIONS = ["all", "Server", "Cook", "Host", "Manager"] as const;
type Sort = "name" | "hours" | "rate";

export default function EmployeesPage() {
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant();
  const restaurantId = restaurant?.id;

  const {
    data: employees,
    isLoading,
    error,
    refetch,
  } = useEmployees(restaurantId);
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const deactivateEmployee = useDeactivateEmployee();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<Sort>("name");
  const [view, setView] = useState<"table" | "grid">("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | undefined>();
  const [removeTarget, setRemoveTarget] = useState<Employee | undefined>();
  const [removeMode, setRemoveMode] = useState<DisableModalMode>("disable");
  const [availabilityTarget, setAvailabilityTarget] = useState<
    Employee | undefined
  >();

  const openCreate = () => {
    setEditTarget(undefined);
    setModalOpen(true);
  };
  const openEdit = (employee: Employee) => {
    setEditTarget(employee);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(undefined);
  };

  usePageMeta({
    title: "Staff",
    breadcrumbs: ["Staff", "All"],
    actions: restaurantId ? (
      <button
        type="button"
        onClick={openCreate}
        className="btn btn-primary"
      >
        <Plus size={14} /> Add staff
      </button>
    ) : null,
  });

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    let list = (employees ?? []).filter((e) => {
      const matchesSearch =
        search === "" ||
        e.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || e.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    list = list.slice().sort((a, b) => {
      if (sortKey === "hours") {
        return (b.max_hours_per_week ?? 0) - (a.max_hours_per_week ?? 0);
      }
      if (sortKey === "rate") return b.salary - a.salary;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [employees, search, roleFilter, sortKey]);

  // ── KPI values ──
  const stats = useMemo(() => {
    const list = employees ?? [];
    const active = list.filter((e) => e.is_active);
    const avgHours =
      active.length === 0
        ? 0
        : active.reduce((s, e) => s + (e.max_hours_per_week ?? 0), 0) /
          active.length;
    const avgRate =
      active.length === 0
        ? 0
        : active.reduce((s, e) => s + e.salary, 0) / active.length;
    return {
      total: list.length,
      active: active.length,
      onLeave: list.length - active.length,
      avgHours,
      avgRate,
    };
  }, [employees]);

  const handleSubmit = ({
    name,
    role,
    restaurantId: rid,
    salary,
    maxHoursPerWeek,
  }: {
    name: string;
    role: string;
    restaurantId: string;
    salary: number;
    maxHoursPerWeek: number;
  }) => {
    if (editTarget) {
      updateEmployee.mutate(
        {
          id: editTarget.id,
          updates: {
            name,
            role,
            salary,
            max_hours_per_week: maxHoursPerWeek,
          },
        },
        { onSuccess: closeModal },
      );
    } else {
      createEmployee.mutate(
        {
          name,
          role,
          restaurant_id: rid,
          salary,
          max_hours_per_week: maxHoursPerWeek,
        },
        { onSuccess: closeModal },
      );
    }
  };

  const openRemove = (employee: Employee) => {
    setRemoveTarget(employee);
    setRemoveMode("disable");
  };
  const closeRemove = () => {
    setRemoveTarget(undefined);
    setRemoveMode("disable");
  };

  const handleDisable = () => {
    if (!removeTarget) return;
    deactivateEmployee.mutate(removeTarget.id, {
      onSuccess: closeRemove,
    });
  };

  const handleDelete = () => {
    if (!removeTarget) return;
    deleteEmployee.mutate(removeTarget.id, {
      onSuccess: closeRemove,
      onError: (error) => {
        // 409 → pivot the modal to the "has shift history" state so the
        // manager can bail into disable in one click. Any other error is
        // already toasted by the mutation.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any)?.response?.status;
        if (status === 409) {
          setRemoveMode("delete-blocked");
        } else {
          closeRemove();
        }
      },
    });
  };

  const isSubmitting = createEmployee.isPending || updateEmployee.isPending;
  const noEmployeesYet = !isLoading && (employees?.length ?? 0) === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* KPI strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        <KpiCard
          label="Total staff"
          value={stats.total}
          sub={stats.total > 0 ? `${stats.active} active` : "—"}
          loading={restaurantLoading || isLoading}
        />
        <KpiCard
          label="Active now"
          value={stats.active}
          sub={stats.onLeave > 0 ? `${stats.onLeave} inactive` : "All active"}
          loading={restaurantLoading || isLoading}
        />
        <KpiCard
          label="Avg max hours"
          value={stats.avgHours > 0 ? `${stats.avgHours.toFixed(1)}h` : "—"}
          sub="Per week"
          loading={restaurantLoading || isLoading}
        />
        <KpiCard
          label="Avg hourly"
          value={stats.avgRate > 0 ? `$${stats.avgRate.toFixed(2)}` : "—"}
          sub="Compliant"
          loading={restaurantLoading || isLoading}
        />
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          rowGap: 8,
          padding: "10px 14px",
          background: "var(--surface-container)",
          borderRadius: "var(--r-xl)",
          boxShadow: "inset 0 0 0 1px var(--hairline)",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            minWidth: 200,
            padding: "6px 10px",
            background: "var(--surface-lowest)",
            borderRadius: 8,
            boxShadow: "inset 0 0 0 1px var(--hairline)",
          }}
        >
          <Search size={15} style={{ color: "var(--on-surface-faint)" }} />
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search staff"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: 13,
              color: "var(--on-surface)",
              fontFamily: "inherit",
              minWidth: 0,
            }}
          />
        </label>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filter by role"
          className="input"
          style={{
            width: "auto",
            padding: "8px 10px",
            fontSize: 12,
            background: "var(--surface-lowest)",
          }}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r === "all" ? "All roles" : r}
            </option>
          ))}
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as Sort)}
          aria-label="Sort"
          className="input"
          style={{
            width: "auto",
            padding: "8px 10px",
            fontSize: 12,
            background: "var(--surface-lowest)",
          }}
        >
          <option value="name">Sort: Name</option>
          <option value="hours">Sort: Max hours</option>
          <option value="rate">Sort: Rate</option>
        </select>

        <div
          style={{
            display: "flex",
            background: "var(--surface-lowest)",
            borderRadius: 8,
            padding: 2,
            boxShadow: "inset 0 0 0 1px var(--hairline)",
          }}
        >
          {(["table", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background:
                  view === v ? "var(--surface-high)" : "transparent",
                color:
                  view === v
                    ? "var(--on-surface)"
                    : "var(--on-surface-muted)",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "capitalize",
                border: "none",
                cursor: "pointer",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {restaurantLoading || isLoading ? (
        view === "table" ? (
          <div
            className="skeleton"
            style={{ height: 320, borderRadius: "var(--r-2xl)" }}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 12,
            }}
            aria-label="Loading staff"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <EmployeeCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : error ? (
        <ErrorMessage
          message="Failed to load staff"
          onRetry={() => refetch()}
        />
      ) : !restaurantId ? (
        <ErrorMessage message="No restaurant found. Please complete account setup." />
      ) : noEmployeesYet ? (
        <EmptyState
          icon={<Users size={28} className="text-on-surface-faint" />}
          title="No staff yet"
          description="Add your first team member to get started with scheduling."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="btn btn-primary"
            >
              <Plus size={15} /> Add staff
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No results"
          description={
            search
              ? `No staff match "${search}".`
              : "No staff match those filters."
          }
        />
      ) : view === "table" ? (
        <StaffTable
          employees={filtered}
          onSelect={openEdit}
          onEdit={openEdit}
          onRemove={openRemove}
          onAvailability={setAvailabilityTarget}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={openEdit}
              onRemove={openRemove}
              onAvailability={setAvailabilityTarget}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modalOpen && restaurantId && (
        <EmployeeModal
          employee={editTarget}
          restaurantId={restaurantId}
          isPending={isSubmitting}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
      {availabilityTarget && (
        <AvailabilityModal
          employee={availabilityTarget}
          onClose={() => setAvailabilityTarget(undefined)}
        />
      )}
      {removeTarget && (
        <DisableEmployeeModal
          employee={removeTarget}
          mode={removeMode}
          isPending={
            deactivateEmployee.isPending || deleteEmployee.isPending
          }
          onDisable={handleDisable}
          onDelete={handleDelete}
          onSwitchToDelete={() => setRemoveMode("delete")}
          onCancel={closeRemove}
        />
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface-container)",
        borderRadius: "var(--r-xl)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        padding: "16px 20px",
      }}
    >
      <div className="label-md">{label}</div>
      {loading ? (
        <div
          className="skeleton"
          style={{ height: 28, width: 80, marginTop: 6, borderRadius: 4 }}
        />
      ) : (
        <div className="headline-lg mono" style={{ marginTop: 6 }}>
          {value}
        </div>
      )}
      {sub && !loading && (
        <div
          className="body-sm"
          style={{ color: "var(--on-surface-muted)", marginTop: 2 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
