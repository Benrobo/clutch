import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ConversationResponse } from '@/types/chatfeed';
import { writable } from 'svelte/store';

export type DugoutStore = {
	userGameLevelSession: {
		level: string;
		game_id: string;
	}[];
    joinedGames: string[];
};

// Initial state with required default values
const initialState: DugoutStore = {
    userGameLevelSession: [],
    joinedGames: []
};

function createDugoutStore() {
	const { subscribe, set, update } = writable<DugoutStore>(initialState);

	return {
		subscribe,
        setUserGameLevelSession: (session: {
            level: string;
            game_id: string;
        }[]) => update((state) => ({ ...state, userGameLevelSession: session })),
        setJoinedGames: (games: string[]) => update((state) => ({ ...state, joinedGames: games })),
		reset: () => set(initialState)
	};
}

// Create a single instance of the store
export const dugoutStore = createDugoutStore();

// Export a function that always returns the same store instance
export const useDugoutStore = () => dugoutStore;

export default createDugoutStore;
