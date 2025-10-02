import {
  TEXT,
  SVG_NS,
  h,
  type VNode,
  type Props,
  type FC,
  type Ref,
  getKey,
  isSameType,
  type HookBag,
} from "./vdom.ts";
import { updateProps } from "./dom.ts";

const ROOT_VNODE = new WeakMap<HTMLElement, VNode | null>();
const ROOT_INST = new WeakMap<HTMLElement, HookBag>();

function unmount(v: VNode | null) {
  if (!v) return;
  if (v._rendered) unmount(v._rendered);
  for (const c of v.children) if (c) unmount(c);
  const hooks = v._hooks;
  if (hooks && hooks.effectCleanups) {
    for (const cl of hooks.effectCleanups) {
      try {
        cl?.();
        // deno-lint-ignore no-empty
      } catch {}
    }
    hooks.effectCleanups = [];
  }
}

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
  flushEffects(inst);
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

  if (newVNode == null) {
    if (oldVNode) {
      unmount(oldVNode);
      if (oldVNode.__dom && oldVNode.__dom.parentNode === parent) {
        parent.removeChild(oldVNode.__dom);
      }
    }
    return null;
  }

  if (typeof newVNode.type === "function") {
    return diffComponent(
      parent as HTMLElement,
      oldVNode,
      newVNode,
      inst,
      nextSibling
    );
  }

  if (newVNode.type === TEXT) {
    const oldIsText = oldVNode?.type === TEXT;
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
    const text = (newVNode.props as { nodeValue: string }).nodeValue;
    if (dom.nodeValue !== text) dom.nodeValue = text;
    newVNode.__dom = dom;
    return dom;
  }

  let dom: Node;
  const sameType = oldVNode?.type === newVNode.type;
  if (sameType && oldVNode?.__dom) {
    dom = oldVNode.__dom as Element;
  } else {
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

  updateProps(
    dom as Element,
    (oldVNode?.props || {}) as Props,
    (newVNode.props || {}) as Props
  );

  const oldKids = (oldVNode?.children || []).filter(Boolean) as VNode[];
  const newKids = (newVNode.children || []).filter(Boolean) as VNode[];

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

let CURRENT: HookBag | null = null;

function isObjectRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}
function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!isObjectRecord(a) || !isObjectRecord(b)) return false;
  const ak = Object.keys(a),
    bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!Object.is(a[k], (b as Record<string, unknown>)[k])) return false;
  }
  return true;
}

type MemoMeta<P> = {
  __isMemo: true;
  __compare: (prev: Readonly<P>, next: Readonly<P>) => boolean;
  __inner: FC<P>;
};
type ForwardRefRenderFunction<P, R = Element> = (
  props: P & { children?: unknown },
  ref: Ref<R> | null
) => VNode | null;
type ForwardRefMeta<P> = {
  __isForwardRef: true;
  __inner: ForwardRefRenderFunction<P, unknown>;
};
type MaybeMemoOrFwd = FC<unknown> &
  Partial<MemoMeta<Record<string, unknown>>> &
  Partial<ForwardRefMeta<Record<string, unknown>>>;

function isMemoType(
  x: unknown
): x is FC<unknown> & MemoMeta<Record<string, unknown>> {
  return isObjectRecord(x) && (x as Record<string, unknown>).__isMemo === true;
}
function isForwardRefType(
  x: unknown
): x is FC<unknown> & ForwardRefMeta<Record<string, unknown>> {
  return (
    isObjectRecord(x) && (x as Record<string, unknown>).__isForwardRef === true
  );
}

export function memo<P>(
  Component: FC<P>,
  areEqual?: (
    prev: Readonly<P & { children?: unknown }>,
    next: Readonly<P & { children?: unknown }>
  ) => boolean
): FC<P> & MemoMeta<P & { children?: unknown }> {
  const Wrapped: FC<P> & Partial<MemoMeta<P & { children?: unknown }>> = (
    props
  ) => Component(props);
  Wrapped.__isMemo = true;
  Wrapped.__inner = Component as FC<P & { children?: unknown }>;
  Wrapped.__compare = areEqual ?? (shallowEqual as unknown as typeof areEqual);
  return Wrapped as FC<P> & MemoMeta<P & { children?: unknown }>;
}

export function forwardRef<P, R = Element>(
  render: ForwardRefRenderFunction<P, R>
): FC<P> & ForwardRefMeta<P> {
  const Wrapped: FC<P> & Partial<ForwardRefMeta<P>> = (props) =>
    render(props, (props as unknown as { ref?: Ref<R> | null }).ref ?? null);
  Wrapped.__isForwardRef = true;
  Wrapped.__inner = render as ForwardRefRenderFunction<P, unknown>;
  return Wrapped as FC<P> & ForwardRefMeta<P>;
}

function diffComponent(
  parent: HTMLElement,
  oldVNode: VNode | null,
  newVNode: VNode,
  _inst: HookBag,
  nextSibling: Node | null
): Node | null {
  const compType = newVNode.type as MaybeMemoOrFwd;
  const isMemo = isMemoType(compType);
  const isFwd = isForwardRefType(compType);
  const renderFn: unknown = isMemo
    ? compType.__inner
    : isFwd
    ? compType.__inner
    : compType;

  const propsWC = {
    ...(newVNode.props || {}),
    children: newVNode.children,
  } as Record<string, unknown>;

  if (isMemo && oldVNode) {
    const prevPropsWC =
      oldVNode._propsWC ??
      ({ ...(oldVNode.props || {}), children: oldVNode.children } as Record<
        string,
        unknown
      >);
    const equal = compType.__compare(prevPropsWC, propsWC);
    if (equal) {
      newVNode._rendered = oldVNode._rendered ?? null;
      newVNode.__dom = oldVNode.__dom ?? null;
      newVNode._hooks = oldVNode._hooks ?? null;
      newVNode._propsWC = prevPropsWC;
      return newVNode.__dom ?? null;
    }
  }

  const comp: HookBag = {
    hooks: oldVNode?._hooks?.hooks ?? [],
    hookIndex: 0,
    effects: [],
    effectCleanups: oldVNode?._hooks?.effectCleanups ?? [],
  };
  CURRENT = comp;

  let rendered: VNode | null;
  if (isFwd) {
    const ref = ((newVNode.props as { ref?: Ref | null }).ref ??
      null) as Ref | null;
    const { ref: _omit, ...clean } = propsWC as { ref?: unknown } & Record<
      string,
      unknown
    >;
    rendered = (
      renderFn as ForwardRefRenderFunction<Record<string, unknown>, unknown>
    )(clean, ref as unknown as Ref<unknown> | null);
  } else {
    rendered = (renderFn as FC<Record<string, unknown>>)(propsWC);
  }

  CURRENT = null;
  comp.hookIndex = 0;
  const dom = diff(
    parent,
    oldVNode?._rendered ?? null,
    rendered,
    _inst,
    nextSibling
  );
  newVNode._rendered = rendered;
  newVNode.__dom = dom;
  newVNode._hooks = comp;
  newVNode._propsWC = propsWC;
  comp.__node = dom ?? null;
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

export function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: S | (() => S)
): [S, (action: A) => void] {
  const [state, setState] = useState<S>(
    typeof initialArg === "function" ? (initialArg as () => S)() : initialArg
  );
  const dispatch = (action: A) => setState((prev) => reducer(prev, action));
  return [state, dispatch];
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
    !prev || !deps || deps.some((d, idx) => !Object.is(d, prev.deps?.[idx]));
  comp.hooks[i] = { deps };
  if (changed) comp.effects.push({ i, effect });
}

export function useRef<T>(initial: T): { current: T } {
  const comp = CURRENT;
  if (!comp) throw new Error("useRef must be called inside a component");
  const i = comp.hookIndex++;
  if (comp.hooks[i] === undefined) comp.hooks[i] = { current: initial };
  return comp.hooks[i] as { current: T };
}

export function useMemo<T>(factory: () => T, deps?: readonly unknown[]): T {
  const comp = CURRENT;
  if (!comp) throw new Error("useMemo must be called inside a component");
  const i = comp.hookIndex++;
  type Slot = { deps?: readonly unknown[]; value: T };
  const prev = comp.hooks[i] as Slot | undefined;
  const changed =
    !prev ||
    !deps ||
    prev.deps?.length !== deps.length ||
    deps.some((d, idx) => !Object.is(d, prev.deps?.[idx]));
  if (changed) {
    const value = factory();
    if (prev) {
      prev.deps = deps;
      prev.value = value;
      comp.hooks[i] = prev;
    } else comp.hooks[i] = { deps, value } as Slot;
  }
  return (comp.hooks[i] as Slot).value;
}

export function useCallback<T extends (...args: unknown[]) => unknown>(
  fn: T,
  deps?: readonly unknown[]
): T {
  return useMemo(() => fn, deps) as T;
}

let __scheduled = false;
function scheduleFlush() {
  if (__scheduled) return;
  __scheduled = true;
  Promise.resolve().then(() => {
    __scheduled = false;
    const roots = new Set<HTMLElement>();
    document
      .querySelectorAll<HTMLElement>("[data-tiny-vdom-root]")
      .forEach((el) => roots.add(el));
    for (const root of roots) {
      const vnode = ROOT_VNODE.get(root) ?? null;
      const stack: (VNode | null)[] = [vnode];
      while (stack.length) {
        const v = stack.pop();
        if (v?._hooks?.__needsFlush && v._hooks) {
          v._hooks.__needsFlush = false;
          for (const e of v._hooks.effects) {
            if (v._hooks.effectCleanups[e.i]) {
              try {
                v._hooks.effectCleanups[e.i]!();
                // deno-lint-ignore no-empty
              } catch {}
            }
            try {
              v._hooks.effectCleanups[e.i] = e.effect() || null;
              // deno-lint-ignore no-empty
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
  /* no-op: flush async */
}

function findRoot(comp: HookBag): HTMLElement | null {
  const node = comp.__node as
    | (Node & { parentElement?: Element | null })
    | null;
  const start: Element | null =
    (node as Element | null) ?? node?.parentElement ?? null;
  const root = start?.closest<HTMLElement>("[data-tiny-vdom-root]") ?? null;
  return root;
}

export function mount(
  vnode: VNode | null,
  container: HTMLElement
): Node | null {
  if (!container.hasAttribute("data-tiny-vdom-root"))
    container.setAttribute("data-tiny-vdom-root", "");
  return render(vnode, container);
}

function cloneVNode(v: VNode | null): VNode | null {
  if (!v) return v;
  return { ...v } as VNode;
}

const tiny = {
  h,
  render,
  mount,
  useState,
  useReducer,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
  forwardRef,
};
export default tiny;
