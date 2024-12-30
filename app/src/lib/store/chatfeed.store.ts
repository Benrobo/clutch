import type { ConversationResponse } from '@/types/chatfeed';
import { writable } from 'svelte/store';

export type ChatFeedStore = {
	activeConversation: ConversationResponse | null
};

// Initial state with required default values
const initialState: ChatFeedStore = {
    activeConversation: null
};

function createChatFeedStore() {
	const { subscribe, set, update } = writable<ChatFeedStore>(initialState);

	return {
		subscribe,
        setActiveConversation: (conversation: ConversationResponse | null) => update((state) => ({ ...state, activeConversation: conversation })),
		reset: () => set(initialState)
	};
}

// Create a single instance of the store
const chatFeedStore = createChatFeedStore();

// Export a function that always returns the same store instance
export const useChatFeedStore = () => chatFeedStore;

export default createChatFeedStore;
