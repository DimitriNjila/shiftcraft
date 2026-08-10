import { useRef, useState } from "react";

interface Series {
  labels: string[];
  scheduled: number[];
  forecast: number[];
  unit: string;
}

interface TrendChartProps {
  weekly: Series;
  monthly: Series;
}

export function TrendChart({ weekly, monthly }: TrendChartProps) {
  const [mode, setMode] = useState<"Weekly" | "Monthly">("Monthly");
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const d = mode === "Weekly" ? weekly : monthly;

  const W = 720;
  const H = 240;
  const padL = 44;
  const padR = 16;
  const padT = 14;
  const padB = 28;
  const all = [...d.scheduled, ...d.forecast];
  const max = Math.max(...all) * 1.08;
  const min = Math.min(...all) * 0.85;
  const x = (i: number) =>
    padL + (i / (d.labels.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const path = (arr: number[]) =>
    arr.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const ticks = 4;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let idx = Math.round(((px - padL) / (W - padL - padR)) * (d.labels.length - 1));
    idx = Math.max(0, Math.min(d.labels.length - 1, idx));
    setHover(idx);
  };

  return (
    <div className="section">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div>
          <div className="headline-md">Coverage trend</div>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <span
              className="body-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
              Scheduled
            </span>
            <span
              className="body-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--on-surface-faint)",
                }}
              />
              Forecast
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            background: "var(--surface-lowest)",
            borderRadius: 9,
            boxShadow: "inset 0 0 0 1px var(--hairline)",
            padding: 3,
          }}
        >
          {(["Weekly", "Monthly"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setHover(null);
              }}
              style={{
                padding: "5px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                background: mode === m ? "var(--surface-high)" : "transparent",
                color: mode === m ? "var(--on-surface)" : "var(--on-surface-muted)",
                boxShadow: mode === m ? "inset 0 0 0 1px var(--hairline)" : "none",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block" }}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          {Array.from({ length: ticks + 1 }, (_, i) => {
            const v = min + (i / ticks) * (max - min);
            const step = mode === "Monthly" ? 100 : 1;
            return (
              <g key={i}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={y(v)}
                  y2={y(v)}
                  stroke="var(--hairline-strong)"
                  strokeDasharray="3 4"
                />
                <text
                  x={padL - 8}
                  y={y(v) + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--on-surface-faint)"
                  fontFamily="var(--font-mono)"
                >
                  {Math.round(v / step) * step}
                </text>
              </g>
            );
          })}
          {d.labels.map((l, i) => (
            <text
              key={l}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="var(--on-surface-faint)"
              fontFamily="var(--font-label)"
            >
              {l}
            </text>
          ))}
          {hover !== null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={H - padB}
              stroke="var(--on-surface-faint)"
              strokeDasharray="3 3"
            />
          )}
          <path
            d={path(d.forecast)}
            fill="none"
            stroke="var(--on-surface-faint)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d={path(d.scheduled)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {hover !== null && (
            <g>
              <circle
                cx={x(hover)}
                cy={y(d.forecast[hover])}
                r="4"
                fill="var(--surface-lowest)"
                stroke="var(--on-surface-faint)"
                strokeWidth="2"
              />
              <circle
                cx={x(hover)}
                cy={y(d.scheduled[hover])}
                r="4.5"
                fill="var(--surface-lowest)"
                stroke="var(--accent)"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
        {hover !== null && (
          <div
            style={{
              position: "absolute",
              left: `${(x(hover) / W) * 100}%`,
              top: `${(y(d.scheduled[hover]) / H) * 100}%`,
              transform: `translate(${
                hover > d.labels.length / 2 ? "calc(-100% - 14px)" : "14px"
              }, -50%)`,
              background: "var(--surface-lowest)",
              borderRadius: 10,
              boxShadow:
                "inset 0 0 0 1px var(--hairline), var(--shadow-lift)",
              padding: "10px 12px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 2,
            }}
          >
            <div className="label-sm" style={{ marginBottom: 6 }}>
              {d.labels[hover]} {mode === "Monthly" ? "2026" : ""}
            </div>
            <div
              className="body-sm"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
              Scheduled{" "}
              <b className="mono" style={{ marginLeft: "auto", paddingLeft: 12 }}>
                {d.scheduled[hover]}
                {d.unit}
              </b>
            </div>
            <div
              className="body-sm"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 3,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--on-surface-faint)",
                }}
              />
              Forecast{" "}
              <b className="mono" style={{ marginLeft: "auto", paddingLeft: 12 }}>
                {d.forecast[hover]}
                {d.unit}
              </b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
