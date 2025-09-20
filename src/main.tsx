import "@styles/styles.css";
import { h, mount, useEffect, useState } from "@lib/tiny-preact.ts";
import Layout from "@components/Layout.tsx";
import {
  ROUTES,
  getRoute,
  attachRouter,
  type Route,
} from "@src/router/router.ts";

function App() {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const cleanup = attachRouter(setRoute);
    return cleanup;
  }, []);

  const { component: Screen, layout } = ROUTES[route];

  return (
    <Layout currentPath={route} fluid={layout?.fluid ?? false}>
      <Screen key={route} />
    </Layout>
  );
}

const root = document.getElementById("app") as HTMLElement;
mount(<App />, root);
