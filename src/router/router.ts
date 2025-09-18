import { withViewTransition } from "../vt.ts";
import { HomeScreen, CounterScreen, AboutScreen } from "../screens/index.ts";

export type Route = "#/" | "#/counter" | "#/about";
type ScreenCmp = () => JSX.Element;

export const ROUTES: Record<Route, ScreenCmp> = {
  "#/": HomeScreen as ScreenCmp,
  "#/counter": CounterScreen as ScreenCmp,
  "#/about": AboutScreen as ScreenCmp,
};

export function getRoute(): Route {
  const h = globalThis.location?.hash || "#/";
  if (h.startsWith("#/counter")) return "#/counter";
  if (h.startsWith("#/about")) return "#/about";
  return "#/";
}

export function attachRouter(setRoute: (r: Route) => void): () => void {
  const onHash = () => {
    const next = getRoute();
    withViewTransition(() => setRoute(next));
  };
  globalThis.addEventListener("hashchange", onHash);
  return () => globalThis.removeEventListener("hashchange", onHash);
}

export function navigate(to: Route) {
  if (globalThis.location?.hash !== to) {
    withViewTransition(() => {
      globalThis.location.hash = to.slice(1);
    });
  }
}
