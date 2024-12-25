import { writable } from 'svelte/store';

export type FeedStore = {
	videoPaused: boolean;
    videoPlaying: boolean;
    videoBuffering: boolean;
    isLoading: boolean;
    isInitialVideoLoading: boolean;
    showBottomSheet: boolean
};

// Initial state with required default values
const initialState: FeedStore = {
    videoPaused: false,
    videoPlaying: false,
    videoBuffering: false,
    isLoading: false,
    isInitialVideoLoading: true,
    showBottomSheet: false
};

function createFeedStore() {
	const { subscribe, set, update } = writable<FeedStore>(initialState);

	return {
		subscribe,
		setVideoPaused: (paused: boolean) => update((state) => ({ ...state, videoPaused: paused })),
		setVideoPlaying: (playing: boolean) => update((state) => ({ ...state, videoPlaying: playing })),
		setVideoBuffering: (buffering: boolean) => update((state) => ({ ...state, videoBuffering: buffering })),
		setLoading: (loading: boolean) => update((state) => ({ ...state, isLoading: loading })),
		setInitialVideoLoading: (loading: boolean) => update((state) => ({ ...state, isInitialVideoLoading: loading })),
        toggleShowBottomSheet: (show: boolean) => update((state) => ({ ...state, showBottomSheet: show })),
		reset: () => set(initialState)
	};
}

// Create a single instance of the store
const feedStore = createFeedStore();

// Export a function that always returns the same store instance
export const useFeedStore = () => feedStore;

export default createFeedStore;
