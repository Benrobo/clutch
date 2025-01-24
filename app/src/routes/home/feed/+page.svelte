<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { samplePlaybackStats } from '@/data/highlights';
	import HighlightVideo from '@/modules/discover/components/highlight-video.svelte';
	import { onMount, onDestroy, afterUpdate } from 'svelte';
	import { cn, extractAxiosResponseData, getTeamLogoWithBg } from '@/utils';
	import useDetectDevice from '@/hooks/useDetectDevice';
	import BottomSheet from '@/components/BottomSheet.svelte';
	import { writable } from 'svelte/store';
	import AiButton from '@/components/AIButton.svelte';
	import Highlighter from '@/highlighter';
	import mlbGlossaryJson from '$lib/data/mlb-glossary.json';
	import type { MLBGlossary } from '@/types/games';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import {
		getRecommendations,
		getRecommendationsV2,
		markHighlightVideoAsSeen,
		startPlaybackChatConversation
	} from '@/http/requests';
	import type { BaseResponse } from '@/types';
	import type { RecommendationData, RecommendationResponse } from '@/types/recommendation';
	import Spinner from '@/components/Spinner.svelte';
	import ErrorAction from '@/components/ErrorAction.svelte';
	import { useUrlParams } from '$lib/hooks/useUrlParams';
	import { useFeedStore } from '@/store/feed.store';
	import { useLocalStorage } from '$lib/hooks/useLocalStorage';
	import ChatFeed from '@/modules/chat/components/ChatFeed.svelte';
	import { authStore } from '@/store/auth.store';
	import toast from 'svelte-french-toast';
	import type { ConversationResponse } from '@/types/chatfeed';
	import { useChatFeedStore } from '@/store/chatfeed.store';
	import HighlightConversationService from '$lib/services/highlight-conversation';
	import KeywordDefinition from '@/modules/discover/components/KeywordDefinition.svelte';

	type FeedState = {
		items: RecommendationData[];
		pagination: {
			hasMore: boolean;
			cursor: string | null;
		};
		error?: null | string;
		isLoading: boolean;
		isLoadingMore: boolean;
	};

	type RecommendationState = Record<'foryou' | 'explore', FeedState>;

	let recommendations: RecommendationState = {
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
	};

	const params = useUrlParams();
	const feedParam = params.getParam<'foryou' | 'explore'>({
		key: 'feed',
		defaultValue: 'foryou'
	});

	// Highlight containers for text processing
	let insightsContainer: HTMLDivElement | null = null;
	let summaryContainer: HTMLDivElement | null = null;
	let insightsHighlighter: Highlighter | null = null;
	let summaryHighlighter: Highlighter | null = null;
	let observedPlaybackId: string | null = null;
	let highlightKeyword: string | null;

	const LAST_VIEWED_IDS_KEY = 'lastViewedPlaybackIds';
	const lastViewedPbIdsStore = useLocalStorage<string[]>(LAST_VIEWED_IDS_KEY, []);
	const chatFeedStore = useChatFeedStore();
	const deviceInfo = useDetectDevice();
	const queryClient = useQueryClient();
	const mlbGlossary = mlbGlossaryJson as MLBGlossary[];
	const mlbGlossaryTerms = mlbGlossary.map((glossary) => glossary.title.toLowerCase());
	const highlightConversationService = new HighlightConversationService();
	const MAX_RECOMMENDATIONS = 10;
	const feedStore = useFeedStore();

	$: pbIdParam = params.getParam<string>({
		key: 'pbId',
		defaultValue: ''
	});

	$: activeFeed = $feedParam;

	$: lastViewedPbIds = $lastViewedPbIdsStore;

	$: observedPlaybackId = null;

	$: highlightKeyword = null;

	$: getRecommendationsQuery = createQuery({
		queryKey: ['recommendations', activeFeed],
		queryFn: async () => {
			console.log('Fetching recommendations for:', activeFeed);
			const resp = (await getRecommendationsV2({
				type: activeFeed,
				limit: MAX_RECOMMENDATIONS
			})) as BaseResponse<RecommendationResponse>;
			return resp;
		},
		enabled: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		gcTime: 1000 * 60 * 30 // Keep in cache for 30 minutes
	});

	$: loadMoreRecommendationsMut = createMutation({
		mutationFn: async () => {
			recommendations[activeFeed] = { ...recommendations[activeFeed], isLoadingMore: true };
			const resp = (await getRecommendationsV2({
				type: activeFeed,
				cursor: recommendations[activeFeed].pagination.cursor,
				limit: MAX_RECOMMENDATIONS
			})) as BaseResponse<RecommendationResponse>;
			recommendations[activeFeed] = { ...recommendations[activeFeed], isLoadingMore: false };
			return resp;
		},
		onSuccess: (data) => {
			const resp = extractAxiosResponseData(data, 'success')?.data as RecommendationResponse;

			// Update only the current feed's state
			recommendations[activeFeed] = {
				...recommendations[activeFeed],
				items: [...recommendations[activeFeed].items, ...(resp?.items || [])],
				pagination: {
					hasMore: resp?.hasMore,
					cursor: resp?.nextCursor!
				},
				error: null
			};
		},
		onError: (error) => {
			recommendations[activeFeed] = {
				...recommendations[activeFeed],
				error: extractAxiosResponseData(error, 'error')?.message,
				isLoadingMore: false
			};
		}
	});

	$: markHighlightVideoViewMut = createMutation({
		mutationFn: async (playbackId: string) => {
			return markHighlightVideoAsSeen(playbackId);
		},
		onError: (error) => {
			console.error('Failed to track video view:', error);
		}
	});

	$: startPlaybackConversationMut = createMutation({
		mutationFn: async () => await startPlaybackChatConversation($pbIdParam),
		onSuccess: (data) => {
			const resp = extractAxiosResponseData(data, 'success')
				?.data as unknown as ConversationResponse;
			chatFeedStore.setActiveConversation(resp);
		},
		onError: (err) => {
			const error = extractAxiosResponseData(err, 'error')?.message;
			toast.error(error);
		}
	});

	$: {
		if ($getRecommendationsQuery.isLoading) {
			recommendations[activeFeed] = {
				...recommendations[activeFeed],
				isLoading: true,
				error: null
			};
		} else if ($getRecommendationsQuery.isError) {
			const error = $getRecommendationsQuery.error;
			const errorMessage = extractAxiosResponseData(error, 'error')?.message;
			recommendations[activeFeed] = {
				...recommendations[activeFeed],
				error: errorMessage,
				isLoading: false
			};
		} else if ($getRecommendationsQuery.isSuccess) {
			const data = extractAxiosResponseData($getRecommendationsQuery.data, 'success')
				?.data as RecommendationResponse;

			recommendations[activeFeed] = {
				items: data.items,
				pagination: {
					hasMore: data?.hasMore,
					cursor: data?.nextCursor!
				},
				error: null,
				isLoading: false,
				isLoadingMore: false
			};
		}
	}

	// Load more when reaching the last visible item
	$: if (
		observedPlaybackId &&
		observedPlaybackId === recommendations[activeFeed].pagination?.cursor &&
		recommendations[activeFeed].pagination?.hasMore &&
		!recommendations[activeFeed].isLoadingMore
	) {
		$loadMoreRecommendationsMut.mutate();
	}

	$: if (
		observedPlaybackId &&
		!lastViewedPbIds.includes(observedPlaybackId) &&
		!$loadMoreRecommendationsMut.isPending
	) {
		let timeoutId = setTimeout(() => {
			if ($authStore?.user?.id) {
				lastViewedPbIdsStore.set([...lastViewedPbIds, observedPlaybackId as string]);
				$markHighlightVideoViewMut.mutate(observedPlaybackId as string);
				clearTimeout(timeoutId);
			}
		}, 4000);
	}

	// Track last visible item for infinite scroll
	$: lastVisibleItemId =
		recommendations[activeFeed]?.items?.length > 0
			? recommendations[activeFeed].items[recommendations[activeFeed].items.length - 1].id
			: null;

	$: aiButtonLabel = 'Ask About This Play';

	const handleHighlightConversation = async () => {
		const currentPb = recommendations[activeFeed].items.find((hl) => hl.id === $pbIdParam);

		const createdChat = await highlightConversationService.createChat({
			ref: $pbIdParam,
			ref_type: 'highlight_playback',
			title: currentPb?.playback?.title ?? ''
		});

		feedStore.toggleShowBottomSheet(false);
		chatFeedStore.setActiveConversation(createdChat as any);
	};

	const handleLikeUpdate = (pbId: string) => {
		const likedUnlikePb = recommendations[activeFeed].items.find((hl) => hl.id === pbId);

		if (likedUnlikePb) {
			// Update query cache
			queryClient.setQueryData(
				['recommendations', activeFeed],
				(oldData: BaseResponse<RecommendationResponse>) => {
					if (!oldData?.data?.items?.length) return oldData;

					const newData = { ...oldData };
					const updatedItem = newData.data.items.find(
						(item: RecommendationData) => item.id === pbId
					);

					if (updatedItem) {
						const wasLiked = updatedItem.youLiked;
						updatedItem.youLiked = !wasLiked;
						updatedItem.likes = !wasLiked
							? (updatedItem.likes || 0) + 1
							: (updatedItem.likes || 1) - 1;
					}
					return newData;
				}
			);

			// Update recommendations state
			recommendations[activeFeed] = {
				...recommendations[activeFeed],
				items: recommendations[activeFeed].items.map((item) =>
					item.id === pbId
						? {
								...item,
								youLiked: !item.youLiked,
								likes: !item.youLiked ? (item.likes || 0) + 1 : (item.likes || 1) - 1
							}
						: item
				)
			};
		}
	};

	onMount(async () => {
		params.updateParams({
			feed: activeFeed
		});
	});

	afterUpdate(async () => {
		// get chat based on pbIdParam
		const chat = await highlightConversationService.getChat($pbIdParam);
		if (chat && chat?.ref === $pbIdParam) {
			aiButtonLabel = 'Continue Conversation';
		} else {
			aiButtonLabel = 'Ask About This Play';
		}
	});

	onDestroy(() => {
		// @ts-expect-error
		if (insightsHighlighter) insightsHighlighter?.destroy();
		// @ts-expect-error
		if (summaryHighlighter) summaryHighlighter?.destroy();
	});

	afterUpdate(() => {
		const highlight = recommendations[activeFeed].items.find((hl) => hl.id === observedPlaybackId);

		if (highlight?.summary?.highlight && insightsContainer) {
			const highlighter = new Highlighter({
				text: highlight?.summary?.highlight,
				keywords: mlbGlossaryTerms.map((term) => ({
					word: term,
					borderStyle: 'solid',
					borderWidth: '1px',
					fontWeight: 600,
					color: '#fe605f',
					style: 'border-bottom',
					onClick: (match) => {
						highlightKeyword = match;
					}
				}))
			});
			highlighter.render(insightsContainer);
		}

		if (highlight?.summary?.summary && summaryContainer) {
			const highlighter = new Highlighter({
				text: highlight?.summary?.summary,
				keywords: mlbGlossaryTerms.map((term) => ({
					word: term,
					borderStyle: 'solid',
					borderWidth: '1px',
					fontWeight: 600,
					color: '#fe605f',
					style: 'border-bottom',
					onClick: (match) => {
						setTimeout(() => {
							highlightKeyword = match;
						}, 0);
					}
				})),
				options: { caseSensitive: true }
			});
			highlighter.render(summaryContainer);
		}
	});
</script>

<svelte:head>
	<title>Clutch - Highlights</title>
	<meta name="description" content="Personalized baseball highlights from past games" />
</svelte:head>

<div class="w-full h-full flex items-center justify-center">
	<div class="w-full h-full max-w-[678px] relative">
		<!-- Feed Type Selector -->
		<div
			class={cn(
				'w-full h-auto fixed top-0 left-0 z-[100]',
				deviceInfo?.device?.type === 'smartphone' ? 'py-3 scale-[.90] -translate-x-4' : 'py-3'
			)}
		>
			<Flex className="w-full max-w-[678px] mx-auto h-auto justify-between px-4">
				<div class="w-auto flex items-start justify-start bg-gray-101/30 rounded-md">
					{#each ['foryou', 'explore'] as feed}
						<button
							class={cn(
								'h-full flex flex-row items-center justify-start gap-2 px-3 py-[8px] rounded-sm text-xs font-poppins transition-all text-white-300/50',
								activeFeed === feed && 'bg-red-303 text-white-100'
							)}
							on:click={() => {
								// @ts-expect-error
								feedParam.set(feed);
							}}
						>
							{#if feed === 'foryou'}
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
									><path
										fill="currentColor"
										d="M6 17c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6m9-9a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2"
									/></svg
								>
								<span>For You</span>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
									<circle cx="6.18" cy="17.82" r="2.18" fill="currentColor" />
									<path
										fill="currentColor"
										d="M5.59 10.23c-.84-.14-1.59.55-1.59 1.4c0 .71.53 1.28 1.23 1.4c2.92.51 5.22 2.82 5.74 5.74c.12.7.69 1.23 1.4 1.23c.85 0 1.54-.75 1.41-1.59a9.89 9.89 0 0 0-8.19-8.18zm-.03-5.71C4.73 4.43 4 5.1 4 5.93c0 .73.55 1.33 1.27 1.4c6.01.6 10.79 5.38 11.39 11.39c.07.73.67 1.28 1.4 1.28c.84 0 1.5-.73 1.42-1.56c-.73-7.34-6.57-13.19-13.92-13.92z"
									/>
								</svg>
								<span>Explore</span>
							{/if}
						</button>
					{/each}
				</div>
				<div />
			</Flex>
		</div>

		<!-- Video Feed -->
		<div class="w-full h-full highlight-videos-container overflow-y-auto hideScrollBar2">
			{#if recommendations[activeFeed]?.error}
				<div class="w-full h-[100vh] flex-center">
					<ErrorAction
						error={recommendations[activeFeed].error}
						callback={() => queryClient.invalidateQueries({ queryKey: ['recommendations'] })}
						showActionButton={true}
						isLoading={false}
					/>
				</div>
			{:else if recommendations[activeFeed]?.isLoading && !recommendations[activeFeed]?.items?.length}
				<div class="w-full h-[100vh] flex-center">
					<Spinner size={'20'} />
				</div>
			{:else if recommendations[activeFeed]?.items?.length > 0}
				{console.log('Rendering recommendations:', {
					count: recommendations[activeFeed]?.items?.length
				})}
				{#each recommendations[activeFeed].items as rec}
					<div class="w-full h-full snap-start snap-always">
						<HighlightVideo
							hl={rec}
							onObServedDataId={(id) => (observedPlaybackId = id)}
							currentVideoId={$pbIdParam}
							updateLike={handleLikeUpdate}
						/>
					</div>
				{/each}

				{#if recommendations[activeFeed]?.isLoadingMore}
					<div class="w-full py-4 flex-center">
						<Spinner size={'20'} />
					</div>
				{/if}
			{:else}
				<div class="w-full h-[100vh] flex-center">
					<p>No recommendations available</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<BottomSheet
	isOpen={$feedStore?.showBottomSheet}
	onClose={() => {
		feedStore.toggleShowBottomSheet(false);
		chatFeedStore.reset();
		setTimeout(() => feedStore.setVideoPlaying(true), 300);
	}}
	headline="Play Insights"
	tagline=""
	className="h-auto bg-brown-100"
>
	{#if observedPlaybackId}
		{@const highlight = recommendations[activeFeed].items.find(
			(hl) => hl.id === observedPlaybackId
		)}
		<div class="p-1 flex flex-col gap-6">
			<Flex className={cn('w-full h-auto items-center justify-between gap-5')}>
				<Flex className={'flex-col items-center justify-center text-center'}>
					<img
						src={getTeamLogoWithBg(highlight?.game?.home_team?.id)}
						class="w-[70px] h-[70px] rounded-full"
						alt={highlight?.game?.home_team?.name}
					/>
					<p class="text-dark-100 font-brunoace font-semibold text-sm">
						{highlight?.game?.home_team?.name}
					</p>
				</Flex>

				<h1 class="text-dark-106/30 font-garamond font-bold text-[2em]">Vs</h1>

				<Flex className={'flex-col items-center justify-center text-center'}>
					<img
						src={getTeamLogoWithBg(highlight?.game?.away_team?.id)}
						class="w-[70px] h-[70px] rounded-full"
						alt={highlight?.game?.away_team?.name}
					/>
					<p class="text-dark-100 font-brunoace font-semibold text-sm">
						{highlight?.game?.away_team?.name}
					</p>
				</Flex>
			</Flex>

			<div class="w-full max-h-[250px] overflow-y-auto hideScrollBar3">
				<p class="text-xs text-dark-100/80 font-poppins">
					{highlight?.playback?.description}
				</p>

				{#if highlight?.summary?.highlight}
					<div class="flex flex-col gap-1 mt-3">
						<h4 class="text-dark-100 text-sm font-jetbrains font-bold">Insights</h4>
						<p
							class="text-dark-100/80 text-[13px] font-poppins leading-relaxed"
							bind:this={insightsContainer}
						/>
					</div>
				{/if}

				{#if highlight?.summary?.summary}
					<div class="flex flex-col gap-1 mt-3">
						<h4 class="text-dark-100 font-jetbrains font-bold">Summary</h4>
						<p
							class="text-dark-100/80 text-[13px] font-poppins leading-relaxed"
							bind:this={summaryContainer}
						/>
					</div>
				{/if}
			</div>

			<div class="flex justify-center mt-2 pb-5">
				<AiButton
					onClick={async () => {
						await handleHighlightConversation();
					}}
					visible={$feedStore?.showBottomSheet}
					loading={$startPlaybackConversationMut.isPending}
					label={aiButtonLabel}
				/>
			</div>
		</div>
	{/if}
</BottomSheet>

<KeywordDefinition
	keyword={highlightKeyword}
	showModal={highlightKeyword ? true : false}
	onClose={() => {
		highlightKeyword = null;
	}}
/>

{#if $chatFeedStore?.activeConversation?.id}
	<ChatFeed
		onClose={() => {
			chatFeedStore.reset();
		}}
		pbId={$pbIdParam}
	/>
{/if}

<style>
	:global(body) {
		overflow: hidden;
	}

	.highlight-videos-container {
		height: 100%;
		scroll-snap-type: y mandatory;
	}

	.highlight-videos-container > div {
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}
</style>
