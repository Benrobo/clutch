import { writable, type Writable } from 'svelte/store';

export function useLocalStorage<T>(key: string, initialValue: T): Writable<T> {
    // Try to get value from localStorage
    let storedValue: T;
    try {
        const item = localStorage.getItem(key);
        storedValue = item ? JSON.parse(item) : initialValue;
    } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        storedValue = initialValue;
    }

    // Create a writable store
    const store = writable<T>(storedValue);

    // Subscribe to changes and update localStorage
    store.subscribe((value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    });

    return store;
}
