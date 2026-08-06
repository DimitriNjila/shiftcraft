import type { CSSProperties } from "react";

export interface BrandMarkProps {
  size?: number;
  style?: CSSProperties;
}

/** The Mise en Place ✳ mark — ink circle with cream glyph. */
export function BrandMark({ size = 26, style }: BrandMarkProps) {
  return (
    <div
      className="brand-mark"
      style={{ width: size, height: size, fontSize: size * 0.55, ...style }}
      aria-hidden
    >
      ✳
    </div>
  );
}

/** Wordmark: italic Newsreader "Mise en place". */
export function Wordmark({
  size = 15.5,
  showVersion,
}: {
  size?: number;
  showVersion?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 7, minWidth: 0 }}>
      <span
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: size,
          letterSpacing: "-0.005em",
          whiteSpace: "nowrap",
        }}
      >
        Mise en place
      </span>
      {showVersion && (
        <span className="label-sm" style={{ fontSize: 9 }}>
          v 3.0
        </span>
      )}
    </div>
  );
}
