type DocumentWithVT = Document & {
  startViewTransition?: (updateDOM: () => void) => {
    ready?: Promise<void>;
    finished?: Promise<void>;
    updateCallbackDone?: Promise<void>;
  };
};

export function supportsViewTransitions(): boolean {
  return typeof (document as DocumentWithVT).startViewTransition === "function";
}

export function withViewTransition(updateDom: () => void): void {
  const doc = document as DocumentWithVT;
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(updateDom);
  } else {
    updateDom(); // fallback
  }
}

export function attachHashRouter<T>(
  getRoute: () => T,
  setRoute: (r: T) => void
): () => void {
  const onHash = () => {
    const next = getRoute();
    withViewTransition(() => setRoute(next));
  };

  globalThis.addEventListener("hashchange", onHash);
  return () => globalThis.removeEventListener("hashchange", onHash);
}
