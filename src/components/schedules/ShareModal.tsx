import { useState } from "react";
import { X, Send, Copy, Check, Clock, Mail, Phone, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  scheduleId: string;
  weekLabel: string;
  onClose: () => void;
}

/**
 * Stub for the Phase 3 shareable-link feature.
 * Displays the design's share modal shell with a dummy link; the real
 * generate/revoke API wiring lands in Stage 3.
 */
export function ShareModal({ weekLabel, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  // Placeholder link — Stage 3 will replace with the real share-token URL.
  const link = "mise.app/s/preview-not-yet-available";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copy failed — try selecting the link manually.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 440 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div className="label-md">Share schedule</div>
            <div className="headline-md" style={{ marginTop: 4 }}>
              Week of {weekLabel}
            </div>
            <div
              className="body-sm"
              style={{ color: "var(--on-surface-muted)", marginTop: 4 }}
            >
              Anyone with the link sees a read-only schedule. No account needed.
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-icon btn-ghost"
            aria-label="Close share modal"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "var(--surface-highest)",
              borderRadius: 10,
              minWidth: 0,
            }}
          >
            <Send size={14} style={{ color: "var(--on-surface-faint)", flexShrink: 0 }} />
            <span
              className="mono"
              style={{
                fontSize: 12.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {link}
            </span>
          </div>
          <button
            type="button"
            onClick={copy}
            className="btn btn-primary"
            style={{ minWidth: 92, justifyContent: "center" }}
            disabled
          >
            {copied ? (
              <>
                <Check size={14} /> Copied
              </>
            ) : (
              <>
                <Copy size={14} /> Copy
              </>
            )}
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <QuickShare label="WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3 0-.2 0-.3-.1-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.7.3a2.8 2.8 0 00-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3z" />
            </svg>
          </QuickShare>
          <QuickShare label="Email"><Mail size={18} /></QuickShare>
          <QuickShare label="Text"><Phone size={18} /></QuickShare>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 18,
            padding: "12px 14px",
            background: "var(--surface-container)",
            borderRadius: 12,
          }}
        >
          <Clock size={15} style={{ color: "var(--on-surface-muted)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="body-sm" style={{ fontSize: 12.5 }}>
              Shareable links launch in the next release.
            </div>
            <div
              className="label-sm"
              style={{
                fontSize: 9.5,
                textTransform: "none",
                letterSpacing: "normal",
              }}
            >
              Viewers will see first names and shift times only — no pay data.
            </div>
          </div>
        </div>

        <button
          className="btn btn-ghost"
          style={{
            width: "100%",
            justifyContent: "center",
            marginTop: 14,
            fontSize: 12.5,
          }}
          disabled
          type="button"
        >
          Preview what your team will see <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

function QuickShare({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="btn btn-secondary"
      disabled
      style={{
        flex: 1,
        justifyContent: "center",
        padding: "11px 8px",
        flexDirection: "column",
        gap: 6,
        height: "auto",
      }}
    >
      {children}
      <span style={{ fontSize: 11 }}>{label}</span>
    </button>
  );
}
