import { writable } from 'svelte/store';

export type GlobalStore = {
	isLoading: boolean;
	isSidebarOpen: boolean;
	overflowBody: boolean;
	hideBottomNav: boolean;
};

// Initial state with required default values
const initialState: GlobalStore = {
	isLoading: false,
	isSidebarOpen: false,
	overflowBody: false,
	hideBottomNav: false
};

function createGlobalStore() {
	const { subscribe, set, update } = writable<GlobalStore>(initialState);

	return {
		subscribe,
		setLoading: (loading: boolean) => update((state) => ({ ...state, isLoading: loading })),
		toggleSidebar: (value: boolean) => update((state) => ({ ...state, isSidebarOpen: value })),
		toggleBottomNav: (value: boolean) => update((state) => ({ ...state, hideBottomNav: value })),
		reset: () => set(initialState)
	};
}

// Create a single instance of the store
const globalStore = createGlobalStore();

// Export a function that always returns the same store instance
export const useGlobalStore = () => globalStore;

export default createGlobalStore;
