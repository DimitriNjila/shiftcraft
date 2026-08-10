import type { CSSProperties } from "react";

function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export interface AvatarProps {
  name: string;
  size?: number;
  circle?: boolean;
  style?: CSSProperties;
}

/** Hue-hashed initials tile. Warm oklch bg + darker text of the same hue. */
export function Avatar({ name, size = 32, circle, style }: AvatarProps) {
  const hue = hashHue(name);
  const isCircle = circle ?? size >= 40;
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: isCircle ? "50%" : 8,
        background: `oklch(0.82 0.06 ${hue})`,
        color: `oklch(0.28 0.08 ${hue})`,
        fontSize: Math.max(10, size * 0.38),
        ...style,
      }}
      title={name}
    >
      {initials(name)}
    </div>
  );
}
