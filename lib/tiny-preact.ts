// tiny-preact.ts — a tiny React/Preact-like library in one file (TypeScript)
// Features: h() (createElement), render()/mount(), basic diffing, and useState/useEffect for function components.
// No dependencies. Requires DOM APIs (document/HTMLElement): works in browsers, Deno with DOM enabled, and via CDNs.
// JSX supported in “classic” mode via `@jsx h` or `compilerOptions.jsxFactory: "h"`.

// --- Types ------------------------------------------------------------------
export type Props = Record<string, unknown> & { children?: unknown };
export type Child = VNode | string | number | boolean | null | undefined;
export type FC<P = Record<string, unknown>> = (
  props: P & { children?: Child[] }
) => VNode | Child;

export interface VNode {
  type: string | typeof TEXT | typeof Fragment | FC<unknown>;
  props: Props;
  children: (VNode | null)[];
  __dom?: Node | null;
  _rendered?: VNode | null;
  _hooks?: HookBag | null;
}

type HookEffect = { i: number; effect: () => void | (() => void) };

interface HookBag {
  hooks: unknown[];
  hookIndex: number;
  effects: HookEffect[];
  effectCleanups: (null | (() => void))[];
  __needsFlush?: boolean;
  __root?: HTMLElement | null; // reserved for potential multi-root support
}

// --- Root state (avoid DOM monkey-patching) ---------------------------------
const ROOT_VNODE = new WeakMap<HTMLElement, VNode | null>();
const ROOT_INST = new WeakMap<HTMLElement, HookBag>();

// --- VNode factory ----------------------------------------------------------
export function h(
  type: VNode["type"],
  props: Props | null,
  ...children: Child[]
): VNode {
  props ||= {};
  const flat: Child[] = [];
  (function flatPush(arr: Child[]) {
    for (const c of arr)
      Array.isArray(c) ? flatPush(c as Child[]) : flat.push(c);
  })(children);
  return { type, props, children: flat.map(normalize) } as VNode;
}

function normalize(node: Child): VNode | null {
  if (node == null || node === false || node === true) return null;
  if (typeof node === "object" && (node as VNode)?.type) return node as VNode;
  return {
    type: TEXT,
    props: { nodeValue: String(node) },
    children: [],
  } as VNode;
}

const TEXT = Symbol("text");
export const Fragment = Symbol("fragment");
const SVG_NS = "http://www.w3.org/2000/svg";

// Keyed reconciliation helpers
function getKey(v: VNode | null): unknown {
  return (v?.props as { key?: unknown })?.key;
}
function isSameType(a: VNode | null, b: VNode | null): boolean {
  if (!a || !b) return false;
  return a.type === b.type;
}

// --- Unmount & cleanup ------------------------------------------------------
function unmount(v: VNode | null) {
  if (!v) return;
  // unmount subtree first
  if (v._rendered) unmount(v._rendered);
  for (const c of v.children) if (c) unmount(c);

  // run effect cleanups
  const hooks = v._hooks;
  if (hooks && hooks.effectCleanups) {
    for (const cl of hooks.effectCleanups) {
      try {
        cl?.();
      } catch {}
    }
    hooks.effectCleanups = [];
  }
}

// --- Renderer ---------------------------------------------------------------
export function render(
  vnode: VNode | null,
  container: HTMLElement
): Node | null {
  const prev = ROOT_VNODE.get(container) ?? null;
  const inst: HookBag = ROOT_INST.get(container) ?? {
    hooks: [],
    effects: [],
    effectCleanups: [],
    hookIndex: 0,
  };
  inst.hookIndex = 0;
  const dom = diff(container, prev, vnode, inst);
  ROOT_VNODE.set(container, vnode);
  ROOT_INST.set(container, inst);
  flushEffects(inst); // effects are actually flushed asynchronously (see scheduleFlush)
  return dom;
}

function diff(
  parent: Node,
  oldVNode: VNode | null,
  newVNode: VNode | null,
  inst: HookBag,
  nextSibling: Node | null = null
): Node | null {
  if (oldVNode === newVNode) return oldVNode?.__dom ?? null;

  // Remove
  if (newVNode == null) {
    if (oldVNode) {
      unmount(oldVNode);
      if (oldVNode.__dom && oldVNode.__dom.parentNode === parent) {
        parent.removeChild(oldVNode.__dom);
      }
    }
    return null;
  }

  // Component
  if (typeof newVNode.type === "function") {
    return diffComponent(
      parent as HTMLElement,
      oldVNode,
      newVNode,
      inst,
      nextSibling
    );
  }

  // Fragment (no wrapper element; children go directly into parent)
  if (newVNode.type === Fragment) {
    // We'll reconcile children directly under `parent`
    const oldKidsAll = (oldVNode?.children || []) as (VNode | null)[];
    const newKidsAll = (newVNode.children || []) as (VNode | null)[];

    const oldKids = oldKidsAll.filter(Boolean) as VNode[];
    const newKids = newKidsAll.filter(Boolean) as VNode[];

    const oldKeyed = new Map<unknown, VNode>();
    const oldUnkeyed: VNode[] = [];
    for (const k of oldKids) {
      const key = getKey(k);
      if (key != null) oldKeyed.set(key, k);
      else oldUnkeyed.push(k);
    }

    let prevDom: Node | null = null;

    for (let i = 0; i < newKids.length; i++) {
      const newK = newKids[i];
      const newKey = getKey(newK);

      let match: VNode | null = null;

      if (newKey != null) {
        match = oldKeyed.get(newKey) || null;
        if (match) oldKeyed.delete(newKey);
      } else {
        let idx = -1;
        for (let j = 0; j < oldUnkeyed.length; j++) {
          if (isSameType(oldUnkeyed[j], newK)) {
            idx = j;
            break;
          }
        }
        if (idx === -1 && oldUnkeyed.length) idx = 0;
        if (idx !== -1) match = oldUnkeyed.splice(idx, 1)[0];
      }

      const childDom = diff(parent, match, newK, inst, null);
      if (childDom) {
        const containerEl = parent as Element;
        const needsMove =
          childDom !== prevDom &&
          (childDom.parentNode !== containerEl ||
            childDom.previousSibling !== prevDom);
        if (needsMove) {
          containerEl.insertBefore(
            childDom,
            prevDom ? prevDom.nextSibling : containerEl.firstChild
          );
        }
        prevDom = childDom;
      }
    }

    for (const leftover of oldKeyed.values()) {
      unmount(leftover);
      if (leftover.__dom && leftover.__dom.parentNode === parent) {
        (parent as Element).removeChild(leftover.__dom);
      }
    }
    for (const leftover of oldUnkeyed) {
      unmount(leftover);
      if (leftover.__dom && leftover.__dom.parentNode === parent) {
        (parent as Element).removeChild(leftover.__dom);
      }
    }

    newVNode.__dom = oldVNode?.__dom ?? null; // not meaningful for fragments
    return prevDom;
  }

  // Text node
  if (newVNode.type === TEXT) {
    const oldIsText = oldVNode?.type === TEXT;
    // If we are replacing a non-text node that was matched (e.g., same key), remove it first:
    if (!oldIsText && oldVNode?.__dom && oldVNode.__dom.parentNode === parent) {
      unmount(oldVNode);
      parent.removeChild(oldVNode.__dom);
    }
    const dom =
      oldIsText && oldVNode?.__dom instanceof Text
        ? (oldVNode.__dom as Text)
        : document.createTextNode("");
    if (!oldVNode || dom.parentNode !== parent)
      parent.insertBefore(dom, nextSibling);
    if (dom.nodeValue !== (newVNode.props as any).nodeValue) {
      dom.nodeValue = (newVNode.props as any).nodeValue;
    }
    newVNode.__dom = dom;
    return dom;
  }

  // Host element (HTML vs SVG)
  let dom: Node;
  const sameType = oldVNode?.type === newVNode.type;
  if (sameType && oldVNode?.__dom) {
    dom = oldVNode.__dom as Element;
  } else {
    // If we matched an old node (e.g., by key) but the type changed, remove the old one first
    if (!sameType && oldVNode?.__dom && oldVNode.__dom.parentNode === parent) {
      unmount(oldVNode);
      parent.removeChild(oldVNode.__dom);
    }
    const tag = String(newVNode.type);
    const isSvgContext = parent instanceof SVGElement || tag === "svg";
    dom = isSvgContext
      ? document.createElementNS(SVG_NS, tag)
      : document.createElement(tag);
    parent.insertBefore(dom, nextSibling);
  }
  newVNode.__dom = dom;

  // Props
  updateProps(
    dom as Element,
    (oldVNode?.props || {}) as Props,
    (newVNode.props || {}) as Props
  );

  // Children (keyed reconciliation with stable reordering; falls back to index for unkeyed)
  const oldKidsAll = (oldVNode?.children || []) as (VNode | null)[];
  const newKidsAll = (newVNode.children || []) as (VNode | null)[];

  const oldKids = oldKidsAll.filter(Boolean) as VNode[];
  const newKids = newKidsAll.filter(Boolean) as VNode[];

  const oldKeyed = new Map<unknown, VNode>();
  const oldUnkeyed: VNode[] = [];
  for (const k of oldKids) {
    const key = getKey(k);
    if (key != null) oldKeyed.set(key, k);
    else oldUnkeyed.push(k);
  }

  let prevDom: Node | null = null;

  for (let i = 0; i < newKids.length; i++) {
    const newK = newKids[i];
    const newKey = getKey(newK);

    let match: VNode | null = null;

    if (newKey != null) {
      match = oldKeyed.get(newKey) || null;
      if (match) oldKeyed.delete(newKey);
    } else {
      let idx = -1;
      for (let j = 0; j < oldUnkeyed.length; j++) {
        if (isSameType(oldUnkeyed[j], newK)) {
          idx = j;
          break;
        }
      }
      if (idx === -1 && oldUnkeyed.length) idx = 0;
      if (idx !== -1) match = oldUnkeyed.splice(idx, 1)[0];
    }

    const childDom = diff(dom, match, newK, inst, null);

    if (childDom) {
      const needsMove =
        childDom !== prevDom &&
        (childDom.parentNode !== dom || childDom.previousSibling !== prevDom);
      if (needsMove) {
        (dom as Element).insertBefore(
          childDom,
          prevDom ? prevDom.nextSibling : (dom as Element).firstChild
        );
      }
      prevDom = childDom;
    }
  }

  for (const leftover of oldKeyed.values()) {
    unmount(leftover);
    if (leftover.__dom) (dom as Element).removeChild(leftover.__dom);
  }
  for (const leftover of oldUnkeyed) {
    unmount(leftover);
    if (leftover.__dom) (dom as Element).removeChild(leftover.__dom);
  }

  return dom;
}

function isEventProp(name: string) {
  return /^on/.test(name);
}
function toEventName(name: string) {
  return name.slice(2).toLowerCase();
}
function isBooleanProp(name: string) {
  return ["checked", "disabled", "selected"].includes(name);
}

function updateProps(dom: Element, prev: Props, next: Props) {
  // Remove
  for (const k in prev) {
    if (!(k in next)) setProp(dom, k, null, prev[k]);
  }
  // Add/update
  for (const k in next) {
    if (prev[k] !== next[k]) setProp(dom, k, next[k], prev[k]);
  }
}

// --- Style helpers ----------------------------------------------------------
// Non-dimensional CSS properties should not get a "px" suffix for numeric values.
// Based on React/Preact lists and common SVG attributes.
const NON_DIMENSIONAL = new Set([
  "animationIterationCount",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  // SVG
  "fillOpacity",
  "floodOpacity",
  "stopOpacity",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
]);

type StyleObj = Record<string, string | number | null | undefined>;

/** Apply inline styles with diffing, supporting object or string values. */
function setStyle(dom: HTMLElement, next: unknown, prev: unknown) {
  // String: set cssText directly (overwrites everything).
  if (typeof next === "string") {
    dom.style.cssText = next;
    return;
  }

  const prevObj =
    prev && typeof prev === "object" ? (prev as StyleObj) : undefined;
  const nextObj =
    next && typeof next === "object" ? (next as StyleObj) : undefined;

  // Remove keys that disappeared.
  if (prevObj) {
    for (const k in prevObj) {
      if (!nextObj || !(k in nextObj)) {
        if (k.startsWith("--") || k.includes("-")) dom.style.removeProperty(k);
        else (dom.style as unknown as Record<string, string>)[k] = "";
      }
    }
  }

  if (!nextObj) return;

  // Apply/overwrite next styles.
  for (const k in nextObj) {
    let v = nextObj[k];
    if (v == null) {
      if (k.startsWith("--") || k.includes("-")) dom.style.removeProperty(k);
      else (dom.style as unknown as Record<string, string>)[k] = "";
      continue;
    }
    // Append "px" for numeric values when the property is dimensional.
    if (typeof v === "number" && !NON_DIMENSIONAL.has(k)) v = `${v}px`;

    if (k.startsWith("--") || k.includes("-")) {
      dom.style.setProperty(k, String(v));
    } else {
      (dom.style as unknown as Record<string, string>)[k] = String(v);
    }
  }
}

function setProp(dom: Element, name: string, value: unknown, prev: unknown) {
  // Alias: allow React-style "className"
  const propName = name === "className" ? "class" : name;

  if (propName === "children" || propName === "key") return;

  // Refs: callback or { current }
  if (propName === "ref") {
    const cb = value as unknown;
    if (typeof cb === "function") (cb as (el: Element | null) => void)(dom);
    else if (cb && typeof cb === "object")
      (cb as { current: any }).current = dom;
    return;
  }

  // dangerouslySetInnerHTML
  if (
    propName === "dangerouslySetInnerHTML" &&
    value &&
    typeof value === "object"
  ) {
    const html = (value as any).__html ?? "";
    (dom as HTMLElement).innerHTML = String(html);
    return;
  }

  if (isEventProp(propName)) {
    const ev = toEventName(propName);
    if (typeof prev === "function")
      dom.removeEventListener(ev, prev as EventListener);
    if (typeof value === "function")
      dom.addEventListener(ev, value as EventListener);
    return;
  }

  // Robust inline style support: string or object, with diffing and units.
  if (propName === "style") {
    setStyle(dom as HTMLElement, value, prev);
    return;
  }

  const isSvg = dom instanceof SVGElement;
  const el = dom as HTMLElement & Record<string, unknown>;

  if (!isSvg && propName in el && !isBooleanProp(propName)) {
    el[propName] =
      (value as string | number | boolean | null | undefined) ?? "";
  } else if (isBooleanProp(propName)) {
    (el as any)[propName] = !!value;
    if (!value) dom.removeAttribute(propName);
    else dom.setAttribute(propName, "");
  } else {
    if (value == null || value === false) dom.removeAttribute(propName);
    else dom.setAttribute(propName, value === true ? "" : String(value));
  }
}

// --- Components & Hooks ----------------------------------------------------
let CURRENT: HookBag | null = null;

function diffComponent(
  parent: HTMLElement,
  oldVNode: VNode | null,
  newVNode: VNode,
  _inst: HookBag,
  nextSibling: Node | null
): Node | null {
  const comp: HookBag = {
    hooks: oldVNode?._hooks?.hooks ?? [],
    hookIndex: 0,
    effects: [],
    effectCleanups: oldVNode?._hooks?.effectCleanups ?? [],
  };
  CURRENT = comp;
  const rendered = (newVNode.type as FC<unknown>)({
    ...(newVNode.props || {}),
    children: newVNode.children,
  });
  CURRENT = null;
  comp.hookIndex = 0;
  const norm = normalize(rendered as any);
  const dom = diff(
    parent,
    oldVNode?._rendered ?? null,
    norm,
    _inst,
    nextSibling
  );
  newVNode._rendered = norm;
  newVNode.__dom = dom;
  newVNode._hooks = comp;
  queueEffectFlush(comp);
  return dom;
}

export function useState<S>(
  initial: S | (() => S)
): [S, (v: S | ((prev: S) => S)) => void] {
  const comp = CURRENT;
  if (!comp) throw new Error("useState must be called inside a component");
  const i = comp.hookIndex++;
  if (comp.hooks[i] === undefined)
    comp.hooks[i] =
      typeof initial === "function" ? (initial as () => S)() : initial;
  const setState = (v: S | ((prev: S) => S)) => {
    const next =
      typeof v === "function" ? (v as (p: S) => S)(comp.hooks[i] as S) : v;
    comp.hooks[i] = next as unknown;
    const root = findRoot(comp);
    if (root) {
      const nextTree = cloneVNode(ROOT_VNODE.get(root) ?? null);
      render(nextTree, root);
    }
  };
  return [comp.hooks[i] as S, setState];
}

export function useEffect(
  effect: () => void | (() => void),
  deps?: unknown[]
): void {
  const comp = CURRENT;
  if (!comp) throw new Error("useEffect must be called inside a component");
  const i = comp.hookIndex++;
  const prev = comp.hooks[i] as { deps?: unknown[] } | undefined;
  const changed =
    !prev ||
    !deps ||
    deps.some((d: unknown, idx: number) => !Object.is(d, prev.deps?.[idx]));
  comp.hooks[i] = { deps };
  if (changed) comp.effects.push({ i, effect });
}

// --- Effects ---------------------------------------------------------------
let __scheduled = false;

function scheduleFlush() {
  if (__scheduled) return;
  __scheduled = true;
  Promise.resolve().then(() => {
    __scheduled = false;
    // Flush pending effects for all roots marked with [data-tiny-preact-root]
    const roots = new Set<HTMLElement>();
    document
      .querySelectorAll<HTMLElement>("[data-tiny-preact-root]")
      .forEach((el) => roots.add(el));
    for (const root of roots) {
      const vnode = ROOT_VNODE.get(root) ?? null;
      const stack: (VNode | null)[] = [vnode];
      while (stack.length) {
        const v = stack.pop();
        if (v?._hooks?.__needsFlush) {
          v._hooks.__needsFlush = false;
          for (const e of v._hooks.effects) {
            if (v._hooks.effectCleanups[e.i]) {
              try {
                v._hooks.effectCleanups[e.i]!();
              } catch {}
            }
            try {
              v._hooks.effectCleanups[e.i] = e.effect() || null;
            } catch {}
          }
          v._hooks.effects = [];
        }
        if (v?._rendered) stack.push(v._rendered);
        (v?.children || []).forEach((c) => c && stack.push(c));
      }
    }
  });
}

function queueEffectFlush(comp: HookBag) {
  comp.__needsFlush = true;
  comp.__root = findRoot(comp);
  scheduleFlush();
}

function flushEffects(_inst: HookBag) {
  /* no-op: effects are flushed asynchronously by scheduleFlush() */
}

function findRoot(_comp: HookBag): HTMLElement | null {
  // Returns the first root with [data-tiny-preact-root]; only a single root is fully supported for state updates
  const roots = document.querySelectorAll<HTMLElement>(
    "[data-tiny-preact-root]"
  );
  return roots[0] || null;
}

// Helper to mount an app quickly. Adds [data-tiny-preact-root], used by the scheduler to discover roots and flush effects.
export function mount(
  vnode: VNode | null,
  container: HTMLElement
): Node | null {
  if (!container.hasAttribute("data-tiny-preact-root"))
    container.setAttribute("data-tiny-preact-root", "");
  return render(vnode, container);
}

function cloneVNode(v: VNode | null): VNode | null {
  if (!v) return v;
  // Shallow clone is enough to trigger re-render; _rendered will be recalculated
  const c = { ...v } as VNode;
  return c;
}

// Default export for convenience
const tiny = { h, render, mount, useState, useEffect, Fragment };
export default tiny;
