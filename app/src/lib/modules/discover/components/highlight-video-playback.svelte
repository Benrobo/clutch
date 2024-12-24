<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import Spinner from '@/components/Spinner.svelte';
	import type { Highlight } from '@/types/highlights';
	import { cn } from '@/utils';
	import { Pause, Play } from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';

	export let highlight: Highlight | null = null;
	export let videoUrl: string | undefined = undefined;
	export let thumbnailUrl: string | undefined = undefined;
	export let title: string | undefined = undefined;

	type AspectRatio = '9:16' | '16:9';
	let currentAspectRatio: AspectRatio = '16:9';

	let videoElement: HTMLVideoElement;
	let containerRef: HTMLDivElement;
	let observer: IntersectionObserver;

	let isInitialLoading = true;
	let isBuffering = false;
	let videoPaused = true;
	let isVideoPlaying = false;

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

<div bind:this={containerRef} class="w-full h-full relative flex-center">
	<div
		class={cn(
			'w-full relative flex-center ',
			currentAspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]'
		)}
	>
		<video
			bind:this={videoElement}
			src={videoUrl}
			class="w-full h-full object-cover {loadingState.isInitialLoading ? 'hidden' : 'block'}"
			preload="metadata"
			playsinline
			muted={false}
			on:loadstart={handleLoadStart}
			on:canplay={handleCanPlay}
			on:waiting={handleWaiting}
			on:playing={handlePlaying}
		>
			<track kind="captions" src="" label="English" srclang="en" default />
			Your browser does not support the video tag.
		</video>

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

		<!-- Aspect ratio toggle -->
		<button
			class="absolute top-4 right-4 z-10 px-3 py-1 rounded bg-white-100/30 backdrop-blur-md text-white-100 text-sm hover:bg-white-100/40"
			on:click={toggleAspectRatio}
		>
			{currentAspectRatio}
		</button>
	</div>
</div>

<style>
	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
