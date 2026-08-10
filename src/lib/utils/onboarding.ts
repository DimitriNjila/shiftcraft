/**
 * Onboarding progress lives in localStorage so it can persist across the
 * step 3 hop-out to /templates or /import. The wizard writes to it directly
 * as each step is completed; downstream mutations (create template, create
 * schedule) also mark their step done so the SetupChecklist reflects real
 * state instead of "user visited this route once".
 */

export type OnboardStepId = "store" | "staff" | "templates";

export interface OnboardState {
  /** True while the checklist should be visible. Flipped to false once
   *  every step is ticked or the user dismisses the checklist. */
  active: boolean;
  /** Ids of the steps the user has already ticked. Order doesn't matter. */
  completed: OnboardStepId[];
  /** Optional cached store name so the checklist can show it before the
   *  restaurant record is refetched. */
  store?: string;
}

const KEY = "mp_onboard";

export function readOnboard(): OnboardState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OnboardState) : null;
  } catch {
    return null;
  }
}

export function writeOnboard(state: OnboardState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
  emitChange();
}

export function clearOnboard(): void {
  localStorage.removeItem(KEY);
  emitChange();
}

function emitChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mp:onboard"));
  }
}

/** Mark a step complete, in-place. No-op if already ticked or if the
 *  checklist isn't active (a returning user shouldn't get a resurrected
 *  checklist just because they create a schedule). Returns the new state. */
export function markStepComplete(step: OnboardStepId): OnboardState | null {
  const current = readOnboard();
  if (!current || !current.active) return null;
  if (current.completed.includes(step)) return current;
  const next: OnboardState = {
    ...current,
    completed: [...current.completed, step],
  };
  writeOnboard(next);
  return next;
}

/** Convenience: tick a step from anywhere (a mutation onSuccess, etc.).
 *  Safe to call unconditionally — no-ops when the checklist isn't active. */
export function tickOnboardStep(step: OnboardStepId): void {
  markStepComplete(step);
}
