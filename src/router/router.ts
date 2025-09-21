import { withViewTransition } from "@src/vt.ts";
import { HomeScreen, CounterScreen, AboutScreen } from "@screens/index.ts";
import PokeScreen from "@screens/PokeScreen.tsx";

export type Route = "#/" | "#/counter" | "#/about" | "#/pokedex";
type ScreenCmp = () => JSX.Element;

/**
 * Layout options
 *
 * `fluid` controls how wide the <main> content area should be:
 *
 * - fluid: false (default) → content is centered and constrained
 *   (max-width: 1024px, better for text-heavy or static pages).
 *
 * - fluid: true → content stretches to use the full viewport width
 *   (max-width: none, better for dashboards, counters, tables).
 *
 * Example:
 * "#/counter" uses `fluid: true` so it expands,
 * while "#/" and "#/about" stay in a centered layout.
 */
export const ROUTES: Record<
  Route,
  { component: ScreenCmp; layout?: { fluid?: boolean } }
> = {
  "#/": {
    component: HomeScreen,
    layout: { fluid: false },
  },
  "#/counter": {
    component: CounterScreen,
    layout: { fluid: false },
  },
  "#/about": {
    component: AboutScreen,
    layout: { fluid: false },
  },
  "#/pokedex": { component: PokeScreen, layout: { fluid: true } },
};

export function getRoute(): Route {
  const h = globalThis.location?.hash || "#/";
  if (h.startsWith("#/counter")) return "#/counter";
  if (h.startsWith("#/about")) return "#/about";
  if (h.startsWith("#/pokedex")) return "#/pokedex";
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
