import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "@/lib/hooks/use-employees";
import {
  EmployeeCard,
  EmployeeCardSkeleton,
} from "@/components/employees/EmployeeCard";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { AvailabilityModal } from "@/components/employees/AvailabilityModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { Employee } from "@/lib/types/employee";
import { Users } from "lucide-react";

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

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Employee | undefined>();
  const [availabilityTarget, setAvailabilityTarget] = useState<Employee | undefined>();

  const filtered = (employees ?? []).filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

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
        { id: editTarget.id, updates: { name, role, salary, max_hours_per_week: maxHoursPerWeek } },
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

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteEmployee.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(undefined),
      onError: () => setDeleteTarget(undefined),
    });
  };

  const isSubmitting = createEmployee.isPending || updateEmployee.isPending;

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <span className="label-md">People</span>
          <h1 className="headline-lg mt-1.5">Employees</h1>
        </div>
        {restaurantId && (
          <button
            onClick={openCreate}
            className="btn btn-primary py-2.5 text-sm"
          >
            <Plus size={15} />
            Add employee
          </button>
        )}
      </div>

      {/* Search bar — only when there are employees */}
      {(employees?.length ?? 0) > 0 && (
        <div className="relative mb-5 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees…"
            className="input-field pl-8 text-sm"
            aria-label="Search employees"
          />
        </div>
      )}

      {/* Content */}
      {restaurantLoading || isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label="Loading employees"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <EmployeeCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage
          message="Failed to load employees"
          onRetry={() => refetch()}
        />
      ) : !restaurantId ? (
        <ErrorMessage message="No restaurant found. Please complete account setup." />
      ) : filtered.length === 0 && search ? (
        <EmptyState
          title="No results"
          description={`No employees match "${search}".`}
        />
      ) : employees?.length === 0 ? (
        <EmptyState
          icon={<Users size={28} className="text-on-surface-faint" />}
          title="No employees yet"
          description="Add your first team member to get started with scheduling."
          action={
            <button
              onClick={openCreate}
              className="btn btn-primary py-2.5 text-sm"
            >
              <Plus size={15} />
              Add employee
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onAvailability={setAvailabilityTarget}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && restaurantId && (
        <EmployeeModal
          employee={editTarget}
          restaurantId={restaurantId}
          isPending={isSubmitting}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {/* Availability modal */}
      {availabilityTarget && (
        <AvailabilityModal
          employee={availabilityTarget}
          onClose={() => setAvailabilityTarget(undefined)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmModal
          title="Remove employee"
          description={`Remove ${deleteTarget.name} from your team? This cannot be undone.`}
          confirmLabel="Remove"
          isPending={deleteEmployee.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(undefined)}
        />
      )}
    </>
  );
}
