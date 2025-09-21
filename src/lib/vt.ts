// Global toggle for enabling/disabling View Transitions
// Set to `false` if you want to completely disable animations
export const ENABLE_VIEW_TRANSITIONS = true;

type DocumentWithVT = Document & {
  startViewTransition?: (updateDOM: () => void) => {
    ready?: Promise<void>;
    finished?: Promise<void>;
    updateCallbackDone?: Promise<void>;
  };
};

/**
 * Checks if View Transitions are supported AND enabled globally
 */
export function supportsViewTransitions(): boolean {
  return (
    ENABLE_VIEW_TRANSITIONS &&
    typeof (document as DocumentWithVT).startViewTransition === "function"
  );
}

/**
 * Runs a DOM update with View Transitions if:
 *  - The feature is supported by the browser
 *  - The global toggle is enabled
 * Otherwise, it just applies the DOM update directly without animation
 */
export function withViewTransition(updateDom: () => void): void {
  if (!ENABLE_VIEW_TRANSITIONS) {
    // Skip animations: apply the DOM update immediately
    updateDom();
    return;
  }

  const doc = document as DocumentWithVT;
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(updateDom);
  } else {
    updateDom();
  }
}
