import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";

export interface AiSuggestion {
  name: string;
  shift: string;
  confidence: number;
}

export function AiPanel({
  suggestions,
  emptyMessage = "No open shifts — nice work.",
}: {
  suggestions: AiSuggestion[];
  emptyMessage?: string;
}) {
  const hasSuggestions = suggestions.length > 0;
  return (
    <div
      className="ink-panel grain"
      style={{
        borderRadius: "var(--r-2xl)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
        padding: 22,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-40px -40px auto auto",
          width: 200,
          height: 200,
          background:
            "radial-gradient(circle, rgba(113,219,166,0.24), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} style={{ color: "#71dba6" }} />
          <div className="label-md" style={{ color: "rgba(242,239,233,0.7)" }}>
            Mise AI
          </div>
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 22,
            lineHeight: 1.15,
          }}
        >
          {hasSuggestions ? (
            <>
              {suggestions.length} open shifts{" "}
              <em style={{ color: "#71dba6" }}>need covering.</em>
            </>
          ) : (
            <>
              Everything is{" "}
              <em style={{ color: "#71dba6" }}>in its place.</em>
            </>
          )}
        </div>
        <div
          className="body-sm"
          style={{ color: "rgba(242,239,233,0.65)", marginTop: 6 }}
        >
          {hasSuggestions
            ? "Best candidates by availability, role match, and hours cap."
            : emptyMessage}
        </div>

        {hasSuggestions ? (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Avatar name={s.name} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="title-sm" style={{ fontSize: 13 }}>
                    {s.name}
                  </div>
                  <div
                    className="label-sm"
                    style={{
                      fontSize: 10,
                      color: "rgba(242,239,233,0.5)",
                    }}
                  >
                    {s.shift}
                  </div>
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "#71dba6" }}
                >
                  {s.confidence}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 40 }} />
        )}
        <div style={{ flex: 1 }} />
        <Link
          to="/schedules"
          className="btn btn-primary"
          style={{
            width: "100%",
            marginTop: 16,
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          <Sparkles size={15} />
          {hasSuggestions ? "Review & autofill" : "Open schedule"}
        </Link>
      </div>
    </div>
  );
}
