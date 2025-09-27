import {
  LoginPage,
  RegisterPage,
  HomeScreen,
  CounterScreen,
  AboutScreen,
  PokeScreen,
} from "@pages/index.ts";

export const ROUTE_DEFS = [
  {
    path: "#/login" as const,
    component: LoginPage,
    layout: { fluid: false, navbar: false },
  },
  {
    path: "#/register" as const,
    component: RegisterPage,
    layout: { fluid: false, navbar: false },
  },
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
type LayoutMeta = { fluid?: boolean; navbar?: boolean };

export const ROUTES: Record<
  Route,
  { component: ScreenCmp; layout?: LayoutMeta }
> = Object.fromEntries(
  ROUTE_DEFS.map((r) => [r.path, { component: r.component, layout: r.layout }])
) as Record<Route, { component: ScreenCmp; layout?: LayoutMeta }>;
