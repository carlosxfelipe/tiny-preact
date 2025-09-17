import "./styles.css";
import { h, mount, useEffect, useState } from "./tiny-preact.ts";
import Layout from "./components/Layout.tsx";
import { HomeScreen, CounterScreen, AboutScreen } from "./screens/index.ts";

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
    const onHash = () => setRoute(getRoute());
    globalThis.addEventListener("hashchange", onHash);
    return () => globalThis.removeEventListener("hashchange", onHash);
  }, []);

  const Screen = ROUTES[route];

  return (
    <Layout currentPath={route}>
      {/* força recriar o sub-árvore quando a rota muda */}
      <Screen key={route} />
    </Layout>
  );
}

const root = document.getElementById("app") as HTMLElement;
mount(<App />, root);
