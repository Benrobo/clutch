<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { sampleHighlights } from '@/data/highlights';
	import HighlightVideo from '@/modules/discover/components/highlight-video.svelte';
	import EngagementBar from '@/modules/discover/components/EngagementBar.svelte';
	import { onMount } from 'svelte';

	const higlights = sampleHighlights;
</script>

<div class="w-full h-full flex items-center justify-center">
	<div class="w-full h-full max-w-[600px] relative">
		<div class="w-full h-full highlight-videos-container overflow-y-auto hideScrollBar2">
			{#each higlights as hl}
				<div class="w-full h-full snap-start snap-always">
					<HighlightVideo
						{hl}
						last_video_id={higlights[higlights.length - 1]?.id}
						onObServedDataId={(id) => {
							// refetch new video based on the last observed id
						}}
					/>
				</div>
			{/each}
		</div>
	</div>
</div>

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
