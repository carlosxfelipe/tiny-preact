export const transitionEnabledOnThisPage = true;

type VTLike = {
  ready?: Promise<void>;
  finished?: Promise<void>;
  updateCallbackDone?: Promise<void>;
};

type DocWithVT = Document & {
  startViewTransition?: (update: () => void) => VTLike;
};

type NavigateOptions = {
  history?: "auto" | "push" | "replace";
  formData?: FormData;
  viewTransition?: boolean; // force enable/disable per call
};

export function supportsViewTransitions(): boolean {
  return (
    transitionEnabledOnThisPage &&
    typeof (document as DocWithVT).startViewTransition === "function"
  );
}

/** Emit events on `document`, mirroring Astro's lifecycle event idea. */
function fire<T extends object>(name: string, detail?: T) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Mark an element as a transition "scope", à la Astro. */
export function setTransitionScope(el: Element, name: string | null): void {
  if (name) el.setAttribute("data-tp-transition-scope", name);
  else el.removeAttribute("data-tp-transition-scope");
}

/** Run a DOM update inside (or outside) a View Transition. */
export function withViewTransition(updateDom: () => void): VTLike | void {
  if (!transitionEnabledOnThisPage) return updateDom();
  const doc = document as DocWithVT;
  if (typeof doc.startViewTransition === "function") {
    return doc.startViewTransition(updateDom);
  }
  // Fallback: run immediately but return a compatible object.
  updateDom();
  return {};
}

/**
 * Navigation inspired by Astro's `navigate()`:
 * - fires before/after preparation & before/after swap events
 * - performs the DOM update inside a View Transition when supported
 */
export function navigate(doSwap: () => void, opts: NavigateOptions = {}): void {
  const wantVT = opts.viewTransition ?? transitionEnabledOnThisPage;

  fire("tp:before-preparation", { formData: opts.formData });

  // This is where you'd prefetch/load async data if needed.
  // Since this is a SPA, we consider things "ready" immediately.
  fire("tp:after-preparation", {});

  const runSwap = () => {
    fire("tp:before-swap", {});
    doSwap();
    fire("tp:after-swap", {});
  };

  if (!wantVT) {
    runSwap();
    return;
  }

  const vt = withViewTransition(runSwap);
  // Optional: you can use vt?.finished for global hooks.
  void vt?.finished;
}
