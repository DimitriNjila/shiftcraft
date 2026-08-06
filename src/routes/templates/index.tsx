import { useEffect, useMemo, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import {
  useShiftTemplates,
  useSaveShiftTemplates,
} from "@/lib/hooks/use-templates";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { TemplateCard } from "@/components/shift-templates/TemplateCard";
import { TemplateModal } from "@/components/shift-templates/TemplateModal";
import { usePageMeta } from "@/components/layout/page-meta";
import {
  dayRangeLabel,
  groupEntries,
  ungroupTemplates,
  type TemplateGroup,
} from "@/lib/utils/templates";

export default function TemplatesPage() {
  const { data: restaurant } = useRestaurant();
  const { data: record, status, refetch } = useShiftTemplates(restaurant?.id);
  const saveTemplates = useSaveShiftTemplates();

  const [groups, setGroups] = useState<TemplateGroup[]>([]);
  const [modal, setModal] = useState<TemplateGroup | "new" | null>(null);

  useEffect(() => {
    if (status === "success") {
      setGroups(record ? groupEntries(record.templates) : []);
    }
  }, [status, record]);

  const activeCount = groups.filter((g) => g.days.length > 0).length;
  const weeklyHours = groups.reduce(
    (a, g) =>
      a +
      (durationHours(g.start_time, g.end_time) * g.count * g.days.length),
    0,
  );

  usePageMeta({
    title: "Shift templates",
    breadcrumbs: ["Schedule", "Templates"],
    actions: (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setModal("new")}
      >
        <Plus size={14} /> New template
      </button>
    ),
  });

  const grouped = useMemo(() => {
    const byLabel = new Map<string, TemplateGroup[]>();
    for (const g of groups) {
      const key = dayRangeLabel(g.days);
      const arr = byLabel.get(key) ?? [];
      arr.push(g);
      byLabel.set(key, arr);
    }
    return Array.from(byLabel.entries()).map(([key, items]) => ({
      key,
      items,
    }));
  }, [groups]);

  const commit = (next: TemplateGroup[]) => {
    setGroups(next);
    if (restaurant?.id) {
      saveTemplates.mutate({
        restaurant_id: restaurant.id,
        templates: ungroupTemplates(next),
      });
    }
  };

  const upsert = (g: TemplateGroup) => {
    const exists = groups.some((x) => x.id === g.id);
    const next = exists
      ? groups.map((x) => (x.id === g.id ? g : x))
      : [...groups, g];
    commit(next);
    setModal(null);
  };

  const remove = (id: string) => {
    commit(groups.filter((x) => x.id !== id));
    setModal(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stat strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          background: "var(--surface-container)",
          borderRadius: "var(--r-xl)",
          boxShadow: "inset 0 0 0 1px var(--hairline)",
        }}
      >
        <div style={{ display: "flex", gap: 24 }}>
          <Stat label="Templates" value={String(groups.length)} />
          <Stat
            label="Active"
            value={String(activeCount)}
            accent
          />
          <Stat
            label="Weekly hours"
            value={`${Math.round(weeklyHours)}h`}
          />
        </div>
        <div style={{ flex: 1 }} />
        {saveTemplates.isPending && (
          <span
            className="label-sm"
            style={{ color: "var(--on-surface-muted)" }}
          >
            Saving…
          </span>
        )}
        <button type="button" className="btn btn-secondary" disabled>
          <Upload size={14} /> Import
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModal("new")}
        >
          <Plus size={14} /> New template
        </button>
      </div>

      {/* Content */}
      {status === "pending" && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={28} />
        </div>
      )}

      {status === "error" && (
        <ErrorMessage
          message="Failed to load templates"
          onRetry={() => refetch()}
        />
      )}

      {status === "success" && groups.length === 0 && (
        <TemplatesEmpty
          onNew={() => setModal("new")}
          onImport={() => {
            /* Stage 5 will wire /import route */
          }}
        />
      )}

      {status === "success" &&
        grouped.map((g) => (
          <div key={g.key}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                padding: "4px 4px 10px",
              }}
            >
              <div className="title-md">{g.key}</div>
              <div className="label-sm" style={{ fontSize: 10 }}>
                {g.items.length} template{g.items.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {g.items.map((t) => (
                <TemplateCard
                  key={t.id}
                  group={t}
                  onEdit={() => setModal(t)}
                />
              ))}
            </div>
          </div>
        ))}

      {modal && (
        <TemplateModal
          group={modal === "new" ? undefined : modal}
          onSave={upsert}
          onDelete={remove}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="label-sm" style={{ fontSize: 10 }}>
        {label}
      </div>
      <div
        className="title-md mono"
        style={{ color: accent ? "var(--accent)" : "var(--on-surface)" }}
      >
        {value}
      </div>
    </div>
  );
}

/** Hours between two HH:MM:SS times. */
function durationHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh + em / 60 - sh - sm / 60;
}

/* ─── Empty state ─── */

function TemplatesEmpty({
  onNew,
  onImport,
}: {
  onNew: () => void;
  onImport: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--surface-container)",
        borderRadius: "var(--r-2xl)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        padding: "72px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 200,
          height: 96,
          marginBottom: 28,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * 26,
              top: i * 10,
              width: 148,
              height: 64,
              borderRadius: 12,
              background:
                i === 2 ? "var(--surface-lowest)" : "var(--surface-high)",
              boxShadow: i === 2 ? "var(--shadow-ambient)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
              opacity: 0.4 + i * 0.3,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background:
                  i === 2
                    ? "color-mix(in oklab, var(--accent-fixed) 55%, var(--surface-high))"
                    : "var(--surface-highest)",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 7,
                  width: "70%",
                  borderRadius: 4,
                  background: "var(--surface-highest)",
                }}
              />
              <div
                style={{
                  height: 5,
                  width: "45%",
                  borderRadius: 4,
                  background: "var(--surface-highest)",
                  marginTop: 6,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="headline-md">Build your week once</div>
      <div
        className="body-md"
        style={{
          color: "var(--on-surface-muted)",
          maxWidth: 420,
          marginTop: 8,
        }}
      >
        Templates are the recurring shifts your café runs on — opening bar,
        weekend brunch, close. Define them once and every new schedule starts
        90% done.
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNew}
        >
          <Plus size={14} /> Create a template
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onImport}
          disabled
        >
          <Upload size={14} /> Import (coming soon)
        </button>
      </div>
      <div className="label-sm" style={{ marginTop: 18, fontSize: 10 }}>
        Most cafés start with 6–10 templates
      </div>
    </div>
  );
}
