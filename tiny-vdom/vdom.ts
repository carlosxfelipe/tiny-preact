export type Props = Record<string, unknown> & { children?: unknown };
export type Child = VNode | string | number | boolean | null | undefined;
export type FC<P = Record<string, unknown>> =
  (props: P & { children?: Child | Child[] }) => VNode | null;

export type Ref<R = Element> = ((el: R | null) => void) | { current: R | null };

export interface VNode {
  type: string | typeof TEXT | FC<unknown>;
  props: Props;
  children: (VNode | null)[];
  __dom?: Node | null;
  _rendered?: VNode | null;
  _hooks?: HookBag | null;
  _propsWC?: Record<string, unknown> | null;
}

export interface HookBag {
  hooks: unknown[];
  hookIndex: number;
  effects: { i: number; effect: () => void | (() => void) }[];
  effectCleanups: (null | (() => void))[];
  __needsFlush?: boolean;
  __root?: HTMLElement | null;
  __node?: Node | null;
}

export const TEXT = Symbol("text");
export const SVG_NS = "http://www.w3.org/2000/svg";

export function h(
  type: VNode["type"],
  props: Props | null,
  ...children: Child[]
): VNode {
  props ||= {};
  const flat: Child[] = [];
  (function flatPush(arr: Child[]) {
    for (const c of arr) Array.isArray(c) ? flatPush(c as Child[]) : flat.push(c);
  })(children);
  return { type, props, children: flat.map(normalize) } as VNode;
}

function normalize(node: Child): VNode | null {
  if (node == null || node === false || node === true) return null;
  if (typeof node === "object" && (node as VNode)?.type) return node as VNode;
  return { type: TEXT, props: { nodeValue: String(node) }, children: [] } as VNode;
}

// helpers de reconciliação
export function getKey(v: VNode | null): unknown {
  return (v?.props as { key?: unknown })?.key;
}
export function isSameType(a: VNode | null, b: VNode | null): boolean {
  if (!a || !b) return false;
  return a.type === b.type;
}
