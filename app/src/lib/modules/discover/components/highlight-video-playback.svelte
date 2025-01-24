<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Spinner from '@/components/Spinner.svelte';
	import { cn, extractAxiosResponseData, getTeamLogoWithBg, mapTranscript } from '@/utils';
	import { Captions, CaptionsOff, Cog, Pause, Play, Volume2, VolumeX } from 'lucide-svelte';
	import { onMount, onDestroy, afterUpdate } from 'svelte';
	import EngagementBar from './EngagementBar.svelte';
	import useDetectDevice from '$lib/hooks/useDetectDevice';
	import { useFeedStore } from '@/store/feed.store';
	import { useUrlParams } from '@/hooks/useUrlParams';
	import type { RecommendationData } from '@/types/recommendation';
	import { SUPPORTED_PLAYBACK_SUBTITLE_LANGUAGES_MAP } from '@/constant/recommendation';
	import Divider from '@/components/Divider.svelte';
	import toast from 'svelte-french-toast';
	import { createMutation } from '@tanstack/svelte-query';
	import { toggleLike } from '@/http/requests';

	export let highlight: RecommendationData | null = null;
	export let onObServedDataId: (id: string | null) => void = () => {};
	export let currentVideoId: string | null = null;

	type AspectRatio = '9:16' | '16:9';
	let currentAspectRatio: AspectRatio = '16:9';

	const params = useUrlParams();
	const deviceInfo = useDetectDevice();
	$: feedStore = useFeedStore();
	let videoElement: HTMLVideoElement;
	$: videoElement;
	let containerRef: HTMLDivElement;
	let observer: IntersectionObserver;
	let muted = true;
	let isTranscriptAvailable = false;
	let showVideoSettings: boolean;
	let selectedSubtitleLanguage: keyof typeof SUPPORTED_PLAYBACK_SUBTITLE_LANGUAGES_MAP;
	let showCaption: boolean = false;
	let lastTime = 0;
	export let updateLike: (pbId: string) => void = () => {};

	let videoTranscript:
		| {
				lang: string;
				translation: {
					start: number;
					end: number;
					text: string;
				}[];
		  }[]
		| null = null;

	let currentCaption: string = '';
	let currentCaptionIndex = 0;

	$: if (videoElement && $feedStore) {
		handleVideoState();
	}

	$: isSafariMobile = false;
	$: isTranscriptAvailable = highlight?.transcript?.translated !== null;
	$: selectedSubtitleLanguage = 'en';

	$: if (isTranscriptAvailable) {
		videoTranscript = mapTranscript(highlight?.transcript!);
	}

	const MAX_DESCRIPTION_LENGTH = 100;
	const DEBUG_MODE_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

	$: toggleLikeMut = createMutation({
		mutationFn: async (playbackId: string) => {
			const data = await toggleLike(playbackId);
			return data;
		},
		onSuccess: () => {
			console.log('toggle like success!');
		},
		onError: (error: any) => {
			console.log(error);
			toast.error('Something went wrong.');
		}
	});

	function handleLikeToggle() {
		updateLike(highlight?.playback?.id!);
		$toggleLikeMut.mutate(highlight?.playback?.id!);
	}

	async function handleVideoState() {
		if (!videoElement || !$feedStore) return;

		try {
			if ($feedStore.videoPlaying) {
				await videoElement.play();
			} else {
				videoElement.pause();
			}
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				// Ignore abort errors from interrupting play/pause
				return;
			}
			console.error('Video playback error:', error);
		}
	}

	function toggleAspectRatio() {
		currentAspectRatio = currentAspectRatio === '9:16' ? '16:9' : '9:16';
	}

	function handleLoadStart() {
		feedStore.setInitialVideoLoading(true);
		feedStore.setVideoBuffering(false);
	}

	function handleCanPlay() {
		feedStore.setInitialVideoLoading(false);
		feedStore.setVideoBuffering(false);
	}

	function handleWaiting() {
		feedStore.setVideoBuffering(true);
	}

	function handlePlaying() {
		feedStore.setInitialVideoLoading(false);
		feedStore.setVideoBuffering(false);
		feedStore.setVideoPlaying(true);
		feedStore.setVideoPaused(false);
	}

	function handleVisibilityChange(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const vidDataId = entry.target.getAttribute('data-id');
				onObServedDataId(vidDataId);
				params.updateParams({
					pbId: highlight?.playback?.id as string
				});
				if (videoElement && $feedStore.videoPaused) {
					videoElement.play();
					feedStore.setVideoPaused(false);
					feedStore.setVideoPlaying(true);
				}
			} else {
				if (videoElement && !$feedStore.videoPaused) {
					videoElement.pause();
					feedStore.setVideoPaused(true);
					feedStore.setVideoPlaying(false);
				}
			}
		});
	}

	function updateCaptions(event: Event) {
		const currentTime = (event.target as HTMLVideoElement).currentTime;
		const captions =
			videoTranscript?.find((transcript) => transcript.lang === selectedSubtitleLanguage)
				?.translation ?? [];

		// Detect if the video has looped (currentTime < lastTime)
		if (currentTime < lastTime) {
			resetCaptions(); // Reset captions when the video loops
		}
		lastTime = currentTime;

		// Check if the current time falls within a caption segment
		if (
			currentCaptionIndex < captions.length &&
			currentTime >= captions[currentCaptionIndex].start &&
			currentTime < captions[currentCaptionIndex].end
		) {
			currentCaption = captions[currentCaptionIndex].text;
		} else {
			// Move to the next caption if the current time exceeds the end timestamp
			if (
				currentCaptionIndex < captions.length &&
				currentTime >= captions[currentCaptionIndex].end
			) {
				currentCaptionIndex++;
			}

			// Clear the captions if no segment matches the current time
			if (
				currentCaptionIndex >= captions.length ||
				currentTime < captions[currentCaptionIndex].start
			) {
				currentCaption = '';
			}
		}
	}

	const resetCaptions = () => {
		currentCaptionIndex = 0;
		currentCaption = '';
	};

	onMount(() => {
		observer = new IntersectionObserver(handleVisibilityChange, {
			threshold: 0.7
		});

		if (containerRef) {
			observer.observe(containerRef);
		}
	});

	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});
</script>

<div bind:this={containerRef} data-id={highlight?.id} class="w-full h-full relative flex-center">
	<div
		class={cn(
			'w-full h-full relative flex-center',
			currentAspectRatio === '9:16'
				? 'min-h-[100vh] aspect-[9/16] -translate-y-0'
				: 'h-auto aspect-[16/9]',
			deviceInfo?.device?.type === 'smartphone' && '-translate-y-[2em]'
		)}
	>
		<!-- show the video element when in view -->
		{#if currentVideoId === highlight?.playback?.id && currentVideoId}
			<video
				bind:this={videoElement}
				class={cn(
					'w-full h-full min-h-[450px] object-cover bg-dark-100'
					// $feedStore.isInitialVideoLoading ? 'hidden' : 'flex'
				)}
				playsinline
				preload="auto"
				{muted}
				loop={true}
				width="640"
				height="360"
				autoplay
				poster={highlight?.thumbnail?.main || highlight?.thumbnail?.fallback}
				on:loadstart={handleLoadStart}
				on:canplay={handleCanPlay}
				on:waiting={handleWaiting}
				on:playing={handlePlaying}
				on:timeupdate={updateCaptions}
				on:error={(e) => {
					console.log('Video error: ', e);
				}}
				on:ended={resetCaptions}
				on:seeked={resetCaptions}
			>
				<source src={highlight?.playback?.mlbVideoUrl} type="video/mp4" />
				<!-- <source src={DEBUG_MODE_VIDEO_URL} type="video/mp4" /> -->
			</video>
		{/if}

		<!-- caption container -->
		<div
			class="w-full h-auto absolute bottom-3 left-0 flex flex-row items-center justify-center px-4"
		>
			{#if currentCaption && showCaption}
				<span
					class="text-sm px-2 py-1 rounded-sm bg-dark-100/60 backdrop-blur-md text-center font-poppins"
				>
					{currentCaption}
				</span>
			{/if}
		</div>

		<!-- Main Minor Video Control -->
		<div
			class={cn(
				'w-full h-auto px-4 py-3 z-[10] absolute top-0 right-0 flex flex-row items-center justify-between'
				// $feedStore.isInitialVideoLoading ? 'hidden' : 'flex'
			)}
		>
			<Flex className="w-auto flex items-center justify-center gap-2 relative">
				<button
					class="w-8 h-8 rounded bg-none backdrop-blurrr-xs text-white-100 text-sm hover:bg-white-100/40 flex-center"
					on:click={() => {
						muted = !muted;
						if (videoElement) {
							videoElement.muted = muted;
						}
					}}
				>
					{#if muted}
						<VolumeX size={18} />
					{:else}
						<Volume2 size={18} />
					{/if}
				</button>

				<button
					class="w-8 h-8 rounded bg-none backdrop-blurrr-xs text-white-100 text-sm hover:bg-white-100/40 flex-center enableBounceEffect"
					on:click={() => {
						showVideoSettings = !showVideoSettings;
					}}
				>
					<Cog size={18} />
				</button>

				<!-- settings container -->
				{#if showVideoSettings}
					<div
						class="w-auto min-w-[200px] h-auto absolute top-10 left-0 bg-white-100/50 backdrop-blur-md rounded-sm p-2"
					>
						<Flex className="w-full h-full flex-col items-start justify-start gap-1">
							<select
								name=""
								id=""
								class="w-full h-auto text-xs bg-transparent ring-0 outline-none border-none focus:border-none focus:ring-0"
								on:change={(e) => {
									showVideoSettings = false;
									// @ts-expect-error
									const lang = e.target.value;
									const transcript = videoTranscript?.find(
										(transcript) => transcript.lang === lang
									);
									if (!transcript) {
										toast.error('language not available');
										return;
									}

									if (!showCaption) showCaption = true;
									selectedSubtitleLanguage = lang;
								}}
								value={selectedSubtitleLanguage}
								disabled={!isTranscriptAvailable}
							>
								{#each Object.entries(SUPPORTED_PLAYBACK_SUBTITLE_LANGUAGES_MAP) as [key, value]}
									<option value={key}>{value}</option>
								{/each}
							</select>
							<Divider className="h-[1px] bg-dark-100/10" />
						</Flex>
					</div>
				{/if}
			</Flex>

			<button
				class={cn(
					'w-6 h-6 rounded bg-none backdrop-blur-xs text-white-100 text-sm bg-white-100/40 flex-center enableBounceEffect',
					!isTranscriptAvailable && 'opacity-70',
					showCaption && 'bg-brown-100 text-dark-100'
				)}
				on:click={() => {
					showCaption = !showCaption;
				}}
				disabled={!isTranscriptAvailable}
			>
				{#if isTranscriptAvailable}
					<Captions size={18} />
				{:else}
					<CaptionsOff size={18} />
				{/if}
			</button>
			<!-- Aspect ratio toggle -->
			<!-- <button
				class="top-4 px-3 py-1 rounded bg-white-100/30 backdrop-blurr-md text-white-100 text-sm hover:bg-white-100/40"
				on:click={toggleAspectRatio}
			>
				{currentAspectRatio}
			</button> -->
		</div>

		<!-- Loading/Buffering Overlay -->
		{#if $feedStore.isInitialVideoLoading || $feedStore.videoBuffering}
			<div
				class={'absolute inset-0 z-[3] flex-center ' +
					($feedStore.videoBuffering && !$feedStore.isInitialVideoLoading
						? 'bg-dark-103/30 backdrop-blurr-sm'
						: '')}
			>
				<Spinner size={'40'} />
			</div>
		{/if}

		<!-- play button -->
		{#if !$feedStore.isInitialVideoLoading}
			<Flex class="w-full h-full flex-center absolute inset-0 group">
				<button
					class={cn(
						'w-[70px] h-[70px] rounded-full bg-white-100/30 flex-center backdrop-blurr-md enableBounceEffect transition ease-in-out duration-500',
						$feedStore.videoPlaying && !$feedStore.videoPaused ? 'opacity-0' : 'opacity-100',
						'group-hover:opacity-100'
					)}
					on:click={() => {
						if ($feedStore.videoPlaying) {
							videoElement.pause();
							feedStore.setVideoPaused(true);
							feedStore.setVideoPlaying(false);
						} else {
							videoElement.play();
							if (muted) {
								muted = false;
								videoElement.muted = false;
							}
							feedStore.setVideoPaused(false);
							feedStore.setVideoPlaying(true);
						}
					}}
				>
					{#if !$feedStore.videoPlaying}
						<Play size={35} class="stroke-white-100 fill-white-100" />
					{:else}
						<Pause size={35} class="stroke-white-100 fill-white-100" />
					{/if}
				</button>
			</Flex>
		{/if}
	</div>

	<!-- playback metadata (description) -->
	<div
		class={cn(
			'w-full h-auto max-h-[200px] px-4 py-6 z-[10] absolute bottom-[2em] sm:bottom-[2em] xs:bottom-[2em] flex flex-col items-end justify-end',
			isSafariMobile && '-translate-y-[5em]'
		)}
	>
		<Flex className="w-full h-auto flex-col items-start justify-start gap-1">
			<!-- team info -->
			<h1 class="text-white-100 font-poppins font-semibold text-sm">
				<!-- {highlight?.game?.home_team?.name} & {highlight?.game?.away_team?.name} -->
				{highlight?.playback?.title}
			</h1>
			<span
				class={cn(
					'text-white-100 font-poppins font-normal text-xs',
					(highlight?.playback?.description ?? '')?.length > MAX_DESCRIPTION_LENGTH &&
						'line-clamp-2'
				)}
			>
				{(highlight?.playback?.description ?? '').length > MAX_DESCRIPTION_LENGTH
					? (highlight?.playback?.description ?? '').slice(0, MAX_DESCRIPTION_LENGTH) + '...'
					: highlight?.playback?.description}
			</span>
		</Flex>
	</div>
</div>

<EngagementBar
	likesCount={highlight?.likes}
	youLiked={highlight?.youLiked}
	viewsCount={highlight?.views}
	teams={{
		img: [
			getTeamLogoWithBg(highlight?.game?.away_team?.id),
			getTeamLogoWithBg(highlight?.game?.home_team?.id)
		]
	}}
	onInsight={() => {
		feedStore.toggleShowBottomSheet(true);
		// if ($feedStore.videoPlaying) videoElement.pause();
		videoElement.pause();
	}}
	toggleLike={() => {
		handleLikeToggle();
	}}
/>

<style>
	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
