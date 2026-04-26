import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="label-md">Overview</span>
          <h1 className="headline-lg mt-1.5">Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active employees", value: "—" },
          { label: "Shifts this week", value: "—" },
          { label: "Hours scheduled", value: "—" },
        ].map(({ label, value }) => (
          <div key={label} className="card">
            <p className="label-md">{label}</p>
            <p className="headline-md mono mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 card flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary-fixed grid place-items-center shrink-0">
          <LayoutDashboard size={18} className="text-primary" />
        </div>
        <div>
          <p className="title-sm">Welcome to Shiftcraft</p>
          <p className="body-sm text-on-surface-muted mt-0.5">
            Use the sidebar to navigate. Start by adding your team in{" "}
            <span className="font-semibold text-on-surface">Employees</span>.
          </p>
        </div>
      </div>
    </>
  );
}
