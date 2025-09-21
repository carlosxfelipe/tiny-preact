import { navigate as vtNavigate, setTransitionScope } from "@lib/vt.ts";
import { HomeScreen, CounterScreen, AboutScreen } from "@screens/index.ts";
import PokeScreen from "@screens/PokeScreen.tsx";

export type Route = "#/" | "#/counter" | "#/about" | "#/pokedex";
type ScreenCmp = () => JSX.Element;

export const ROUTES: Record<
  Route,
  { component: ScreenCmp; layout?: { fluid?: boolean } }
> = {
  "#/": { component: HomeScreen, layout: { fluid: false } },
  "#/counter": { component: CounterScreen, layout: { fluid: false } },
  "#/about": { component: AboutScreen, layout: { fluid: false } },
  "#/pokedex": { component: PokeScreen, layout: { fluid: true } },
};

/** Get the current route from the URL hash. */
export function getRoute(): Route {
  const h = globalThis.location?.hash || "#/";
  if (h.startsWith("#/counter")) return "#/counter";
  if (h.startsWith("#/about")) return "#/about";
  if (h.startsWith("#/pokedex")) return "#/pokedex";
  return "#/";
}

/** Attach a hashchange listener that triggers a route update inside a view transition. */
export function attachRouter(setRoute: (r: Route) => void): () => void {
  const onHash = () => {
    const next = getRoute();
    vtNavigate(() => {
      // Mark <main> as the "page" transition scope (logical equivalent to Astro's approach).
      const main = document.querySelector("main");
      if (main) setTransitionScope(main, "page");
      setRoute(next);
    });
  };
  globalThis.addEventListener("hashchange", onHash);
  return () => globalThis.removeEventListener("hashchange", onHash);
}

/** Programmatically navigate to a given route using a view transition. */
export function navigate(to: Route) {
  if (globalThis.location?.hash !== to) {
    vtNavigate(() => {
      globalThis.location.hash = to.slice(1);
    });
  }
}
