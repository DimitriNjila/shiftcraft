/**
 * Minimal oklch → hex converter. Exists because html2canvas 1.x doesn't
 * understand the `oklch()` color function (it does its own color parsing
 * rather than deferring to the browser). We use oklch across the app for
 * role tinting; any DOM that ends up rasterized via html2canvas — right
 * now that's the PDF export — needs to hand it precomputed hex values.
 *
 * Standard oklab → linear sRGB matrix + gamma correction. No dependency.
 */

function srgbGammaEncode(x: number): number {
  const clamped = Math.max(0, Math.min(1, x));
  return clamped <= 0.0031308
    ? 12.92 * clamped
    : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

function componentToHex(x: number): string {
  const v = Math.round(x * 255);
  return v.toString(16).padStart(2, "0");
}

/**
 * Convert oklch(L C H) to a #rrggbb string.
 *  - L: 0..1 lightness
 *  - C: chroma
 *  - H: hue in degrees
 */
export function oklchToHex(L: number, C: number, H: number): string {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // oklab → LMS (cube-rooted)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS → linear sRGB
  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const r = srgbGammaEncode(rLin);
  const g = srgbGammaEncode(gLin);
  const bb = srgbGammaEncode(bLin);

  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(bb)}`;
}
