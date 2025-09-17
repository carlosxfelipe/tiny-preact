import "./styles.css";
import { h, mount, useEffect, useState } from "./tiny-preact.ts";
import Layout from "./components/Layout.tsx";
import { HomeScreen, CounterScreen, AboutScreen } from "./screens/index.ts";
import { attachHashRouter } from "./vt.ts";

type Route = "#/" | "#/counter" | "#/about";

/** Componente de tela sem props, retornando sempre JSX.Element (VNode) */
type ScreenCmp = () => JSX.Element;

function getRoute(): Route {
  const h = globalThis.location?.hash || "#/";
  if (h.startsWith("#/counter")) return "#/counter";
  if (h.startsWith("#/about")) return "#/about";
  return "#/";
}

const ROUTES: Record<Route, ScreenCmp> = {
  "#/": HomeScreen as ScreenCmp,
  "#/counter": CounterScreen as ScreenCmp,
  "#/about": AboutScreen as ScreenCmp,
};

function App() {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const cleanup = attachHashRouter(getRoute, setRoute);
    return cleanup;
  }, []);

  const Screen = ROUTES[route];

  return (
    <Layout currentPath={route}>
      {/* força recriar a subárvore quando a rota muda */}
      <Screen key={route} />
    </Layout>
  );
}

const root = document.getElementById("app") as HTMLElement;
mount(<App />, root);
