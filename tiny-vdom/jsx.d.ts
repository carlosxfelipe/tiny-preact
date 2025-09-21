import type { VNode } from "./tiny-vdom.ts";

export {};

declare global {
  namespace JSX {
    type Element = VNode;

    interface ElementChildrenAttribute {
      children: unknown;
    }

    interface IntrinsicAttributes {
      key?: unknown;
      ref?:
        | ((el: globalThis.Element | null) => void)
        | { current: globalThis.Element | null }
        | null;
    }

    type StyleValue = string | number | null | undefined;
    type StyleObject = Record<string, StyleValue>;

    interface DOMProps {
      class?: string;
      className?: string;
      id?: string;
      style?: string | StyleObject;
      dangerouslySetInnerHTML?: { __html: string };
      [k: `on${string}`]: unknown;
      [attr: string]: unknown;
    }

    interface IntrinsicElements {
      [elemName: string]: DOMProps;
    }
  }
}
