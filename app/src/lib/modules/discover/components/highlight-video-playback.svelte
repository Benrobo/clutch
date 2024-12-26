<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Spinner from '@/components/Spinner.svelte';
	import { cn, getTeamLogoWithBg } from '@/utils';
	import { Pause, Play, Volume2, VolumeX } from 'lucide-svelte';
	import { onMount, onDestroy, afterUpdate } from 'svelte';
	import EngagementBar from './EngagementBar.svelte';
	import useDetectDevice from '$lib/hooks/useDetectDevice';
	import { useFeedStore } from '@/store/feed.store';
	import { useUrlParams } from '@/hooks/useUrlParams';
	import type { RecommendationData } from '@/types/recommendation';

	export let highlight: RecommendationData | null = null;
	export let videoUrl: string | undefined = undefined;
	export let thumbnailUrl: string | undefined = undefined;
	export let title: string | undefined = undefined;
	export let last_video_id: string | null = null;
	export let onObServedDataId: (id: string | null) => void = () => {};

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

	$: if (videoElement && $feedStore) {
		handleVideoState();
	}

	$: isSafariMobile = false;

	const MAX_DESCRIPTION_LENGTH = 50;
	const DEBUG_MODE_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

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
			'w-full relative flex-center',
			currentAspectRatio === '9:16'
				? 'min-h-[100vh] aspect-[9/16] -translate-y-0'
				: 'h-auto aspect-[16/9] mt-[10vh] -translate-y-[10em]',
			deviceInfo?.device?.type === 'smartphone' && '-translate-y-[10em]'
		)}
	>
		<video
			bind:this={videoElement}
			class={cn('w-full h-full object-cover', $feedStore.isInitialVideoLoading ? 'hidden' : 'flex')}
			preload="auto"
			muted={true}
			loop={true}
			width="640"
			height="360"
			on:loadstart={handleLoadStart}
			on:canplay={handleCanPlay}
			on:waiting={handleWaiting}
			on:playing={handlePlaying}
			on:timeupdate={() => {}}
			poster={highlight?.thumbnail?.main || highlight?.thumbnail?.fallback}
		>
			<!-- <source src={videoUrl} type="video/mp4" /> -->
			<source src={DEBUG_MODE_VIDEO_URL} type="video/mp4" />
		</video>

		<!-- Main Minor Video Control -->
		<div
			class={cn(
				'w-full h-auto px-4 py-3 z-[10] absolute top-0 right-0 flex flex-row items-center justify-between',
				$feedStore.isInitialVideoLoading ? 'hidden' : 'flex'
			)}
		>
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
						$feedStore.videoPlaying ? 'opacity-0 duration-500' : 'opacity-100 duration-100',
						$feedStore.videoPaused && 'opacity-100',
						'group-hover:opacity-100'
					)}
					on:click={() => {
						if ($feedStore.videoPlaying) {
							videoElement.pause();
						} else {
							videoElement.play();
						}
						feedStore.setVideoPaused(!$feedStore.videoPaused);
						feedStore.setVideoPlaying(!$feedStore.videoPlaying);
					}}
				>
					{#if $feedStore.videoPaused}
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
			'w-full h-auto max-h-[100px] px-4 py-6 z-[10] absolute bottom-[4.2em] sm:bottom-[4.2em] xs:bottom-[5em]',
			isSafariMobile && '-translate-y-[5em]'
		)}
	>
		<Flex className="w-full h-auto flex-col items-start justify-start gap-1">
			<!-- team info -->
			<h1 class="text-white-100 font-poppins font-semibold text-sm">
				<!-- {highlight?.game?.home_team?.name} & {highlight?.game?.away_team?.name} -->
				{highlight?.playback?.title}
			</h1>
			<span class="text-white-100 font-poppins font-normal text-xs">
				{(highlight?.playback?.description ?? '')?.length > MAX_DESCRIPTION_LENGTH
					? highlight?.playback?.description?.slice(0, MAX_DESCRIPTION_LENGTH) + '.......'
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
/>

<style>
	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
