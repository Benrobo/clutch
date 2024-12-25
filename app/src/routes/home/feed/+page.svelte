<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { sampleHighlights } from '@/data/highlights';
	import HighlightVideo from '@/modules/discover/components/highlight-video.svelte';
	import EngagementBar from '@/modules/discover/components/EngagementBar.svelte';
	import { onMount } from 'svelte';
	import { cn, getTeamLogoWithBg } from '@/utils';
	import useDetectDevice from '@/hooks/useDetectDevice';
	import BottomSheet from '@/components/BottomSheet.svelte';
	import { useFeedStore } from '@/store/feed.store';
	import AiButton from '@/components/AIButton.svelte';

	let activeFeed: 'for-you' | 'explore' = 'for-you';
	$: activeFeed = 'for-you';
	$: feedStore = useFeedStore();

	let observedPlaybackId: string | null = null;
	$: observedPlaybackId = null;

	const deviceInfo = useDetectDevice();

	const higlights = sampleHighlights;
</script>

<div class="w-full h-full flex items-center justify-center">
	<div class="w-full h-full max-w-[600px] relative">
		<!-- header -->
		<div
			class={cn(
				'w-full h-auto fixed top-0 left-0 z-[100]',
				deviceInfo?.device?.type === 'smartphone' ? 'py-3 scale-[.90] -translate-x-4' : 'py-3'
			)}
		>
			<Flex className="w-full max-w-[600px] mx-auto h-auto justify-between px-4">
				<div class="w-auto flex items-start justify-start bg-gray-101/30 rounded-md">
					{#each ['for-you', 'explore'] as feed}
						<button
							class={cn(
								'h-full flex flex-row items-center justify-start gap-2 px-3 py-[8px] rounded-sm text-xs font-poppins transition-all text-white-300/50',
								activeFeed === feed && 'bg-red-303 text-white-100'
							)}
							on:click={() => {
								// @ts-expect-error
								activeFeed = feed;
							}}
						>
							{#if feed === 'for-you'}
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
									><path
										fill="currentColor"
										d="M6 17c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6m9-9a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2"
									/></svg
								>
								<span>For You</span>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
									><circle cx="6.18" cy="17.82" r="2.18" fill="currentColor" /><path
										fill="currentColor"
										d="M5.59 10.23c-.84-.14-1.59.55-1.59 1.4c0 .71.53 1.28 1.23 1.4c2.92.51 5.22 2.82 5.74 5.74c.12.7.69 1.23 1.4 1.23c.85 0 1.54-.75 1.41-1.59a9.89 9.89 0 0 0-8.19-8.18m-.03-5.71C4.73 4.43 4 5.1 4 5.93c0 .73.55 1.33 1.27 1.4c6.01.6 10.79 5.38 11.39 11.39c.07.73.67 1.28 1.4 1.28c.84 0 1.5-.73 1.42-1.56c-.73-7.34-6.57-13.19-13.92-13.92"
									/></svg
								>
								<span>Explore</span>
							{/if}
						</button>
					{/each}
				</div>
				<!-- <div>profile</div> -->
				<div />
			</Flex>
		</div>

		<div class="w-full h-full highlight-videos-container overflow-y-auto hideScrollBar2">
			{#each higlights as hl}
				<div class="w-full h-full snap-start snap-always">
					<HighlightVideo
						{hl}
						last_video_id={higlights[higlights.length - 1]?.id}
						onObServedDataId={(id) => {
							observedPlaybackId = id;
						}}
					/>
				</div>
			{/each}
		</div>
	</div>
</div>

{#if observedPlaybackId}
	{@const highlight = higlights.find((hl) => hl.id === observedPlaybackId)}

	<BottomSheet
		isOpen={$feedStore?.showBottomSheet}
		onClose={() => {
			feedStore.toggleShowBottomSheet(false);
			feedStore.setVideoPlaying(false);
		}}
		headline="Play Insights"
		tagline=""
		className="h-auto"
		showBackdrop={$feedStore?.showBottomSheet}
	>
		<div class="p-1 flex flex-col gap-6">
			<!-- team versus -->
			<Flex className={cn('w-full h-auto items-center justify-between gap-5')}>
				<!-- svelte-ignore a11y-missing-attribute -->
				<Flex className={'flex-col items-center justify-center text-center'}>
					<img
						src={getTeamLogoWithBg(highlight?.game?.home_team?.id)}
						class="w-[70px] h-[70px] rounded-full"
					/>
					<p class="text-dark-100 font-brunoace font-semibold text-sm">
						{highlight?.game?.home_team?.name}
					</p>
				</Flex>

				<h1 class="text-dark-106/30 font-recoleta font-bold text-[2em]">Vs</h1>

				<Flex className={'flex-col items-center justify-center text-center'}>
					<!-- svelte-ignore a11y-missing-attribute -->
					<img
						src={getTeamLogoWithBg(highlight?.game?.away_team?.id)}
						class="w-[70px] h-[70px] rounded-full"
					/>
					<p class="text-dark-100 font-brunoace font-semibold text-sm">
						{highlight?.game?.away_team?.name}
					</p>
				</Flex>
			</Flex>

			<!-- playback description -->
			<p class="text-xs text-dark-100/80 font-poppins">
				{highlight?.playback?.description}
			</p>

			<!-- Score & Count -->
			<!-- <div class="flex items-center justify-between bg-dark-103/5 p-3 rounded-lg">
			<span class="text-dark-100 font-medium">Yankees 3, Red Sox 2</span>
			<span class="text-dark-100/60">Count: 2-2</span>
		</div> -->

			<!-- Pitch Speed -->
			<!-- <div class="bg-dark-103/5 p-3 rounded-lg">
			<span class="text-dark-100/60 text-sm">Pitch Speed</span>
			<div class="text-dark-100 font-semibold text-lg">97 MPH</div>
		</div> -->

			<!-- Play Description -->
			<!-- <div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<h4 class="text-dark-100 font-medium">Highlight</h4>
				<p class="text-dark-100 text-lg leading-snug">
					Judge crushes a towering home run to deep left field, giving the Yankees the lead in a
					crucial moment.
				</p>
			</div>

			<div class="flex flex-col gap-2">
				<h4 class="text-dark-100 font-medium">Play Details</h4>
				<p class="text-dark-100/80 leading-relaxed">
					With a runner on first, Aaron Judge steps up to face Chris Sale. On a 2-2 count, Sale
					delivers a fastball that Judge drives deep to left field for a two-run homer, putting the
					Yankees ahead 3-2 in the seventh.
				</p>
			</div>
		</div> -->

			<!-- AI Button -->
			<div class="flex justify-center mt-2">
				<AiButton
					onClick={() => {
						setTimeout(() => {
							// bottomSheetOpen = false;
							// videoElement.play();
						}, 200);
					}}
				/>
			</div>
		</div>
	</BottomSheet>
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
