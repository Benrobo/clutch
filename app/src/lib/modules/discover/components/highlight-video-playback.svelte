<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Spinner from '@/components/Spinner.svelte';
	import { useBrowser } from '@/hooks/useBrowser';
	import type { Highlight } from '@/types/highlights';
	import { cn, getTeamLogoWithBg } from '@/utils';
	import { Pause, Play, Volume, Volume2, VolumeX } from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';
	import EngagementBar from './EngagementBar.svelte';

	type AspectRatio = '9:16' | '16:9';
	let currentAspectRatio: AspectRatio = '16:9';

	let videoElement: HTMLVideoElement;
	let containerRef: HTMLDivElement;
	let observer: IntersectionObserver;

	let isInitialLoading = true;
	let isBuffering = false;
	let videoPaused = true;
	let isVideoPlaying = false;
	let muted = true;

	$: isSafariMobile = false;

	const MAX_DESCRIPTION_LENGTH = 30;

	$: loadingState = {
		isInitialLoading,
		isBuffering,
		isPaused: videoPaused,
		isPlaying: isVideoPlaying,
		showSpinner: isInitialLoading || isBuffering,
		hideVideo: isInitialLoading,
		showPlayButton: !isInitialLoading,
		showBufferingOverlay: isBuffering && !isInitialLoading
	};

	function toggleAspectRatio() {
		currentAspectRatio = currentAspectRatio === '9:16' ? '16:9' : '9:16';
	}

	function handleLoadStart() {
		isInitialLoading = true;
		isBuffering = false;
	}

	function handleCanPlay() {
		isInitialLoading = false;
		isBuffering = false;
	}

	function handleWaiting() {
		isBuffering = true;
	}

	function handlePlaying() {
		isInitialLoading = false;
		isBuffering = false;
	}

	function handleVisibilityChange(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const vidDataId = entry.target.getAttribute('data-id');
				onObServedDataId(vidDataId);
				if (videoElement && videoPaused) {
					videoElement.play();
					videoPaused = false;
					isVideoPlaying = true;
				}
			} else {
				if (videoElement && !videoPaused) {
					videoElement.pause();
					videoPaused = true;
					isVideoPlaying = false;
				}
			}
		});
	}

	const checkBrowser = () => {
		const { isSafari, isMobile } = useBrowser();
		isSafariMobile = isSafari && isMobile;
	};

	onMount(() => {
		checkBrowser();
		window.addEventListener('resize', checkBrowser);
		return () => window.removeEventListener('resize', checkBrowser);
	});

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

	export let highlight: Highlight | null = null;
	export let videoUrl: string | undefined = undefined;
	export let thumbnailUrl: string | undefined = undefined;
	export let title: string | undefined = undefined;
	export let last_video_id: string | null = null;
	export let onObServedDataId: (id: string | null) => void = () => {};
</script>

<div bind:this={containerRef} data-id={highlight?.id} class="w-full h-full relative flex-center">
	<div
		class={cn(
			'w-full relative flex-center',
			currentAspectRatio === '9:16'
				? 'min-h-[100vh] aspect-[9/16] -translate-y-0'
				: 'h-auto aspect-[16/9] mt-[10vh] -translate-y-[6em]'
		)}
	>
		<video
			bind:this={videoElement}
			src={videoUrl}
			class={cn('w-full h-full object-cover', loadingState.isInitialLoading ? 'hidden' : 'block')}
			preload="metadata"
			playsinline
			muted={true}
			on:loadstart={handleLoadStart}
			on:canplay={handleCanPlay}
			on:waiting={handleWaiting}
			on:playing={handlePlaying}
		>
			<track kind="captions" src="" label="English" srclang="en" default />
			Your browser does not support the video tag.
		</video>

		<!-- Main Minor Video Control -->
		<div
			class={cn(
				'w-full h-auto px-4 py-3 z-[10] absolute top-0 right-0 flex flex-row items-center justify-between',
				loadingState.isInitialLoading ? 'hidden' : 'flex'
			)}
		>
			<button
				class="w-8 h-8 rounded bg-none backdrop-blur-xs text-white-100 text-sm hover:bg-white-100/40 flex-center"
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
			<button
				class="top-4 px-3 py-1 rounded bg-white-100/30 backdrop-blur-md text-white-100 text-sm hover:bg-white-100/40"
				on:click={toggleAspectRatio}
			>
				{currentAspectRatio}
			</button>
		</div>

		<!-- Loading/Buffering Overlay -->
		{#if loadingState.showSpinner}
			<div
				class={'absolute inset-0 z-[3] flex-center ' +
					(loadingState.isBuffering && !loadingState.isInitialLoading
						? 'bg-dark-103/30 backdrop-blur-sm'
						: '')}
			>
				<Spinner size={'40'} />
			</div>
		{/if}

		<!-- play button -->
		{#if loadingState.showPlayButton}
			<Flex class="w-full h-full flex-center absolute inset-0 group">
				<button
					class={cn(
						'w-[70px] h-[70px] rounded-full bg-white-100/30 flex-center backdrop-blur-md enableBounceEffect transition ease-in-out duration-500',
						loadingState.isPlaying ? 'opacity-0 duration-500' : 'opacity-100 duration-100',
						'group-hover:opacity-100'
					)}
					on:click={() => {
						videoPaused ? videoElement.play() : videoElement.pause();
						videoPaused = !videoPaused;
						isVideoPlaying = !isVideoPlaying;
					}}
				>
					{#if loadingState.isPaused}
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
			'w-full h-auto max-h-[100px] px-4 py-6 z-[10] absolute bottom-[5em]',
			isSafariMobile && '-translate-y-[5em]'
		)}
	>
		<Flex className="w-full h-auto flex-col items-start justify-start gap-1">
			<!-- team info -->
			<h1 class="text-white-100 font-poppins font-semibold text-sm">
				{highlight?.game?.home_team?.name} & {highlight?.game?.away_team?.name}
			</h1>
			<span class="text-white-100 font-poppins font-normal text-xs">
				{highlight?.playback?.description}
			</span>
		</Flex>
	</div>
</div>

<EngagementBar
	likesCount={highlight?.likes}
	youLiked={highlight?.youLiked}
	viewsCount={0}
	teams={{
		img: [
			// @ts-expect-error
			getTeamLogoWithBg(highlight?.game?.away_team?.id),
			// @ts-expect-error
			getTeamLogoWithBg(highlight?.game?.home_team?.id)
		]
	}}
/>

<style>
	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
