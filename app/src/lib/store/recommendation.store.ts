import { writable } from 'svelte/store';
import type { RecommendationData } from '@/types/recommendation';

type PaginationState = {
    hasMore: boolean;
    cursor: string | null;
};

type FeedState = {
    items: RecommendationData[];
    pagination: PaginationState;
    error?: null | string;
    isLoading: boolean;
    isLoadingMore: boolean;
};

type RecommendationState = Record<'foryou' | 'explore', FeedState>;

function createRecommendationStore() {
    const { subscribe, update } = writable<RecommendationState>({
        foryou: {
            items: [],
            pagination: {
                hasMore: true,
                cursor: null
            },
            error: null,
            isLoading: false,
            isLoadingMore: false
        },
        explore: {
            items: [],
            pagination: {
                hasMore: true,
                cursor: null
            },
            error: null,
            isLoading: false,
            isLoadingMore: false
        }
    });

    return {
        subscribe,
        updateFeed: (feed: 'foryou' | 'explore', newState: Partial<FeedState>) => {
            update(state => {
                const updatedState = {
                    ...state,
                    [feed]: {
                        ...state[feed],
                        ...newState,
                        items: newState.items || state[feed].items,
                        pagination: {
                            ...state[feed].pagination,
                            ...(newState.pagination || {})
                        },
                        error: newState.error ?? state[feed].error,
                        isLoading: newState.isLoading ?? state[feed].isLoading,
                        isLoadingMore: newState.isLoadingMore ?? state[feed].isLoadingMore
                    }
                };
                return updatedState;
            });
        },
        setLoading: (feed: 'foryou' | 'explore', isLoading: boolean) => {
            update(state => ({
                ...state,
                [feed]: {
                    ...state[feed],
                    isLoading,
                    error: isLoading ? null : state[feed].error
                }
            }));
        },
        setLoadingMore: (feed: 'foryou' | 'explore', isLoadingMore: boolean) => {
            update(state => ({
                ...state,
                [feed]: {
                    ...state[feed],
                    isLoadingMore,
                    error: isLoadingMore ? null : state[feed].error
                }
            }));
        },
        setError: (feed: 'foryou' | 'explore', error: string | null) => {
            update(state => ({
                ...state,
                [feed]: {
                    ...state[feed],
                    error,
                    isLoading: false,
                    isLoadingMore: false
                }
            }));
        },
        reset: () => {
            update(() => ({
                foryou: {
                    items: [],
                    pagination: {
                        hasMore: true,
                        cursor: null
                    },
                    error: null,
                    isLoading: false,
                    isLoadingMore: false
                },
                explore: {
                    items: [],
                    pagination: {
                        hasMore: true,
                        cursor: null
                    },
                    error: null,
                    isLoading: false,
                    isLoadingMore: false
                }
            }));
        }
    };
}

export const recommendationStore = createRecommendationStore();
