import { useState } from "react";
import { ChevronDown } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Grid of 4 weeks × 7 days. Values are 0–1 intensity. */
export function Heatmap({
  weeks,
  data,
  month = "April",
}: {
  weeks: string[];
  /** 4 rows × 7 cols, values 0–1. */
  data: number[][];
  month?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div
      className="section"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="headline-md">Labor intensity</div>
        <div className="chip" style={{ background: "var(--surface-lowest)" }}>
          {month} <ChevronDown size={12} />
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "34px repeat(7, 1fr)",
          gap: 6,
          flex: 1,
        }}
      >
        <div />
        {DAYS.map((d) => (
          <div
            key={d}
            className="label-sm"
            style={{ fontSize: 9.5, textAlign: "center" }}
          >
            {d}
          </div>
        ))}
        {data.map((row, wi) => (
          <FragmentRow
            key={wi}
            weekLabel={weeks[wi]}
            row={row}
            wi={wi}
            hover={hover}
            setHover={setHover}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 14,
        }}
      >
        <span className="label-sm" style={{ fontSize: 9.5 }}>
          Light
        </span>
        {[0.15, 0.35, 0.55, 0.8, 1].map((v) => (
          <span
            key={v}
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              background: `color-mix(in oklab, var(--accent) ${Math.round(v * 62)}%, var(--surface-high))`,
              boxShadow: "inset 0 0 0 1px var(--hairline)",
            }}
          />
        ))}
        <span className="label-sm" style={{ fontSize: 9.5 }}>
          Peak
        </span>
      </div>
    </div>
  );
}

function FragmentRow({
  weekLabel,
  row,
  wi,
  hover,
  setHover,
}: {
  weekLabel: string;
  row: number[];
  wi: number;
  hover: string | null;
  setHover: (h: string | null) => void;
}) {
  return (
    <>
      <div
        className="label-sm"
        style={{ fontSize: 9.5, alignSelf: "center" }}
      >
        {weekLabel}
      </div>
      {row.map((v, di) => {
        const key = `${wi}-${di}`;
        return (
          <div
            key={di}
            title={`${weekLabel} ${DAYS[di]} · ${Math.round(v * 110)}h`}
            onMouseEnter={() => setHover(key)}
            onMouseLeave={() => setHover(null)}
            style={{
              aspectRatio: "1.5",
              borderRadius: 6,
              background: `color-mix(in oklab, var(--accent) ${Math.round(v * 62)}%, var(--surface-high))`,
              boxShadow:
                hover === key
                  ? "inset 0 0 0 1.5px var(--accent)"
                  : "inset 0 0 0 1px var(--hairline)",
              cursor: "default",
              transition: "box-shadow 0.1s",
            }}
          />
        );
      })}
    </>
  );
}
