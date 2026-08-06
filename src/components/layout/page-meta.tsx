import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface PageMeta {
  title?: string;
  eyebrow?: string;
  breadcrumbs?: string[];
  actions?: ReactNode;
}

interface PageMetaCtx {
  meta: PageMeta;
  setMeta: (meta: PageMeta) => void;
}

const Ctx = createContext<PageMetaCtx | null>(null);

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<PageMeta>({});
  return <Ctx.Provider value={{ meta, setMeta }}>{children}</Ctx.Provider>;
}

export function usePageMetaValue(): PageMeta {
  const ctx = useContext(Ctx);
  return ctx?.meta ?? {};
}

/**
 * Pages call `usePageMeta({...})` at the top of their render to populate the
 * Topbar. Meta is cleared when the page unmounts.
 *
 * Only text content (title/eyebrow/breadcrumbs) triggers the effect —
 * `actions` is a JSX ReactNode built fresh each render, so putting it in
 * the deps array would cause an infinite render loop. We snapshot the
 * full meta via a ref, and re-push whenever text content changes; the
 * latest `actions` at that moment goes along for the ride.
 */
export function usePageMeta(meta: PageMeta) {
  const ctx = useContext(Ctx);
  const metaRef = useRef(meta);
  metaRef.current = meta;

  const contentKey = JSON.stringify({
    title: meta.title,
    eyebrow: meta.eyebrow,
    breadcrumbs: meta.breadcrumbs,
  });

  useEffect(() => {
    if (!ctx) return;
    ctx.setMeta(metaRef.current);
    return () => ctx.setMeta({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey]);
}
