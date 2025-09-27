import type { Route } from "./routes.ts";

const SCROLLS: Partial<Record<Route, number>> = {};

export function save(route: Route) {
  SCROLLS[route] =
    globalThis.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;
}

export function restore(route: Route) {
  const target = SCROLLS[route] ?? 0;
  let tries = 0;
  const maxTries = 60;
  function tick() {
    tries++;
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    if (h >= target + 1 || tries >= maxTries) {
      globalThis.scrollTo(0, target);
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(() => requestAnimationFrame(tick));
}
