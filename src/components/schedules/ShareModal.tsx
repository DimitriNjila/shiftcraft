import { useEffect, useState } from "react";
import {
  X,
  Send,
  Copy,
  Check,
  Clock,
  Mail,
  Phone,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  useGenerateShareLink,
  useRevokeShareLink,
} from "@/lib/hooks/use-share-link";

interface ShareModalProps {
  scheduleId: string;
  weekLabel: string;
  onClose: () => void;
}

/**
 * On mount, immediately generates a fresh share token for the schedule
 * (POST /schedules/:id/share). The user sees the copyable link, quick-share
 * buttons, and a revoke option. Rotating (regen) issues a new token and
 * silently invalidates the old one.
 */
export function ShareModal({
  scheduleId,
  weekLabel,
  onClose,
}: ShareModalProps) {
  const generate = useGenerateShareLink();
  const revoke = useRevokeShareLink();
  const [copied, setCopied] = useState(false);
  const [revoked, setRevoked] = useState(false);

  // Kick off token generation on mount (once).
  useEffect(() => {
    if (!generate.data && !generate.isPending && !generate.isError) {
      generate.mutate(scheduleId);
    }
    // Intentionally only depends on scheduleId; the mutate ref is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  const token = generate.data?.share_token;
  const expiresAt = generate.data?.share_expires_at;

  // Public URL rendered in the field. Uses the frontend origin so it can
  // be opened without a login (the /shared/:token route handles fetching).
  //
  // We include the schedule_id as a `s` query param so the public view can
  // pass it to the iCal endpoint (the public schedule payload doesn't
  // include it). The UUID isn't sensitive — the token gates the read.
  const shareUrl = token
    ? `${window.location.origin}/shared/${token}?s=${scheduleId}`
    : "";
  const displayUrl = token
    ? `${window.location.host}/shared/${token}`
    : "Generating link…";

  const expiresLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copy failed — try selecting the link manually.");
    }
  };

  const shareVia = (kind: "whatsapp" | "email" | "sms") => {
    if (!shareUrl) return;
    const text = `Here's the schedule for ${weekLabel}: ${shareUrl}`;
    if (kind === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        "_blank",
      );
    } else if (kind === "email") {
      const body = `Hi,\n\nHere's the schedule for ${weekLabel}:\n${shareUrl}\n\nThe link works from any browser — no login needed.`;
      window.location.href = `mailto:?subject=${encodeURIComponent(
        `Schedule · ${weekLabel}`,
      )}&body=${encodeURIComponent(body)}`;
    } else {
      window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
    }
  };

  const handleRevoke = () => {
    revoke.mutate(scheduleId, {
      onSuccess: () => setRevoked(true),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 440 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
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

        {revoked ? (
          <RevokedState onClose={onClose} />
        ) : generate.isError ? (
          <ErrorState
            onRetry={() => generate.mutate(scheduleId)}
            isRetrying={generate.isPending}
          />
        ) : (
          <>
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
                <Send
                  size={14}
                  style={{
                    color: "var(--on-surface-faint)",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: 12.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    opacity: token ? 1 : 0.6,
                  }}
                >
                  {displayUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={copy}
                className="btn btn-primary"
                style={{ minWidth: 92, justifyContent: "center" }}
                disabled={!token}
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
              <QuickShare
                label="WhatsApp"
                disabled={!token}
                onClick={() => shareVia("whatsapp")}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3 0-.2 0-.3-.1-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.7.3a2.8 2.8 0 00-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3z" />
                </svg>
              </QuickShare>
              <QuickShare
                label="Email"
                disabled={!token}
                onClick={() => shareVia("email")}
              >
                <Mail size={18} />
              </QuickShare>
              <QuickShare
                label="Text"
                disabled={!token}
                onClick={() => shareVia("sms")}
              >
                <Phone size={18} />
              </QuickShare>
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
              <Clock
                size={15}
                style={{ color: "var(--on-surface-muted)", flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div className="body-sm" style={{ fontSize: 12.5 }}>
                  {expiresLabel
                    ? `Link expires ${expiresLabel}`
                    : "Link is active for 7 days"}
                </div>
                <div
                  className="label-sm"
                  style={{
                    fontSize: 9.5,
                    textTransform: "none",
                    letterSpacing: "normal",
                  }}
                >
                  Viewers see first names and shift times only — no pay data.
                </div>
              </div>
              <button
                type="button"
                onClick={handleRevoke}
                className="btn btn-ghost"
                style={{
                  fontSize: 12,
                  color: "var(--warning)",
                  padding: "4px 8px",
                }}
                disabled={!token || revoke.isPending}
              >
                {revoke.isPending ? "Revoking…" : "Revoke"}
              </button>
            </div>

            {token && (
              <Link
                to={`/shared/${token}?s=${scheduleId}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 14,
                  fontSize: 12.5,
                  textDecoration: "none",
                }}
              >
                Preview what your team sees <ChevronRight size={13} />
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QuickShare({
  label,
  children,
  disabled,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={onClick}
      disabled={disabled}
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

function RevokedState({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        marginTop: 20,
        padding: "20px 16px",
        background: "var(--surface-container)",
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <div className="title-md" style={{ marginBottom: 6 }}>
        Link revoked.
      </div>
      <div
        className="body-sm"
        style={{
          color: "var(--on-surface-muted)",
          marginBottom: 14,
        }}
      >
        The old link no longer works. Close this dialog and reopen it to
        generate a fresh link.
      </div>
      <button type="button" className="btn btn-primary" onClick={onClose}>
        Done
      </button>
    </div>
  );
}

function ErrorState({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div
      style={{
        marginTop: 20,
        padding: "16px",
        background: "var(--surface-container)",
        borderRadius: 12,
      }}
    >
      <div className="title-sm" style={{ marginBottom: 4 }}>
        Couldn't generate a share link.
      </div>
      <div
        className="body-sm"
        style={{ color: "var(--on-surface-muted)", marginBottom: 12 }}
      >
        Check your connection and try again.
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}
