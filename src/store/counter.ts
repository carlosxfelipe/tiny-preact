import { createStore } from "@src/store/createStore.ts";

type CounterState = {
  count: number;
  inc(): void;
  dec(): void;
  reset(): void;
};

export const counterStore = createStore<CounterState>(
  (set, _get) => ({
    count: 0,
    inc: () => set((s) => ({ count: s.count + 1 })),
    dec: () => set((s) => ({ count: s.count - 1 })),
    reset: () => set({ count: 0 }),
  }),
  {
    name: "app.counter.v1", // key in localStorage
    persist: true, // enable persistence
    version: 1, // schema version
    // migrate: (from, oldState) => oldState, // use this if schema needs to evolve
  }
);

export const useCounter = counterStore.useStore;
