import { navigate as vtNavigate, setTransitionScope } from "@lib/vt.ts";
import { ROUTE_DEFS, ROUTES } from "./routes.ts";
import type { Route } from "./routes.ts";

export { ROUTES };
export type { Route };

export function getRoute(): Route {
  const h = globalThis.location?.hash || "#/";
  const path = h.split("?")[0];
  const match =
    ROUTE_DEFS.filter((r) => path === r.path || path.startsWith(r.path)).sort(
      (a, b) => b.path.length - a.path.length
    )[0] ?? ROUTE_DEFS[0];
  return match.path;
}

export function getSearch(): URLSearchParams {
  const hash = globalThis.location?.hash || "#/";
  const i = hash.indexOf("?");
  return new URLSearchParams(i >= 0 ? hash.slice(i + 1) : "");
}

export function attachRouter(setRoute: (r: Route) => void): () => void {
  const onHash = () => {
    const next = getRoute();
    vtNavigate(() => {
      const main = document.querySelector("main");
      if (main) setTransitionScope(main, "page");
      setRoute(next);
    });
  };
  globalThis.addEventListener("hashchange", onHash);
  return () => globalThis.removeEventListener("hashchange", onHash);
}

export function navigate(
  to: Route,
  query?: Record<string, string | number | boolean>
) {
  const base = to.slice(1);
  const qs = query
    ? new URLSearchParams(
        Object.entries(query).map(([k, v]) => [k, String(v)])
      ).toString()
    : "";
  const next = qs ? `${base}?${qs}` : base;
  if (globalThis.location?.hash !== "#" + next) {
    vtNavigate(() => {
      globalThis.location.hash = next;
    });
  }
}
