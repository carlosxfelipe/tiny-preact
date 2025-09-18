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
    updateDom();
  }
}
