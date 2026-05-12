import { type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Employee } from "@/lib/types/employee";

const ROLES = ["Server", "Cook", "Host", "Manager"] as const;
type Role = (typeof ROLES)[number];

export interface EmployeeModalProps {
  /** When provided the modal is in edit mode; otherwise create mode. */
  employee?: Employee;
  restaurantId: string;
  isPending: boolean;
  onSubmit: (data: {
    name: string;
    role: Role;
    restaurantId: string;
    salary: number;
    maxHoursPerWeek: number;
  }) => void;
  onClose: () => void;
}

export function EmployeeModal({
  employee,
  restaurantId,
  isPending,
  onSubmit,
  onClose,
}: EmployeeModalProps) {
  const isEditing = !!employee;
  const [name, setName] = useState(employee?.name ?? "");
  const [role, setRole] = useState<Role>((employee?.role as Role) ?? "Server");
  const [salary, setSalary] = useState(employee?.salary ?? 30000);
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState(
    employee?.max_hours_per_week ?? 40,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setName(employee?.name ?? "");
    setRole((employee?.role as Role) ?? "Server");
    setSalary(employee?.salary ?? 15); 
    setMaxHoursPerWeek(employee?.max_hours_per_week ?? 40);
    setError("");
  }, [employee]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim(),
      role,
      restaurantId,
      salary,
      maxHoursPerWeek,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="label-md">
              {isEditing ? "Edit" : "New"} employee
            </span>
            <h2 className="headline-md mt-0.5">
              {isEditing ? "Update details" : "Add to your team"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-icon btn-ghost"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label htmlFor="emp-name" className="field-label">
              Full name
            </label>
            <input
              id="emp-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              className={`input-field ${error ? "shadow-[inset_0_0_0_2px_var(--color-tertiary-fixed-dim)]" : ""}`}
              placeholder="e.g. Jordan Reyes"
              autoComplete="off"
              autoFocus
            />
            {error && (
              <p className="body-sm text-[color:var(--color-tertiary-fixed-dim)] mt-1.5">
                {error}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <span className="field-label">Role</span>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2.5 px-3 rounded-[10px] text-[13px] font-semibold text-left transition-all border-none cursor-pointer ${
                    role === r
                      ? "bg-surface-lowest shadow-[inset_0_0_0_2px_var(--color-primary-fixed)] text-on-surface"
                      : "bg-surface-highest text-on-surface-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Salary */}
          <div>
            <label htmlFor="emp-salary" className="field-label">
              Salary
            </label>
            <input
              id="emp-salary"
              type="number"
              value={salary || ""}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="input-field"
              placeholder="e.g. 30000"
              min="0"
              step="0.5"  
            />
          </div>

          {/* Max Hours Per Week */}
          <div>
            <label htmlFor="emp-max-hours" className="field-label">
              Max Hours Per Week
            </label>
            <input
              id="emp-max-hours"
              type="number"
              value={maxHoursPerWeek || ""}
              onChange={(e) => setMaxHoursPerWeek(Number(e.target.value))}
              className="input-field"
              placeholder="e.g. 40"
              min="0"
              step="1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary py-2.5 px-4 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 justify-center py-2.5 text-sm"
              disabled={isPending}
            >
              {isPending
                ? isEditing
                  ? "Saving…"
                  : "Adding…"
                : isEditing
                  ? "Save changes"
                  : "Add employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
