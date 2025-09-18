import type { VNode } from "./tiny-preact.ts";

export {};

declare global {
  namespace JSX {
    type Element = VNode;
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown>;
    }
  }
}
