import { useEffect, useRef, useState } from "@tiny/tiny-vdom.ts";

type Listener = () => void;

type CreateStoreOptions<T> = {
  name?: string;
  persist?: boolean;
  version?: number;
  migrate?: (from: number, state: T) => T;
};

type SetFn<T> = Partial<T> | ((prev: T) => Partial<T>);

export function createStore<T extends object>(
  initializer: (set: (fn: SetFn<T>) => void, get: () => T) => T,
  opts: CreateStoreOptions<T> = {}
) {
  const listeners = new Set<Listener>();
  const key = opts.name ?? "__app_store__";
  const version = opts.version ?? 1;
  let state: T;

  const load = (): T | undefined => {
    if (!opts.persist) return;
    try {
      const raw = globalThis.localStorage?.getItem(key);
      if (!raw) return;
      const snap = JSON.parse(raw) as { v: number; s: T };
      if (typeof snap?.v === "number" && snap?.s) {
        if (opts.migrate && snap.v !== version)
          return opts.migrate(snap.v, snap.s);
        return snap.s;
      }
    } catch (err) {
      console.warn("createStore.load failed", err);
    }
  };

  const persist = (() => {
    let t: number | null = null;
    return (s: T) => {
      if (!opts.persist) return;
      try {
        if (t) globalThis.clearTimeout(t);
        t = globalThis.setTimeout(() => {
          try {
            globalThis.localStorage?.setItem(
              key,
              JSON.stringify({ v: version, s })
            );
          } catch (err) {
            console.warn("createStore.persist.setItem failed", err);
          }
          t = null;
        }, 10);
      } catch (err) {
        console.warn("createStore.persist failed", err);
      }
    };
  })();

  const get = () => state;

  const set = (fn: SetFn<T>) => {
    const partial =
      typeof fn === "function" ? (fn as (p: T) => Partial<T>)(state) : fn;
    if (!partial || typeof partial !== "object") return;
    const next = Object.assign({}, state, partial);
    if (Object.is(next, state)) return;
    state = next;
    persist(state);
    for (const l of listeners) l();
  };

  state = Object.assign(initializer(set, get), load());

  if (opts.persist && typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("storage", (e) => {
      if (
        (e as StorageEvent).key !== key ||
        (e as StorageEvent).newValue == null
      )
        return;
      try {
        const snap = JSON.parse((e as StorageEvent).newValue as string) as {
          v: number;
          s: T;
        };
        if (!snap?.s) return;
        state = snap.s;
        for (const l of listeners) l();
      } catch (err) {
        console.warn("createStore.storage event failed", err);
      }
    });
  }

  function subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  }

  function useStore<S = T>(
    selector: (s: T) => S = (s: T) => s as unknown as S,
    equality: (a: S, b: S) => boolean = Object.is
  ) {
    const selectorRef = useRef(selector);
    const equalityRef = useRef(equality);
    selectorRef.current = selector;
    equalityRef.current = equality;

    const getSelected = () => selectorRef.current(state);

    const [slice, setSlice] = useState<S>(getSelected);

    useEffect(() => {
      let mounted = true;
      const check = () => {
        if (!mounted) return;
        const next = getSelected();
        setSlice((prev) => (equalityRef.current(prev, next) ? prev : next));
      };
      const unsub = subscribe(check);
      check();
      return () => {
        mounted = false;
        unsub();
      };
    }, []);

    return slice;
  }

  return { getState: get, setState: set, subscribe, useStore };
}
