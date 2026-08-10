import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Download, Calendar, ChevronRight } from "lucide-react";
import { useDownloadICal } from "@/lib/hooks/use-share-link";

interface ShareMenuProps {
  scheduleId: string | undefined;
  weekStart: string;
  weekLabel: string;
  disabled?: boolean;
  onOpenShare: () => void;
}

/**
 * The single "Share" entry point on the schedule toolbar. Clicking opens a
 * two-section dropdown that mirrors the design's ExportMenu:
 *
 *   Get it out of Mise en Place
 *     · Download PDF      → navigates to /schedules/print?week=...
 *     · Add to calendar   → triggers iCal .ics download
 *   ─── divider ───
 *   Share with your team
 *     · Share link        → opens the ShareModal on the schedule page
 */
export function ShareMenu({
  scheduleId,
  weekStart,
  weekLabel,
  disabled,
  onOpenShare,
}: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const download = useDownloadICal();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const goToPreview = () => {
    setOpen(false);
    navigate(`/schedules/print?week=${weekStart}`);
  };

  const doICal = () => {
    if (!scheduleId) return;
    setOpen(false);
    const safeWeek = weekLabel.replace(/[^\w-]+/g, "_");
    download.mutate({
      scheduleId,
      filename: `schedule_${safeWeek}.ics`,
    });
  };

  const doShareLink = () => {
    setOpen(false);
    onOpenShare();
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || !scheduleId}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Send size={14} /> Share
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 300,
            zIndex: 60,
            background: "var(--surface-lowest)",
            borderRadius: 16,
            padding: 8,
            boxShadow:
              "var(--shadow-lift), inset 0 0 0 1px var(--hairline)",
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            className="label-md"
            style={{ padding: "8px 12px 4px" }}
          >
            Get it out of Mise en Place
          </div>
          <ShareItem
            icon={<Download size={15} />}
            label="Download PDF"
            sub="Branded weekly grid for the break room"
            onClick={goToPreview}
          />
          <ShareItem
            icon={<Calendar size={15} />}
            label={download.isPending ? "Downloading…" : "Add to calendar"}
            sub="iCal feed — stays in sync"
            onClick={doICal}
            disabled={download.isPending}
          />

          <div className="divider-ghost" style={{ margin: "6px 10px" }} />

          <div
            className="label-md"
            style={{ padding: "8px 12px 4px" }}
          >
            Share with your team
          </div>
          <ShareItem
            icon={<Send size={15} />}
            label="Share link"
            sub="Read-only link, no login needed"
            onClick={doShareLink}
          />
        </div>
      )}
    </div>
  );
}

function ShareItem({
  icon,
  label,
  sub,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 10,
        background: "transparent",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) =>
        !disabled &&
        (e.currentTarget.style.background = "var(--surface-container)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "var(--surface-container)",
          color: "var(--accent)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="title-sm" style={{ fontSize: 13 }}>
          {label}
        </div>
        <div
          className="label-sm"
          style={{
            fontSize: 9.5,
            textTransform: "none",
            letterSpacing: "normal",
          }}
        >
          {sub}
        </div>
      </div>
      <ChevronRight size={13} style={{ color: "var(--on-surface-faint)" }} />
    </button>
  );
}
