import { writable } from "svelte/store";

export default function useState<T>(initialValue: T) {
  const { subscribe, set, update } = writable(initialValue);

  return {
    subscribe,
    state: { subscribe },
    setState: (newValue: T | ((prev: T) => T)) => {
      if (typeof newValue === "function") {
        update(newValue as (prev: T) => T);
      } else {
        set(newValue);
      }
    },
  };
}
