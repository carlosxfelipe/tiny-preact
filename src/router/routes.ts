import {
  HomeScreen,
  CounterScreen,
  AboutScreen,
  PokeScreen,
} from "@screens/index.ts";

export const ROUTE_DEFS = [
  { path: "#/" as const, component: HomeScreen, layout: { fluid: false } },
  {
    path: "#/counter" as const,
    component: CounterScreen,
    layout: { fluid: false },
  },
  {
    path: "#/about" as const,
    component: AboutScreen,
    layout: { fluid: false },
  },
  {
    path: "#/pokedex" as const,
    component: PokeScreen,
    layout: { fluid: true },
  },
] as const;

export type Route = (typeof ROUTE_DEFS)[number]["path"];
type ScreenCmp = () => JSX.Element;

export const ROUTES: Record<
  Route,
  { component: ScreenCmp; layout?: { fluid?: boolean } }
> = Object.fromEntries(
  ROUTE_DEFS.map((r) => [r.path, { component: r.component, layout: r.layout }])
) as Record<Route, { component: ScreenCmp; layout?: { fluid?: boolean } }>;
