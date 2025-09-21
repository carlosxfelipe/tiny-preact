import { navigate as vtNavigate, setTransitionScope } from "@lib/vt.ts";
import { ROUTE_DEFS, ROUTES } from "./routes.ts";
import type { Route } from "./routes.ts";

export { ROUTES };
export type { Route };

export function getRoute(): Route {
  const h = globalThis.location?.hash || "#/";
  const match =
    ROUTE_DEFS.filter((r) => h === r.path || h.startsWith(r.path)).sort(
      (a, b) => b.path.length - a.path.length
    )[0] ?? ROUTE_DEFS[0];
  return match.path;
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

export function navigate(to: Route) {
  if (globalThis.location?.hash !== to) {
    vtNavigate(() => {
      globalThis.location.hash = to.slice(1);
    });
  }
}
