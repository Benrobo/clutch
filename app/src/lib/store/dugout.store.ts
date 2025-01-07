import type { FourPicOneWordChallenge } from '@/types/dugout';
import { writable } from 'svelte/store';

export type DugoutStore = {
	userGameLevelSession: {
			level: string;
			game_id: string;
		}[];
	joinedGames: string[];
	currentGame: {
		id: string;
		level: string;
		currentChallenge: FourPicOneWordChallenge | null;
		points: number;
	} | null;
};

// Initial state with required default values
const initialState: DugoutStore = {
	userGameLevelSession: [],
	joinedGames: [],
	currentGame: null
};

function createDugoutStore() {
	const { subscribe, set, update } = writable<DugoutStore>(initialState);

	return {
		subscribe,
		setUserGameLevelSession: (session: {
			level: string;
			game_id: string;
		}[]) => update((state) => ({ ...state, userGameLevelSession: session })),
		setJoinedGames: (games: string[]) => update((state) => ({ 
			...state, 
			joinedGames: games 
		})),
		setCurrentGame: (game: DugoutStore['currentGame']) => update((state) => ({
			...state,
			currentGame: game
		})),
		updateCurrentChallenge: (challenge: FourPicOneWordChallenge | null) => update((state) => ({
			...state,
			currentGame: state.currentGame ? {
				...state.currentGame,
				currentChallenge: challenge
			} : null
		})),
		updateGamePoints: (points: number) => update((state) => ({
			...state,
			currentGame: state.currentGame ? {
				...state.currentGame,
				points
			} : null
		})),
		updateGameLevel: (level: string) => update((state) => ({
			...state,
			currentGame: state.currentGame ? {
				...state.currentGame,
				level
			} : null
		})),
		reset: () => set(initialState)
	};
}

// Create a single instance of the store
export const dugoutStore = createDugoutStore();

// Export a function that always returns the same store instance
export const useDugoutStore = () => dugoutStore;

export default createDugoutStore;
