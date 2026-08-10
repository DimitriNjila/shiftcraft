import type { ReactNode } from "react";

interface Copy {
  eyebrow: string;
  head: ReactNode;
  sub: string;
  quote: string;
  who: string;
}

const COPY: Record<"login" | "signup" | "support", Copy> = {
  login: {
    eyebrow: "The evening brief",
    head: (
      <>
        Everything in its place{" "}
        <em style={{ color: "var(--accent)" }}>before doors open.</em>
      </>
    ),
    sub: "Tomorrow is drafted, explained, and in every pocket. Coffee is the only thing left to prepare.",
    quote:
      "“Our Friday-night schedule used to be a four-hour ritual. Now it takes fifteen minutes.”",
    who: "Elena Kovač · GM, Meridian Coffee",
  },
  signup: {
    eyebrow: "First service",
    head: (
      <>
        Set the stations.{" "}
        <em style={{ color: "var(--accent)" }}>Open with confidence.</em>
      </>
    ),
    sub: "Import your templates, review the draft, publish. Most cafés run their first week within an afternoon.",
    quote:
      "“We photographed the old whiteboard and it became shift templates in about a minute.”",
    who: "Daniel Aoki · Owner, Lumen Roasters",
  },
  support: {
    eyebrow: "One moment",
    head: (
      <>
        We’ll get you back to{" "}
        <em style={{ color: "var(--accent)" }}>service.</em>
      </>
    ),
    sub: "Reset your password and we’ll have you back on the floor in under a minute.",
    quote:
      "“Good tools quietly step aside when you need them, then reappear right when you don’t.”",
    who: "House principle · Mise en Place",
  },
};

const STATS: Array<[string, string]> = [
  ["1,240+", "cafés on board"],
  ["6.4 h", "saved weekly"],
  ["92%", "weeks from templates"],
];

export function EditorialPanel({
  variant = "login",
}: {
  variant?: "login" | "signup" | "support";
}) {
  const t = COPY[variant];
  return (
    <div className="editorial-panel">
      <img
        src="/auth-clouds.png"
        alt=""
        className="dither"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          imageRendering: "pixelated",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(239,236,228,0) 18%, rgba(239,236,228,0.88) 52%, rgba(239,236,228,0.94))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ color: "var(--accent)", fontSize: 14 }}>✳</span>
          <span
            className="label-md"
            style={{ color: "rgba(20,26,22,0.55)" }}
          >
            {t.eyebrow}
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 40 }} />
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontWeight: 400,
            fontSize: "clamp(26px, 2.4vw, 34px)",
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            color: "#141a16",
          }}
        >
          {t.head}
        </div>
        <div
          className="body-md"
          style={{
            color: "rgba(20,26,22,0.65)",
            marginTop: 10,
            maxWidth: "44ch",
            fontSize: 14,
          }}
        >
          {t.sub}
        </div>
        <div
          style={{
            height: 1,
            background: "rgba(20,26,22,0.14)",
            margin: "22px 0 16px",
          }}
        />
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontStyle: "italic",
            fontSize: 15.5,
            lineHeight: 1.45,
            color: "rgba(20,26,22,0.85)",
          }}
        >
          {t.quote}
        </div>
        <div
          className="label-sm"
          style={{ color: "rgba(20,26,22,0.5)", marginTop: 7 }}
        >
          {t.who}
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 18 }}>
          {STATS.map(([n, l]) => (
            <div key={l}>
              <div
                className="mono"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                {n}
              </div>
              <div
                className="label-sm"
                style={{ color: "rgba(20,26,22,0.5)", marginTop: 2 }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
