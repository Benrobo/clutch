<script lang="ts">
	import Flex from '@/components/Flex.svelte';
	import { sampleHighlights } from '@/data/highlights';
	import HighlightVideo from '@/modules/discover/components/highlight-video.svelte';
	import { onMount } from 'svelte';

	const higlights = sampleHighlights;
</script>

<div class="fixed inset-0 flex items-center justify-center">
	<div class="w-full h-full max-w-[600px] relative">
		<div
			class="w-full h-full highlight-videos-container overflow-y-auto snap-y snap-mandatory hideScrollBar3"
		>
			{#each higlights as hl}
				<HighlightVideo {hl} />
			{/each}
		</div>
	</div>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}

	.highlight-videos-container {
		/* scroll-padding-top: 20px; */
	}
</style>
