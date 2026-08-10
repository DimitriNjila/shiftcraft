/**
 * Hue map for the app's role enum. Values chosen to match the design's
 * oklch role palette (Server → emerald-ish, Cook → orange, Host → blue,
 * Manager → violet). Unknown roles fall back to a neutral 240.
 */
const ROLE_HUE: Record<string, number> = {
  Server: 155,
  Cook: 30,
  Host: 210,
  Manager: 280,
  // Aliases used elsewhere in the app / design:
  Baker: 280,
  Barista: 30,
  Cashier: 210,
  Lead: 155,
};

export function roleHue(role: string): number {
  return ROLE_HUE[role] ?? 240;
}
