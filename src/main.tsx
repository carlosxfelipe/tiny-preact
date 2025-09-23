import "@styles/global.css";
import "@styles/vt.css";
import { h, mount, useEffect, useState } from "@tiny/tiny-vdom.ts";
import Layout from "@layout/Layout.tsx";
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
    <Layout
      currentPath={route}
      fluid={layout?.fluid ?? false}
      showNavbar={layout?.navbar ?? true}
    >
      <div key={`screen:${route}`} data-screen-root>
        <Screen />
      </div>
    </Layout>
  );
}

const root = document.getElementById("app") as HTMLElement;
mount(<App />, root);
