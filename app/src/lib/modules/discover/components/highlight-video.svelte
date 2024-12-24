<script lang="ts">
	import type { Highlight } from '@/types/highlights';
	import HighlightVideoPlayback from './highlight-video-playback.svelte';

	export let hl: Highlight | null = null;
</script>

<div
	data-hl_id={hl?.id}
	class="highlight-video w-full h-full min-h-screen snap-start snap-always flex-shrink-0 relative"
>
	<!-- thumbnail -->
	<div class="w-full h-full absolute inset-0 z-[1]">
		<img
			src={hl?.thumbnail?.fallback}
			alt={hl?.playback?.title}
			class="w-full h-full object-cover"
		/>
	</div>

	<!-- main video section -->
	<div
		class="absolute inset-0 z-[2] backdrop-blur-md bg-dark-103/30 flex flex-col items-center justify-start"
	>
		<HighlightVideoPlayback
			highlight={hl}
			videoUrl={hl?.playback?.mlbVideoUrl}
			thumbnailUrl={hl?.thumbnail?.fallback}
			title={hl?.playback?.title}
		/>

		<!-- video controls -->
	</div>
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
	}
</style>
